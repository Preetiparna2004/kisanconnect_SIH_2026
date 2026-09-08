import React, { useState } from 'react'
import { aiService } from '../services/aiService'
import { BarChart2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import toast from 'react-hot-toast'

const CROPS = ['Rice','Maize','Wheat','Chickpea','Tomato','Onion','Potato','Banana','Mango','Cotton','Sugarcane','Turmeric']

export default function DemandForecast() {
  const [crop, setCrop] = useState('Rice')
  const [days, setDays] = useState(30)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await aiService.forecastDemand({ crop_name: crop, days })
      setResult(data)
    } catch {
      toast.error('Forecast unavailable. Ensure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const chartData = result?.forecast?.map((f, i) => ({
    day: i + 1,
    price: f.price_per_kg,
    demand: f.estimated_demand_tonnes,
    date: f.date,
  }))

  const TrendIcon = result?.trend?.includes('📈') ? TrendingUp :
                    result?.trend?.includes('📉') ? TrendingDown : Minus
  const trendColor = result?.trend?.includes('📈') ? 'text-green-600' :
                     result?.trend?.includes('📉') ? 'text-red-500' : 'text-gray-500'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
          <BarChart2 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="section-title">Demand Forecast</h1>
          <p className="text-gray-500 text-sm">AI-driven price & demand predictions for market planning</p>
        </div>
      </div>

      {/* Controls */}
      <div className="kc-card p-5 mb-8 flex flex-wrap items-end gap-4">
        <div>
          <label className="kc-label">Select Crop</label>
          <select id="forecast-crop" value={crop} onChange={(e) => setCrop(e.target.value)} className="kc-select w-48">
            {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="kc-label">Forecast Period</label>
          <select id="forecast-days" value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="kc-select w-36">
            {[7, 14, 30, 60, 90].map((d) => <option key={d} value={d}>{d} days</option>)}
          </select>
        </div>
        <button onClick={submit} disabled={loading} className="btn-primary py-3 px-6">
          {loading ? <><span className="spinner" /> Forecasting…</> : <><BarChart2 className="w-4 h-4" /> Run Forecast</>}
        </button>
      </div>

      {result && (
        <div className="animate-slide-up space-y-6">
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="kc-card p-5 bg-green-50">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Average Price</p>
              <p className="text-3xl font-bold text-green-700 mt-1">₹{result.avg_price}</p>
              <p className="text-xs text-gray-400">per kg over {days} days</p>
            </div>
            <div className="kc-card p-5 bg-blue-50">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Market Trend</p>
              <div className={`flex items-center gap-2 mt-1 ${trendColor}`}>
                <TrendIcon className="w-6 h-6" />
                <p className="text-xl font-bold">{result.trend?.replace(/📈|📉|↔/g, '').trim()}</p>
              </div>
            </div>
            <div className="kc-card p-5 bg-amber-50">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Crop</p>
              <p className="text-3xl font-bold text-amber-700 mt-1">{result.crop_name}</p>
              <p className="text-xs text-gray-400">{days}-day analysis</p>
            </div>
          </div>

          {/* Price Chart */}
          <div className="kc-card p-6">
            <h3 className="font-bold text-gray-800 mb-5">Price Forecast (₹/kg)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -2 }} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val, name) => [name === 'price' ? `₹${val.toFixed(2)}/kg` : `${val}T`, name === 'price' ? 'Price' : 'Demand']}
                  labelFormatter={(l) => `Day ${l}`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #dcfce7' }}
                />
                <Line type="monotone" dataKey="price" stroke="#15803d" strokeWidth={2.5} dot={false} />
                <ReferenceLine y={result.avg_price} stroke="#d97706" strokeDasharray="5 5" label={{ value: 'Avg', fontSize: 11, fill: '#d97706' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Demand Table */}
          <div className="kc-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-800">Forecast Detail (First 10 Days)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-50 text-green-800">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold">Date</th>
                    <th className="text-right px-5 py-3 font-semibold">Price (₹/kg)</th>
                    <th className="text-center px-5 py-3 font-semibold">Demand Level</th>
                    <th className="text-right px-5 py-3 font-semibold">Est. Volume (T)</th>
                    <th className="text-right px-5 py-3 font-semibold">Change %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {result.forecast.slice(0, 10).map((row) => (
                    <tr key={row.date} className="hover:bg-green-50/30 transition-colors">
                      <td className="px-5 py-3 text-gray-600">{new Date(row.date).toLocaleDateString('en-IN')}</td>
                      <td className="px-5 py-3 text-right font-bold text-green-700">₹{row.price_per_kg}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`badge ${row.demand === 'High' ? 'badge-green' : row.demand === 'Medium' ? 'badge-yellow' : 'badge-red'}`}>
                          {row.demand}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">{row.estimated_demand_tonnes}</td>
                      <td className={`px-5 py-3 text-right font-medium ${row.change_pct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {row.change_pct >= 0 ? '+' : ''}{row.change_pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-20 text-gray-400">
          <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-20 animate-pulse-slow" />
          <p className="text-lg font-medium">Select a crop and run the forecast</p>
        </div>
      )}
    </div>
  )
}
