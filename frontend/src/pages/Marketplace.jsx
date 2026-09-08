import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cropService } from '../services/cropService'
import CropCard from '../components/CropCard'
import { Search, SlidersHorizontal, Leaf, X } from 'lucide-react'
import { mockCrops } from '../data/mockCrops'

const CATEGORIES = ['ALL','CEREALS','PULSES','VEGETABLES','FRUITS','SPICES','OILSEEDS','CASH_CROPS']

export default function Marketplace() {
  const { t } = useTranslation()
  const [crops, setCrops] = useState(mockCrops)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [organicOnly, setOrganicOnly] = useState(false)
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = {}
        if (search) params.search = search
        if (category !== 'ALL') params.category = category
        if (organicOnly) params.is_organic = true
        const { data } = await cropService.list(params)
        if (Array.isArray(data) && data.length > 0) setCrops(data)
        else setCrops(mockCrops)
      } catch { setCrops(mockCrops) }
      setLoading(false)
    }
    const timer = setTimeout(load, 400)
    return () => clearTimeout(timer)
  }, [search, category, organicOnly])

  const sorted = [...crops].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price_per_kg - b.price_per_kg
    if (sortBy === 'price-desc') return b.price_per_kg - a.price_per_kg
    return new Date(b.created_at) - new Date(a.created_at)
  })

  const filtered = sorted.filter((c) => {
    if (category !== 'ALL' && c.category !== category) return false
    if (organicOnly && !c.is_organic) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">{t('marketplace.title', 'Fresh Market')}</h1>
        <p className="section-subtitle">{t('marketplace.subtitle', 'Browse directly from farmers. No middlemen.')}</p>
      </div>

      {/* Search & Filters */}
      <div className="kc-card p-4 mb-8 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="market-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('marketplace.search', 'Search crops…')}
            className="kc-input pl-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select id="market-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="kc-select w-auto">
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>

        {/* Organic toggle */}
        <button
          onClick={() => setOrganicOnly(!organicOnly)}
          className={`flex items-center gap-1.5 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all
            ${organicOnly ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}
        >
          <Leaf className="w-4 h-4" /> Organic Only
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0
              ${category === cat
                ? 'bg-green-700 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'}`}>
            {cat === 'ALL' ? 'All Produce' : cat.charAt(0) + cat.slice(1).toLowerCase().replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-green-700">{filtered.length}</span> products
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Leaf className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No crops found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(filtered || []).map((crop) => <CropCard key={crop.id} crop={crop} />)}
        </div>
      )}
    </div>
  )
}
