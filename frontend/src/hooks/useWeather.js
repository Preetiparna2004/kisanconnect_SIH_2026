import { useState, useEffect } from 'react'

/**
 * useWeather – fetches current weather from Open-Meteo (no API key needed)
 * @param {number} lat - Latitude (default: 20.5937 - India center)
 * @param {number} lon - Longitude (default: 78.9629 - India center)
 */
export function useWeather(lat = 20.5937, lon = 78.9629) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const fetchWeather = async () => {
      try {
        setLoading(true)
        const url = new URL('https://api.open-meteo.com/v1/forecast')
        url.searchParams.set('latitude', lat)
        url.searchParams.set('longitude', lon)
        url.searchParams.set('current_weather', true)
        url.searchParams.set('hourly', 'relativehumidity_2m,precipitation_probability,soil_temperature_0cm')
        url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max')
        url.searchParams.set('timezone', 'Asia/Kolkata')
        url.searchParams.set('forecast_days', 7)

        const res = await fetch(url.toString(), { signal: controller.signal })
        if (!res.ok) throw new Error('Weather fetch failed')
        const data = await res.json()

        setWeather({
          current: data.current_weather,
          hourly: data.hourly,
          daily: {
            dates: data.daily.time,
            maxTemp: data.daily.temperature_2m_max,
            minTemp: data.daily.temperature_2m_min,
            precipitation: data.daily.precipitation_sum,
            windspeed: data.daily.windspeed_10m_max,
          },
        })
        setError(null)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
    return () => controller.abort()
  }, [lat, lon])

  return { weather, loading, error }
}
