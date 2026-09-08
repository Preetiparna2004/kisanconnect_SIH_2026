import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Hourglass, RefreshCw, Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function CropPending() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  
  // Get crop details from location state, or use placeholders
  const cropDetails = location.state?.crop || {
    name: 'Unknown Crop',
    category: 'N/A'
  }
  const requestTime = location.state?.time || new Date().toLocaleString()

  return (
    <div className="fixed inset-0 z-[100] bg-[#111111] flex flex-col items-center justify-center p-4 font-sans text-gray-200 overflow-y-auto">
      
      {/* Brand Logo - like the image's top logo */}
      <div className="mb-8 flex items-center gap-2 bg-black/60 px-5 py-2.5 rounded-xl border border-gray-800 shadow-2xl">
        <Leaf className="w-5 h-5 text-[#32965D]" />
        <span className="font-bold text-lg text-white font-display tracking-wide">
          Kisan<span className="text-[#e6b32b]">Connect</span>
        </span>
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Hourglass Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full border border-[#e6b32b]/40 bg-[#e6b32b]/10 flex items-center justify-center shadow-[0_0_30px_rgba(230,179,43,0.15)] relative">
            <div className="absolute inset-0 rounded-full border border-[#e6b32b]/20 animate-ping opacity-20"></div>
            <Hourglass className="w-7 h-7 text-[#e6b32b]" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 font-display">Approval Pending</h1>
          <p className="text-gray-400 text-sm leading-relaxed px-2">
            Thank you for posting your product on <strong className="text-[#e6b32b] font-medium">KisanConnect</strong>. Your request is currently under review by our System Administrator.
          </p>
        </div>

        {/* Details Card */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#e6b32b]/50 to-transparent" />
          
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Request Details</span>
            <span className="px-2.5 py-1 bg-[#e6b32b]/10 border border-[#e6b32b]/30 text-[#e6b32b] text-[10px] font-bold rounded shadow-sm">
              PENDING
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1.5">{cropDetails.name}</h2>
            <p className="text-gray-400 text-sm capitalize">
              {cropDetails.category.toLowerCase().replace('_', ' ')} • New Listing Request
            </p>
          </div>

          <p className="text-xs text-gray-500">
            Requested: {requestTime}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-10">
          <button 
            onClick={() => navigate('/farmer-dashboard')}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#e6b32b] hover:bg-[#d4a325] text-black font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(230,179,43,0.15)] hover:shadow-[0_0_25px_rgba(230,179,43,0.3)]"
          >
            <RefreshCw className="w-4 h-4" /> CHECK APPROVAL STATUS
          </button>
          
          <button 
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#161616] hover:bg-[#222222] border border-gray-800 text-gray-400 hover:text-gray-300 font-semibold text-sm rounded-xl transition-all"
          >
            Sign Out
          </button>
        </div>

        {/* Footer text */}
        <p className="text-center text-[11px] text-gray-600 leading-relaxed max-w-[320px] mx-auto">
          Administrator notification has been sent. Once granted permission, you will receive full access to track and sell this crop.
        </p>
      </div>
    </div>
  )
}
