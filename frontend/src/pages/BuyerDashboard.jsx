import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderService } from '../services/orderService'
import StatCard from '../components/StatCard'
import { ShoppingCart, Package, TrendingDown, Clock, ArrowRight } from 'lucide-react'
import { mockOrders } from '../data/mockOrders'
import OrderStatusStepper from '../components/OrderStatusStepper'

const STATUS_COLORS = {
  PLACED: 'badge-yellow', CONFIRMED: 'badge-blue', PACKED: 'badge-blue',
  SHIPPED: 'badge-earth', DELIVERED: 'badge-green', CANCELLED: 'badge-red',
}

export default function BuyerDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState(mockOrders)

  useEffect(() => {
    orderService.myOrders().then((r) => { if (Array.isArray(r?.data) && r.data.length > 0) setOrders(r.data) }).catch(() => {})
  }, [])

  const activeOrders  = orders.filter((o) => !['DELIVERED','CANCELLED'].includes(o.status))
  const totalSpent    = orders.filter((o) => o.status === 'DELIVERED').reduce((s,o) => s+o.total_amount, 0)
  const savings       = Math.round(totalSpent * 0.18) // ~18% savings vs mandi price

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-green-900">
          Hello, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Track your orders and explore fresh produce</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Orders" value={orders.length} icon={Package} color="green" />
        <StatCard label="Active Orders" value={activeOrders.length} icon={Clock} color="amber" />
        <StatCard label="Total Spent" value={`₹${(totalSpent/1000).toFixed(1)}K`} icon={ShoppingCart} color="blue" />
        <StatCard label="Your Savings" value={`₹${(savings/1000).toFixed(1)}K`} icon={TrendingDown} color="purple" trend={18} />
      </div>

      {/* Latest Order Tracker */}
      {activeOrders.length > 0 && (
        <div className="kc-card p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-green-900">Latest Active Order</h2>
            <Link to="/orders" className="text-green-700 text-sm font-semibold hover:underline">View All</Link>
          </div>
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-700">
              Order #{activeOrders[0].id} · ₹{activeOrders[0].total_amount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">{new Date(activeOrders[0].created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
          </div>
          <OrderStatusStepper status={activeOrders[0].status} />
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="kc-card overflow-hidden mb-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="text-lg font-bold text-green-900">Recent Orders</h2>
          <Link to="/orders" className="btn-ghost text-sm py-1.5 px-3">
            All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-800">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Order ID</th>
                <th className="text-left px-5 py-3 font-semibold">Items</th>
                <th className="text-right px-5 py-3 font-semibold">Amount</th>
                <th className="text-center px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(orders || []).map((o) => (
                <tr key={o.id} className="hover:bg-green-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-gray-600">#{o.id}</td>
                  <td className="px-5 py-3.5 text-gray-700">
                    {o.items?.map((i) => i.crop?.name).join(', ').substring(0, 40)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-green-700">₹{o.total_amount.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`badge ${STATUS_COLORS[o.status] || 'badge-green'} capitalize text-xs`}>
                      {o.status?.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-gray-500">
                    {new Date(o.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/marketplace" className="kc-card p-6 flex items-center gap-4 hover:bg-green-50 transition-colors border-green-100">
          <span className="text-4xl">🛒</span>
          <div>
            <p className="font-bold text-green-900">Browse Marketplace</p>
            <p className="text-sm text-gray-500">Find fresh produce from local farmers</p>
          </div>
        </Link>
        <Link to="/weather" className="kc-card p-6 flex items-center gap-4 hover:bg-blue-50 transition-colors border-blue-100">
          <span className="text-4xl">🌤️</span>
          <div>
            <p className="font-bold text-blue-900">Weather Forecast</p>
            <p className="text-sm text-gray-500">7-day local weather & farming advice</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
