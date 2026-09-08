import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Star, BadgeCheck, Leaf } from 'lucide-react'

export default function FarmerCard({ farmer }) {
  const profile = farmer.farmer_profile

  return (
    <Link to={`/farmer/${farmer.id}`}>
      <div className="kc-card p-5 flex flex-col gap-3">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
            {farmer.full_name?.[0] || 'F'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-900 text-base truncate">{farmer.full_name}</h3>
              {farmer.is_verified && (
                <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
              )}
            </div>
            {profile?.fpo_name && (
              <p className="text-xs text-green-700 font-medium truncate">{profile.fpo_name}</p>
            )}
            {farmer.state && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <MapPin className="w-3 h-3" />
                {farmer.district ? `${farmer.district}, ` : ''}{farmer.state}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 rounded-xl p-2.5 text-center">
            <p className="text-sm font-bold text-green-700">
              {profile?.land_area_acres ?? '—'}
            </p>
            <p className="text-[10px] text-gray-500">acres</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-0.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <p className="text-sm font-bold text-amber-700">{profile?.rating?.toFixed(1) ?? '—'}</p>
            </div>
            <p className="text-[10px] text-gray-500">{profile?.total_reviews ?? 0} reviews</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-2.5 text-center">
            <p className="text-sm font-bold text-blue-700">
              {profile?.certifications?.length ?? 0}
            </p>
            <p className="text-[10px] text-gray-500">certs</p>
          </div>
        </div>

        {/* Certifications */}
        {profile?.certifications?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.certifications.slice(0, 3).map((cert) => (
              <span key={cert} className="badge badge-green text-[10px]">
                <Leaf className="w-2.5 h-2.5 mr-0.5" />{cert}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
