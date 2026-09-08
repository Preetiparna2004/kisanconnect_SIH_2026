import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { cropService } from '../services/cropService'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { MapPin, ShoppingCart, Star, ArrowLeft, Package } from 'lucide-react'
import { mockCrops } from '../data/mockCrops'
import toast from 'react-hot-toast'
import CropImage from '../components/CropImage'

export default function CropDetails() {
  const { id } = useParams()
  const { addToCart } = useApp()
  const { isAuthenticated, isBulkBuyer } = useAuth()
  const [crop, setCrop] = useState(null)
  const [qty, setQty] = useState(1)

  // Use useEffect to set qty to MOQ if the user is a bulk buyer
  useEffect(() => {
    if (crop && isBulkBuyer && crop.minimum_order_qty) {
      setQty(Math.max(1, crop.minimum_order_qty))
    }
  }, [crop, isBulkBuyer])

  const currentPrice = (isBulkBuyer && crop?.bulk_price_per_kg && qty >= (crop.minimum_order_qty || 1)) 
    ? crop.bulk_price_per_kg 
    : crop?.price_per_kg

  useEffect(() => {
    cropService.get(id)
      .then((r) => setCrop(r.data))
      .catch(() => setCrop(mockCrops.find((c) => c.id === parseInt(id)) || mockCrops[0]))
  }, [id])

  if (!crop) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const handleAdd = () => {
    if (!isAuthenticated) { toast.error('Please login to add to cart'); return }
    if (isBulkBuyer && crop.minimum_order_qty && qty < crop.minimum_order_qty) {
      toast.error(`Minimum order quantity is ${crop.minimum_order_qty}kg for wholesale pricing.`)
      return
    }
    // Note: To pass current price to cart, we attach it to the crop temporarily
    addToCart({ ...crop, price_per_kg: currentPrice }, qty)
    toast.success(`${qty}kg ${crop.name} added to cart!`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <Link to="/marketplace" className="inline-flex items-center gap-2 text-green-700 hover:underline mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="rounded-3xl overflow-hidden bg-green-50 shadow-xl aspect-square lg:aspect-auto lg:max-h-[500px]">
          <CropImage src={crop.image_url} alt={crop.name} className="w-full h-full object-cover" />
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="badge badge-green capitalize">{crop.category?.toLowerCase()}</span>
            {crop.is_organic && <span className="badge badge-green">🌿 Organic</span>}
            {crop.is_available ? <span className="badge badge-green">In Stock</span> : <span className="badge badge-red">Out of Stock</span>}
          </div>

          <h1 className="font-display text-4xl font-bold text-green-900 mb-2">{crop.name}</h1>

          {crop.farmer && (
            <Link to={`/farmer/${crop.farmer.id}`} className="inline-flex items-center gap-2 text-sm text-green-700 font-medium mb-4 hover:underline">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {crop.farmer.full_name?.[0]}
              </div>
              {crop.farmer.full_name}
              {crop.farmer.state && <span className="text-gray-400">· {crop.farmer.state}</span>}
            </Link>
          )}

          {crop.location && (
            <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-5">
              <MapPin className="w-4 h-4" /> {crop.location}
            </div>
          )}

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold text-green-700 font-display">₹{currentPrice}</span>
            <span className="text-gray-400">per kg</span>
          </div>
          
          {isBulkBuyer && crop.bulk_price_per_kg && (
            <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm font-semibold text-amber-800">
                🏢 Wholesale Pricing Active
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Regular price: ₹{crop.price_per_kg}/kg. 
                Buy at least {crop.minimum_order_qty}kg to unlock the bulk rate of ₹{crop.bulk_price_per_kg}/kg.
              </p>
            </div>
          )}
          {!isBulkBuyer && <div className="mb-6" />}

          {crop.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{crop.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-green-50 rounded-2xl p-4">
              <p className="text-xs text-gray-500">Stock Available</p>
              <p className="font-bold text-green-700 text-lg">{crop.quantity_kg?.toLocaleString()} kg</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4">
              <p className="text-xs text-gray-500">Listed On</p>
              <p className="font-bold text-amber-700 text-lg">{new Date(crop.created_at).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-semibold text-gray-700">Quantity (kg):</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 hover:bg-gray-50 text-gray-600 font-bold text-lg">−</button>
              <input type="number" value={qty} min={1} max={crop.quantity_kg}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center text-gray-800 font-bold outline-none py-2" />
              <button onClick={() => setQty(Math.min(crop.quantity_kg, qty + 1))} className="px-4 py-2 hover:bg-gray-50 text-gray-600 font-bold text-lg">+</button>
            </div>
            <p className="text-green-700 font-bold">= ₹{(currentPrice * qty).toLocaleString()}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={!crop.is_available} className="btn-primary flex-1 justify-center py-3.5 text-base">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <Link to="/orders" className="btn-secondary px-6 py-3.5">
              <Package className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
