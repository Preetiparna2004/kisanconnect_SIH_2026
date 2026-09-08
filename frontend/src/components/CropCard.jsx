import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ShoppingCart } from 'lucide-react'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'
import CropImage from './CropImage'

const CATEGORY_COLORS = {
  CEREALS: 'badge-earth',
  PULSES: 'badge-yellow',
  VEGETABLES: 'badge-green',
  FRUITS: 'badge-blue',
  SPICES: 'badge-red',
  OILSEEDS: 'badge-yellow',
  CASH_CROPS: 'badge-earth',
}

export default function CropCard({ crop }) {
  const { addToCart } = useApp()

  const handleAddToCart = (e) => {
    e.preventDefault()
    addToCart(crop, 1)
    toast.success(`${crop.name} added to cart!`)
  }

  return (
    <Link to={`/crop/${crop.id}`} className="block">
      <div className="kc-card overflow-hidden group cursor-pointer">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-green-50">
          <CropImage
            src={crop.image_url}
            alt={crop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {crop.is_organic && (
            <span className="absolute top-3 left-3 badge badge-green text-[10px] font-bold">
              🌿 Organic
            </span>
          )}
          <span className={`absolute top-3 right-3 badge ${CATEGORY_COLORS[crop.category] || 'badge-green'} text-[10px]`}>
            {crop.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base mb-1 truncate group-hover:text-green-700 transition-colors">
            {crop.name}
          </h3>

          {crop.farmer && (
            <p className="text-xs text-gray-500 mb-2">
              by <span className="font-medium text-green-700">{crop.farmer.full_name}</span>
            </p>
          )}

          {crop.location && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{crop.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-green-700">₹{crop.price_per_kg}</span>
              <span className="text-xs text-gray-400 ml-1">/kg</span>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-lg transition-all active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {crop.quantity_kg?.toLocaleString()} kg available
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
