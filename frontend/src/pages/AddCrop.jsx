import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cropService } from '../services/cropService'
import { aiService } from '../services/aiService'
import { Leaf, Upload, Plus, Wand2 } from 'lucide-react'
import toast from 'react-hot-toast'
import CropImage from '../components/CropImage'

const CATEGORIES = ['CEREALS','PULSES','VEGETABLES','FRUITS','SPICES','OILSEEDS','CASH_CROPS']

export default function AddCrop() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', category: 'VEGETABLES', description: '',
    price_per_kg: '', bulk_price_per_kg: '', quantity_kg: '', minimum_order_qty: '', location: '',
    image_url: '', is_organic: false,
  })

  const handle = (e) => {
    const { name, type, value, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const autoFetchImage = async (nameOverride) => {
    const queryName = nameOverride || form.name;
    if (!queryName) return;
    const toastId = toast.loading('Finding a matching image...')
    try {
      // Use the last word of the name for better Wikipedia matching (e.g. "Basmati Rice" -> "Rice")
      const query = queryName.trim().split(' ').pop()
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${query}&prop=pageimages&format=json&pithumbsize=500&origin=*`)
      const data = await res.json()
      const pages = data.query.pages
      const pageId = Object.keys(pages)[0]
      
      if (pageId !== '-1' && pages[pageId].thumbnail) {
        setForm(prev => ({ ...prev, image_url: pages[pageId].thumbnail.source }))
        toast.success('Image fetched successfully! 🪄', { id: toastId })
      } else {
        toast.error('No auto-image found. Please provide a URL.', { id: toastId })
      }
    } catch (err) {
      toast.error('Failed to fetch image', { id: toastId })
    }
  }

  const fetchSuggestedPrice = async () => {
    if (!form.name) {
      toast.error('Enter a crop name first to get AI price suggestion')
      return
    }
    const toastId = toast.loading('AI analyzing market trends...')
    try {
      const { data } = await aiService.forecastDemand({ crop_name: form.name.trim().split(' ').pop(), days: 7 })
      if (data && data.avg_price) {
        setForm(prev => ({ ...prev, price_per_kg: data.avg_price }))
        toast.success(`AI suggests ₹${data.avg_price}/kg based on current demand! 📈`, { id: toastId })
      } else {
        toast.error('Could not determine a price suggestion.', { id: toastId })
      }
    } catch {
      toast.error('AI Forecast unavailable.', { id: toastId })
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await cropService.create({
        ...form,
        price_per_kg: parseFloat(form.price_per_kg),
        bulk_price_per_kg: form.bulk_price_per_kg ? parseFloat(form.bulk_price_per_kg) : null,
        quantity_kg: parseFloat(form.quantity_kg),
        minimum_order_qty: form.minimum_order_qty ? parseFloat(form.minimum_order_qty) : null,
        location: form.location || `${user?.district}, ${user?.state}`,
      })
      toast.success('Crop listed successfully! 🌾')
      navigate('/crop-pending', { state: { crop: form, time: new Date().toLocaleString() } })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to list crop')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 page-enter">
      <div className="mb-8">
        <h1 className="section-title">List a New Crop</h1>
        <p className="section-subtitle">Add your produce to reach buyers directly</p>
      </div>

      <div className="kc-card p-8">
        <form onSubmit={submit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="kc-label">Crop Name *</label>
              <input id="crop-name" name="name" required value={form.name} onChange={handle}
                onBlur={(e) => {
                  if (e.target.value && !form.image_url) {
                    autoFetchImage(e.target.value)
                  }
                }}
                placeholder="e.g. Basmati Rice, Alphonso Mango" className="kc-input" />
            </div>

            {/* Category */}
            <div>
              <label className="kc-label">Category *</label>
              <select id="crop-category" name="category" value={form.category} onChange={handle} className="kc-select">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0)+c.slice(1).toLowerCase().replace('_',' ')}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="kc-label">Harvest Location</label>
              <input id="crop-location" name="location" value={form.location} onChange={handle}
                placeholder={`${user?.district || 'District'}, ${user?.state || 'State'}`} className="kc-input" />
            </div>

            {/* Price */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="kc-label !mb-0">Price per kg (₹) *</label>
                <button type="button" onClick={fetchSuggestedPrice} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg transition-colors">
                  <Wand2 className="w-3 h-3" /> AI Suggest Price
                </button>
              </div>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                <input id="crop-price" name="price_per_kg" type="number" required min="1" step="0.5"
                  value={form.price_per_kg} onChange={handle} placeholder="0.00" className="kc-input pl-7" />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="kc-label">Quantity Available (kg) *</label>
              <input id="crop-qty" name="quantity_kg" type="number" required min="1"
                value={form.quantity_kg} onChange={handle} placeholder="e.g. 500" className="kc-input" />
            </div>

            {/* Wholesale Pricing (Optional) */}
            <div className="sm:col-span-2 grid sm:grid-cols-2 gap-5 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="sm:col-span-2">
                <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                  <span className="text-lg">🏢</span> Wholesale / Bulk Buyer Options (Optional)
                </h3>
                <p className="text-xs text-amber-700 mt-1">Attract bulk buyers by offering a lower price for large orders.</p>
              </div>
              
              <div>
                <label className="kc-label text-amber-900">Minimum Order Qty (kg)</label>
                <input id="crop-moq" name="minimum_order_qty" type="number" min="1"
                  value={form.minimum_order_qty} onChange={handle} placeholder="e.g. 100" 
                  className="kc-input border-amber-200 focus:border-amber-400 focus:ring-amber-400" />
              </div>
              
              <div>
                <label className="kc-label text-amber-900">Bulk Price per kg (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input id="crop-bulk-price" name="bulk_price_per_kg" type="number" min="1" step="0.5"
                    value={form.bulk_price_per_kg} onChange={handle} placeholder="0.00" 
                    className="kc-input pl-7 border-amber-200 focus:border-amber-400 focus:ring-amber-400" />
                </div>
              </div>
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="kc-label !mb-0">Image URL</label>
                <button type="button" onClick={autoFetchImage} className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg transition-colors">
                  <Wand2 className="w-3 h-3" /> Auto-fetch from Name
                </button>
              </div>
              <div className="relative mt-1">
                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input id="crop-image" name="image_url" value={form.image_url} onChange={handle}
                  placeholder="https://example.com/my-crop.jpg" className="kc-input pl-9" />
              </div>
              {form.image_url && (
                <CropImage src={form.image_url} alt="preview"
                  className="mt-3 w-full h-48 object-cover rounded-xl border border-gray-200" />
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="kc-label">Description</label>
              <textarea id="crop-desc" name="description" rows={4} value={form.description} onChange={handle}
                placeholder="Describe your produce: variety, quality, harvest method…"
                className="kc-input resize-none" />
            </div>

            {/* Organic */}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-1
                  ${form.is_organic ? 'bg-green-600' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                    ${form.is_organic ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <input type="checkbox" name="is_organic" checked={form.is_organic} onChange={handle} className="sr-only" />
                <span className="font-medium text-gray-700">
                  <Leaf className="inline w-4 h-4 text-green-600 mr-1" />
                  This is organically grown produce
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)}
              className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <span className="spinner" /> : <Plus className="w-4 h-4" />}
              {loading ? 'Listing…' : 'List Crop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
