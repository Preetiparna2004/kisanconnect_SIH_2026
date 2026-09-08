import React, { useState } from 'react'
import { aiService } from '../services/aiService'
import { Brain, Leaf, Info, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const INPUTS = [
  { name: 'nitrogen',    label: 'Nitrogen (N)',    unit: 'kg/ha', min: 0, max: 200, step: 1,   default: 80 },
  { name: 'phosphorus',  label: 'Phosphorus (P)',  unit: 'kg/ha', min: 0, max: 200, step: 1,   default: 40 },
  { name: 'potassium',   label: 'Potassium (K)',   unit: 'kg/ha', min: 0, max: 200, step: 1,   default: 40 },
  { name: 'ph',          label: 'Soil pH',         unit: '',      min: 3, max: 10,  step: 0.1, default: 6.5 },
  { name: 'rainfall',    label: 'Annual Rainfall', unit: 'mm',    min: 0, max: 400, step: 10,  default: 200 },
  { name: 'temperature', label: 'Temperature',     unit: '°C',    min: 5, max: 50,  step: 0.5, default: 25 },
  { name: 'humidity',    label: 'Humidity',        unit: '%',     min: 0, max: 100, step: 1,   default: 70 },
]

const CONFIDENCE_COLOR = (v) => v >= 70 ? 'text-green-700' : v >= 40 ? 'text-amber-600' : 'text-red-600'

export default function AIRecommendation() {
  const [form, setForm] = useState(Object.fromEntries(INPUTS.map((i) => [i.name, i.default])))
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: parseFloat(e.target.value) })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await aiService.recommendCrops(form)
      setResult(data)
    } catch (err) {
      const detail = err.response?.data?.detail
      toast.error(detail || (err.response
        ? 'The AI model could not process these values.'
        : 'Cannot reach the backend. Start the API on port 8000 and try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="section-title">AI Crop Advisor</h1>
        </div>
        <p className="section-subtitle">Enter your soil and climate data to get ML-powered crop recommendations</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="kc-card p-7">
          <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" /> Soil & Climate Parameters
          </h2>
          <form onSubmit={submit} className="space-y-5">
            {INPUTS.map((inp) => (
              <div key={inp.name}>
                <div className="flex justify-between mb-1.5">
                  <label htmlFor={`ai-${inp.name}`} className="kc-label mb-0">
                    {inp.label} {inp.unit && <span className="text-gray-400 font-normal">({inp.unit})</span>}
                  </label>
                  <span className="text-green-700 font-bold text-sm">{form[inp.name]}{inp.unit}</span>
                </div>
                <input
                  id={`ai-${inp.name}`}
                  type="range"
                  name={inp.name}
                  min={inp.min}
                  max={inp.max}
                  step={inp.step}
                  value={form[inp.name]}
                  onChange={handle}
                  className="w-full accent-green-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{inp.min}{inp.unit}</span>
                  <span>{inp.max}{inp.unit}</span>
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-4">
              {loading ? <span className="spinner" /> : <Brain className="w-5 h-5" />}
              {loading ? 'Analyzing…' : 'Get AI Recommendations'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div>
          {!result ? (
            <div className="kc-card p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px] bg-purple-50/30">
              <Brain className="w-20 h-20 text-purple-200 mb-4 animate-pulse-slow" />
              <h3 className="font-bold text-gray-600 text-lg mb-2">AI Ready</h3>
              <p className="text-gray-400 max-w-xs">
                Enter soil nutrients, pH, rainfall, and temperature on the left to receive personalized crop suggestions.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up">
              <div className="kc-card p-5 bg-purple-50/50">
                <p className="text-sm font-medium text-purple-700 mb-1">Model Confidence</p>
                <p className={`text-3xl font-bold font-display ${CONFIDENCE_COLOR(result.model_confidence)}`}>
                  {result.model_confidence}%
                </p>
              </div>

              <h3 className="font-bold text-green-900 text-lg px-1">Top Recommended Crops</h3>
              {result.recommendations.map((rec, idx) => (
                <div key={rec.crop} className={`kc-card p-5 border-l-4 ${idx === 0 ? 'border-green-600' : idx === 1 ? 'border-amber-400' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm
                        ${idx === 0 ? 'bg-green-600' : idx === 1 ? 'bg-amber-500' : 'bg-gray-400'}`}>
                        #{rec.rank}
                      </span>
                      <div>
                        <h4 className="font-bold text-gray-900">{rec.crop}</h4>
                        <p className={`text-sm font-semibold ${CONFIDENCE_COLOR(rec.confidence)}`}>{rec.confidence}% match</p>
                      </div>
                    </div>
                    {idx === 0 && <span className="badge badge-green">✨ Best Match</span>}
                  </div>
                  {/* Confidence bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${rec.confidence}%` }} />
                  </div>
                  {rec.ideal_conditions && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {Object.entries(rec.ideal_conditions).slice(0, 6).map(([k, v]) => (
                        <div key={k} className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-gray-400">{k}</p>
                          <p className="text-xs font-bold text-gray-700">{v}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
