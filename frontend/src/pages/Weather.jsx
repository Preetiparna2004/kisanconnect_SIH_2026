import React, { useState, useEffect } from 'react'
import { useWeather } from '../hooks/useWeather'
import { Cloud, Wind, Droplets, Thermometer, Sun, CloudRain } from 'lucide-react'

const WMO_ICONS = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
}

const WMO_DESC = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 51: 'Light drizzle', 61: 'Light rain', 63: 'Moderate rain',
  65: 'Heavy rain', 71: 'Slight snow', 80: 'Rain showers', 95: 'Thunderstorm',
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Weather() {
  const [coords, setCoords] = useState({ lat: 20.5937, lon: 78.9629 })
  const [locationName, setLocationName] = useState('India (Central)')
  const { weather, loading, error } = useWeather(coords.lat, coords.lon)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setLocationName('Your Location')
      },
      () => {}
    )
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center text-gray-500">
      <Cloud className="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p>Weather data unavailable. Check your connection.</p>
    </div>
  )

  const cw = weather?.current
  const daily = weather?.daily

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <div className="mb-8">
        <h1 className="section-title">🌤️ Weather Forecast</h1>
        <p className="section-subtitle">7-day forecast for farming decisions · {locationName}</p>
      </div>

      {/* Current Weather Hero */}
      <div className="hero-gradient rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-green-300 text-sm font-medium mb-2">Current Conditions</p>
              <div className="flex items-center gap-4">
                <span className="text-7xl">{WMO_ICONS[cw?.weathercode] || '🌡️'}</span>
                <div>
                  <p className="text-7xl font-bold font-display">{Math.round(cw?.temperature)}°C</p>
                  <p className="text-green-200 text-lg mt-1">{WMO_DESC[cw?.weathercode] || 'Unknown'}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Wind, label: 'Wind Speed', val: `${cw?.windspeed} km/h` },
                { icon: Thermometer, label: 'Feels Like', val: `${Math.round(cw?.temperature)}°C` },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="bg-white/10 rounded-2xl p-4 text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1 text-green-300" />
                  <p className="text-xs text-green-300">{label}</p>
                  <p className="font-bold mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <h2 className="text-xl font-bold text-green-900 mb-4">7-Day Outlook</h2>
      <div className="grid grid-cols-7 gap-3 mb-10">
        {daily?.dates?.map((date, i) => {
          const d = new Date(date)
          return (
            <div key={date} className={`kc-card p-3 text-center ${i === 0 ? 'bg-green-50 border-green-200' : ''}`}>
              <p className="text-xs font-semibold text-gray-500">{DAYS[d.getDay()]}</p>
              <p className="text-xs text-gray-400 mb-2">{d.getDate()}/{d.getMonth() + 1}</p>
              <span className="text-2xl block mb-2">☀️</span>
              <p className="font-bold text-red-500 text-sm">{Math.round(daily.maxTemp[i])}°</p>
              <p className="text-blue-500 text-xs">{Math.round(daily.minTemp[i])}°</p>
              {daily.precipitation[i] > 0 && (
                <div className="flex items-center justify-center gap-0.5 mt-1.5">
                  <Droplets className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] text-blue-500">{daily.precipitation[i].toFixed(1)}mm</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Farming Advisory */}
      <h2 className="text-xl font-bold text-green-900 mb-4">🌾 Farming Advisory</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { title: 'Irrigation', tip: `Temp is ${Math.round(cw?.temperature)}°C. ${cw?.temperature > 30 ? 'Water crops early morning or evening.' : 'Normal irrigation schedule is fine.'}`, icon: '💧', color: 'bg-blue-50' },
          { title: 'Pesticide Spraying', tip: `Wind at ${cw?.windspeed} km/h. ${cw?.windspeed > 15 ? 'Avoid spraying – drift risk is high.' : 'Good conditions for pesticide application.'}`, icon: '🌿', color: 'bg-green-50' },
          { title: 'Harvest Timing', tip: 'Clear weather expected for next 2 days. Good window for harvesting dry crops.', icon: '🚜', color: 'bg-amber-50' },
        ].map(({ title, tip, icon, color }) => (
          <div key={title} className={`kc-card p-5 ${color}`}>
            <span className="text-3xl block mb-2">{icon}</span>
            <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
