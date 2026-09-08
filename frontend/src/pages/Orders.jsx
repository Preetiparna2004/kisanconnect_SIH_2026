import React, { useState, useEffect } from 'react'
import { orderService } from '../services/orderService'
import { useAuth } from '../context/AuthContext'
import OrderStatusStepper from '../components/OrderStatusStepper'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import { mockOrders } from '../data/mockOrders'

const STATUS_COLORS = {
  PLACED: 'badge-yellow', CONFIRMED: 'badge-blue', PACKED: 'badge-blue',
  SHIPPED: 'badge-earth', DELIVERED: 'badge-green', CANCELLED: 'badge-red',
}

export default function Orders() {
  const { isFarmer } = useAuth()
  const [orders, setOrders] = useState(mockOrders)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    const fetchFn = isFarmer ? orderService.farmerIncoming : orderService.myOrders
    fetchFn().then((r) => { if (r.data.length > 0) setOrders(r.data) }).catch(() => {})
  }, [isFarmer])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <div className="mb-8">
        <h1 className="section-title">{isFarmer ? 'Incoming Orders' : 'My Orders'}</h1>
        <p className="section-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="kc-card overflow-hidden">
              {/* Header */}
              <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-green-50/50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-700" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Order #{order.id}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge ${STATUS_COLORS[order.status] || 'badge-green'} capitalize text-xs`}>
                    {order.status?.toLowerCase()}
                  </span>
                  <p className="font-bold text-green-700">₹{order.total_amount.toLocaleString()}</p>
                  {expanded === order.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {/* Expanded */}
              {expanded === order.id && (
                <div className="border-t border-gray-50 px-6 py-5 bg-green-50/30 animate-fade-in">
                  <OrderStatusStepper status={order.status} />
                  
                  {order.handover_method === 'PICKUP' ? (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-0.5">Farm-Gate Pickup</p>
                        <p className="text-sm text-amber-900 font-medium">Show this OTP to the farmer</p>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-lg border border-amber-200 shadow-sm">
                        <span className="text-xl font-display font-bold tracking-widest text-amber-700">{order.pickup_otp || '****'}</span>
                      </div>
                    </div>
                  ) : (
                    order.delivery_address && (
                      <p className="text-sm text-gray-600 mb-4">📍 Delivery Address: {order.delivery_address}</p>
                    )
                  )}
                  
                  <table className="w-full text-sm">
                    <thead className="text-gray-500 border-b border-gray-100">
                      <tr>
                        <th className="text-left pb-2">Crop</th>
                        <th className="text-right pb-2">Qty</th>
                        <th className="text-right pb-2">Rate</th>
                        <th className="text-right pb-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item) => (
                        <tr key={item.id} className="border-b border-gray-50">
                          <td className="py-2 font-medium text-gray-800">{item.crop?.name || `Crop #${item.crop_id}`}</td>
                          <td className="py-2 text-right text-gray-600">{item.quantity_kg}kg</td>
                          <td className="py-2 text-right text-gray-600">₹{item.price_per_kg}</td>
                          <td className="py-2 text-right font-bold text-green-700">₹{item.subtotal.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="pt-3 text-right font-bold text-gray-700">Total</td>
                        <td className="pt-3 text-right font-bold text-green-800 text-lg">₹{order.total_amount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
