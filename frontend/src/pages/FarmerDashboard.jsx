import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cropService } from '../services/cropService'
import { orderService } from '../services/orderService'
import StatCard from '../components/StatCard'
import { Leaf, Package, TrendingUp, Star, Plus, ArrowRight, Edit2, Clock, CheckCircle, XCircle, MapPin, Navigation } from 'lucide-react'
import { mockCrops } from '../data/mockCrops'

export default function FarmerDashboard() {
  const { user } = useAuth()
  const [crops, setCrops] = useState(mockCrops.slice(0, 3))
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('listings')
  const [selectedOrders, setSelectedOrders] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, oRes] = await Promise.all([
          cropService.myListings(),
          orderService.farmerIncoming(),
        ])
        if (Array.isArray(cRes?.data) && cRes.data.length > 0) setCrops(cRes.data)
        setOrders(Array.isArray(oRes?.data) ? oRes.data : [])
      } catch { /* use mock data */ }
    }
    load()
  }, [])

  const pendingOrders = orders.filter((o) => o.status === 'PLACED' || o.status === 'CONFIRMED' || o.status === 'PACKED')
  const deliveryOrders = pendingOrders.filter(o => o.handover_method !== 'PICKUP')
  const revenue = orders.reduce((s, o) => s + o.total_amount, 0)

  const toggleOrderSelection = (id) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(oId => oId !== id) : [...prev, id])
  }

  const handleOptimizeRoute = () => {
    const selectedAddresses = orders
      .filter(o => selectedOrders.includes(o.id))
      .map(o => ({
        id: o.id,
        name: o.buyer?.full_name || 'Buyer',
        desc: o.delivery_address || 'Unknown Location',
        lat: o.delivery_latitude,
        lng: o.delivery_longitude
      }))
    
    navigate('/route-optimization', { state: { destinations: selectedAddresses } })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-green-900">
            ਸਵਾਗਤ, {user?.full_name?.split(' ')[0]} 🌾
          </h1>
          <p className="text-gray-500 mt-1">Here's your farm activity overview</p>
        </div>
        <Link to="/add-crop" className="btn-primary">
          <Plus className="w-4 h-4" /> List New Crop
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Crops Listed" value={crops.length} icon={Leaf} color="green" />
        <StatCard label="Pending Orders" value={pendingOrders.length} icon={Package} color="amber" trend={12} />
        <StatCard label="Total Revenue" value={`₹${(revenue / 1000).toFixed(1)}K`} icon={TrendingUp} color="blue" />
        <StatCard label="Avg Rating" value="4.8" suffix="/ 5" icon={Star} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'listings' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('listings')}
        >
          Your Crop Listings
        </button>
        <button
          className={`py-3 px-6 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'logistics' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('logistics')}
        >
          Logistics & Deliveries
          {pendingOrders.length > 0 && <span className="ml-2 bg-amber-100 text-amber-700 py-0.5 px-2 rounded-full text-xs">{pendingOrders.length}</span>}
        </button>
      </div>

      {activeTab === 'listings' && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-green-900">Crop Inventory</h2>
            <Link to="/add-crop" className="text-green-700 text-sm font-semibold hover:underline flex items-center gap-1">
              Add More <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        <div className="kc-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-800">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Crop</th>
                <th className="text-left px-5 py-3 font-semibold">Category</th>
                <th className="text-right px-5 py-3 font-semibold">Price/kg</th>
                <th className="text-right px-5 py-3 font-semibold">Stock (kg)</th>
                <th className="text-center px-5 py-3 font-semibold">Status</th>
                <th className="text-center px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(crops || []).map((crop) => (
                <tr key={crop.id} className="hover:bg-green-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{crop.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="badge badge-green capitalize text-xs">{crop.category?.toLowerCase()}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-green-700">₹{crop.price_per_kg}</td>
                  <td className="px-5 py-3.5 text-right text-gray-600">{crop.quantity_kg?.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-center">
                    {crop.approval_status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {crop.approval_status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        <CheckCircle className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {crop.approval_status === 'REJECTED' && (
                      <span title={crop.rejection_reason || 'Rejected by admin'} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 cursor-help">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                    {/* fallback for old data without approval_status */}
                    {!crop.approval_status && (
                      <span className={`badge ${crop.is_available ? 'badge-green' : 'badge-red'}`}>
                        {crop.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button className="btn-ghost py-1 px-2 text-xs">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {activeTab === 'logistics' && (
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-green-900">Pending Deliveries</h2>
            <button 
              onClick={handleOptimizeRoute} 
              disabled={selectedOrders.length === 0}
              className="btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Navigation className="w-4 h-4" /> Optimize Route ({selectedOrders.length})
            </button>
          </div>
          
          <div className="kc-card overflow-hidden">
            {pendingOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No pending orders for delivery.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-green-50 text-green-800">
                  <tr>
                    <th className="px-5 py-3 text-left w-12">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        onChange={(e) => setSelectedOrders(e.target.checked ? (deliveryOrders || []).map(o => o.id) : [])}
                        checked={selectedOrders.length === deliveryOrders.length && deliveryOrders.length > 0}
                      />
                    </th>
                    <th className="text-left px-5 py-3 font-semibold">Order ID</th>
                    <th className="text-left px-5 py-3 font-semibold">Buyer</th>
                    <th className="text-left px-5 py-3 font-semibold">Handover</th>
                    <th className="text-left px-5 py-3 font-semibold">Location/OTP</th>
                    <th className="text-right px-5 py-3 font-semibold">Total</th>
                    <th className="text-center px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(pendingOrders || []).map((order) => (
                    <tr key={order.id} className="hover:bg-green-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        {order.handover_method !== 'PICKUP' && (
                          <input 
                            type="checkbox"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                          />
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-800">#{order.id}</td>
                      <td className="px-5 py-3.5">{order.buyer?.full_name || 'Guest'}</td>
                      <td className="px-5 py-3.5">
                        {order.handover_method === 'PICKUP' ? (
                          <span className="badge bg-amber-100 text-amber-700">📍 Pickup</span>
                        ) : (
                          <span className="badge bg-blue-100 text-blue-700">🚚 Delivery</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 max-w-[150px] truncate">
                        {order.handover_method === 'PICKUP' ? (
                          <span className="font-bold text-amber-600 text-xs">OTP: {order.pickup_otp || '****'}</span>
                        ) : (
                          <><MapPin className="w-3 h-3 inline mr-1 text-gray-400" />{order.delivery_address}</>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-green-700">₹{order.total_amount}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="badge badge-yellow">{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/ai-recommendation', label: 'AI Crop Advisor', icon: '🤖', color: 'bg-purple-50 border-purple-100 hover:bg-purple-100' },
          { to: '/demand-forecast',   label: 'Demand Forecast', icon: '📈', color: 'bg-blue-50 border-blue-100 hover:bg-blue-100' },
          { to: '/route-optimization', label: 'Route Optimizer',icon: '🗺️', color: 'bg-earth-50 border-earth-100 hover:bg-amber-100' },
        ].map(({ to, label, icon, color }) => (
          <Link key={to} to={to}
            className={`kc-card p-5 flex items-center gap-4 border ${color} transition-colors`}>
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-500">View →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
