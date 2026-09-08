import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { orderService } from '../services/orderService'
import { ShoppingCart, Trash2, CreditCard, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import CropImage from '../components/CropImage'

export default function Payment() {
  const { cart, clearCart, cartTotal } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [method, setMethod] = useState('UPI')
  const [handoverMethod, setHandoverMethod] = useState('DELIVERY')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleOrder = async () => {
    if (handoverMethod === 'DELIVERY' && !address) { 
      toast.error('Please enter delivery address'); 
      return;
    }
    if (cart.length === 0) { toast.error('Your cart is empty'); return }
    setLoading(true)
    try {
      // Place order
      const orderPayload = {
        items: cart.map((i) => ({ crop_id: i.crop.id, quantity_kg: i.qty })),
        handover_method: handoverMethod,
        delivery_address: handoverMethod === 'DELIVERY' ? address : null,
      }
      const { data: order } = await orderService.place(orderPayload)
      // Initiate & confirm payment (mock)
      const { data: payment } = await orderService.initiatePayment(order.id, method)
      await orderService.confirmPayment(payment.id, `TXN_${Date.now()}`)
      clearCart()
      setSuccess(true)
      toast.success('Order placed successfully! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center page-enter">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-green-900 mb-3">Order Placed! 🎉</h1>
        <p className="text-gray-500 mb-8">Your order is confirmed and the farmer has been notified. Track status in My Orders.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/orders')} className="btn-primary">View Orders</button>
          <button onClick={() => navigate('/marketplace')} className="btn-secondary">Shop More</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <h1 className="section-title mb-8">Checkout</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/marketplace')} className="btn-primary mt-4">Browse Marketplace</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-green-900">Cart Items ({cart.length})</h2>
            {cart.map(({ crop, qty }) => (
              <div key={crop.id} className="kc-card p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-green-50 shrink-0">
                  <CropImage src={crop.image_url} alt={crop.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{crop.name}</p>
                  <p className="text-sm text-gray-500">₹{crop.price_per_kg}/kg × {qty}kg</p>
                </div>
                <p className="font-bold text-green-700">₹{(crop.price_per_kg * qty).toLocaleString()}</p>
              </div>
            ))}

            {/* Handover Method */}
            <div className="kc-card p-5">
              <h3 className="font-bold text-gray-800 mb-3">Handover Option</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setHandoverMethod('DELIVERY')}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    handoverMethod === 'DELIVERY' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-200'
                  }`}
                >
                  <p className={`font-bold ${handoverMethod === 'DELIVERY' ? 'text-green-800' : 'text-gray-700'}`}>🚚 Home Delivery</p>
                  <p className="text-xs text-gray-500 mt-1">Delivered to your doorstep</p>
                </button>
                <button
                  type="button"
                  onClick={() => setHandoverMethod('PICKUP')}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    handoverMethod === 'PICKUP' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-200'
                  }`}
                >
                  <p className={`font-bold ${handoverMethod === 'PICKUP' ? 'text-green-800' : 'text-gray-700'}`}>📍 Farm-Gate Pickup</p>
                  <p className="text-xs text-gray-500 mt-1">Collect directly from farm/depot</p>
                </button>
              </div>

              {/* Delivery Address */}
              {handoverMethod === 'DELIVERY' ? (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Delivery Address</h3>
                  <textarea
                    id="delivery-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    placeholder="Full delivery address with PIN code…"
                    className="kc-input resize-none"
                  />
                </div>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-200">
                  <p className="font-semibold">OTP Verification Required</p>
                  <p className="mt-1 opacity-90 text-xs">You will receive an OTP after placing the order. Show the OTP to the farmer during pickup.</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="kc-card p-6 sticky top-24">
              <h2 className="text-lg font-bold text-green-900 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee</span>
                  <span className="text-green-600">₹0 (Free)</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>₹0 (Farmer's location)</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span className="text-green-700">₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {['UPI','BANK_TRANSFER','COD'].map((m) => (
                    <button key={m} onClick={() => setMethod(m)}
                      className={`py-2 text-xs font-bold rounded-xl border-2 transition-all
                        ${method === m ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-300'}`}>
                      {m === 'BANK_TRANSFER' ? 'Bank' : m}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleOrder} disabled={loading} className="btn-primary w-full justify-center py-3.5">
                {loading ? <span className="spinner" /> : <CreditCard className="w-5 h-5" />}
                {loading ? 'Placing Order…' : `Pay ₹${cartTotal.toLocaleString()}`}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                🔒 Secured by KisanConnect. No hidden charges.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
