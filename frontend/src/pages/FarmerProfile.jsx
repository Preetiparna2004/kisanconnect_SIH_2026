import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Star, BadgeCheck, Leaf, MessageSquare } from 'lucide-react'
import { mockFarmers } from '../data/mockFarmers'
import { mockCrops } from '../data/mockCrops'
import CropCard from '../components/CropCard'
import api from '../services/api'

export default function FarmerProfile() {
  const { id } = useParams()
  const [farmer, setFarmer] = useState(null)
  const [crops, setCrops] = useState([])

  useEffect(() => {
    api.get(`/farmers/${id}`)
      .then((r) => setFarmer(r.data))
      .catch(() => setFarmer(mockFarmers.find((f) => f.id === parseInt(id)) || mockFarmers[0]))
    api.get(`/farmers/${id}/crops`)
      .then((r) => setCrops(r.data))
      .catch(() => setCrops(mockCrops.filter((c) => c.farmer_id === parseInt(id))))
  }, [id])

  if (!farmer) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>

  const profile = farmer.farmer_profile

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      {/* Profile Header */}
      <div className="kc-card p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-600 to-green-900 flex items-center justify-center text-white text-4xl font-bold shadow-lg shrink-0">
            {farmer.full_name?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display text-3xl font-bold text-green-900">{farmer.full_name}</h1>
              {farmer.is_verified && <BadgeCheck className="w-6 h-6 text-blue-500" />}
            </div>
            {profile?.fpo_name && <p className="text-green-700 font-semibold mb-2">{profile.fpo_name}</p>}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              {farmer.state && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{farmer.district}, {farmer.state}</span>}
              {profile?.soil_type && <span>🌱 {profile.soil_type} soil</span>}
              {profile?.land_area_acres && <span>📐 {profile.land_area_acres} acres</span>}
              {profile?.irrigation_type && <span>💧 {profile.irrigation_type} irrigation</span>}
            </div>
            {profile?.bio && <p className="text-gray-600 leading-relaxed max-w-2xl">{profile.bio}</p>}
            <div className="flex flex-wrap gap-2 mt-4">
              {profile?.certifications?.map((cert) => (
                <span key={cert} className="badge badge-green"><Leaf className="w-2.5 h-2.5 mr-0.5" />{cert}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-bold text-amber-700 text-xl">{profile?.rating?.toFixed(1) || '—'}</span>
              <span className="text-gray-400 text-sm">({profile?.total_reviews || 0})</span>
            </div>
            <Link to={`/messages?to=${farmer.id}`} className="btn-primary py-2.5 px-5 text-sm">
              <MessageSquare className="w-4 h-4" /> Message
            </Link>
          </div>
        </div>
      </div>

      {/* Crops */}
      <h2 className="section-title mb-6">Listed Produce</h2>
      {crops.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Leaf className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No crops listed yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {crops.map((c) => <CropCard key={c.id} crop={c} />)}
        </div>
      )}
    </div>
  )
}
