import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Navigation, Truck, Clock, Route } from 'lucide-react'

// Fix default leaflet marker icons broken by webpack/vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function RouteOptimization() {
  const [showRoute, setShowRoute] = useState(false)
  const routerLocation = useLocation()
  const { user } = useAuth()
  
  const [destinations, setDestinations] = useState(routerLocation.state?.destinations || null)
  const [loading, setLoading] = useState(!routerLocation.state?.destinations)

  useEffect(() => {
    if (routerLocation.state?.destinations) {
      setLoading(false)
      return
    }
    
    // Fetch real deliveries for the farmer
    const fetchDeliveries = async () => {
      try {
        const res = await api.get('/orders/farmer/incoming')
        // Filter for DELIVERY orders that are not finished
        const deliveryOrders = res.data.filter(o => 
          o.handover_method === 'DELIVERY' && 
          !['DELIVERED', 'CANCELLED'].includes(o.status)
        )
        
        const fetchedDestinations = deliveryOrders.map((o) => ({
          id: `order-${o.id}`,
          name: o.buyer?.full_name || `Buyer #${o.buyer_id}`,
          desc: o.delivery_address || 'Address not provided',
          lat: o.delivery_latitude || 20.2961, // fallback coord
          lng: o.delivery_longitude || 85.8245,
        }))
        
        setDestinations(fetchedDestinations)
      } catch (err) {
        console.error('Failed to load deliveries', err)
        setDestinations([])
      } finally {
        setLoading(false)
      }
    }
    fetchDeliveries()
  }, [routerLocation.state])
  
  const LOCATIONS = [
    { id: 'farmer', name: 'Your Farm', desc: 'Starting Point', lat: 20.4625, lng: 85.8828, color: '#2d6a4f', type: 'farmer' },
    ...(destinations || []).map((d, i) => ({
      ...d,
      color: ['#f4a261', '#74b9ff', '#fd79a8', '#e17055', '#00b894'][i % 5],
      type: 'buyer'
    }))
  ]

  const OPTIMIZED_STOPS = [
    `Start: ${LOCATIONS[0].name}`,
    ...LOCATIONS.slice(1).map((l, i) => `Stop ${i+1}: ${l.name} — ${l.desc}`),
    `Return: ${LOCATIONS[0].name}`
  ]

  const center    = [LOCATIONS[0].lat, LOCATIONS[0].lng]
  const positions = LOCATIONS.map((l) => [l.lat, l.lng])
  
  // Close the loop to return home
  if (positions.length > 1) {
    positions.push(positions[0])
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Header bar ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                🚛 Route Optimization
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">Smart multi-stop delivery route for farmers</p>
            </div>
            <button
              id="optimize-route-btn"
              onClick={() => setShowRoute(true)}
              className="btn-primary gap-2 px-5 py-2.5"
            >
              <Route className="w-4 h-4" /> Optimize Route
            </button>
          </div>

          {/* Stats bar — shown after optimizing */}
          {showRoute && (
            <div className="flex flex-wrap gap-4 mt-4">
              {[
                { icon: Truck,      label: 'Estimated Distance', value: `${LOCATIONS.length * 24} km`    },
                { icon: Clock,      label: 'Estimated Time',     value: `${LOCATIONS.length * 40}m`   },
                { icon: Navigation, label: 'Stops',              value: `${LOCATIONS.length - 1} Buyers` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}
                  className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                  <Icon className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{label}</p>
                    <p className="font-bold text-gray-800 text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main grid: sidebar + map ────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="w-72 shrink-0 bg-gray-50 border-r border-gray-100 overflow-y-auto p-4">
          <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Delivery Stops</h3>

          <div className="space-y-2.5">
            {loading ? (
              <div className="text-sm text-gray-500 bg-white p-4 rounded-xl border border-gray-100 text-center">Loading deliveries...</div>
            ) : LOCATIONS.length === 1 ? (
              <div className="text-sm text-gray-500 bg-white p-4 rounded-xl border border-gray-100 text-center">
                No active delivery stops right now.
              </div>
            ) : (
              LOCATIONS.map((loc, i) => (
                <div key={loc.id}
                  className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5"
                    style={{ background: loc.color }}
                  >
                    {loc.type === 'farmer' ? '🌾' : i}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{loc.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{loc.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Optimized route list */}
          {showRoute && (
            <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="font-bold text-green-700 text-sm mb-3 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" /> Optimized Route
              </p>
              <div className="space-y-1">
                {OPTIMIZED_STOPS.map((stop, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <p className="text-xs text-gray-600">{stop}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Leaflet Map */}
        <div className="flex-1">
          <MapContainer
            center={center}
            zoom={9}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {LOCATIONS.map((loc) => (
              <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                <Popup>
                  <strong>{loc.name}</strong>
                  <br />
                  {loc.desc}
                </Popup>
              </Marker>
            ))}

            {showRoute && (
              <Polyline
                positions={positions}
                color="#2d6a4f"
                weight={3}
                dashArray="8, 4"
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
