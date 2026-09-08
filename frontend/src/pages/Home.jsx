import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Leaf, TrendingUp, ShieldCheck, Users, Truck, Brain, Star, ChevronRight, Zap } from 'lucide-react'
import { cropService } from '../services/cropService'
import { mockCrops } from '../data/mockCrops'
import { mockFarmers } from '../data/mockFarmers'
import CropCard from '../components/CropCard'
import FarmerCard from '../components/FarmerCard'
import CropImage from '../components/CropImage'

const stats = [
  { value: '2.4L+', label: 'Registered Farmers' },
  { value: '₹850Cr', label: 'Trade Volume' },
  { value: '18%', label: 'Higher Farmer Income' },
  { value: '23%', label: 'Lower Consumer Prices' },
]

const features = [
  { icon: ShieldCheck, title: 'Zero Intermediaries', desc: 'Direct farmer-to-buyer connections ensuring maximum profit for growers.', color: 'text-green-600 bg-green-100' },
  { icon: Brain, title: 'AI Crop Advisor', desc: 'Soil and climate-based ML recommendations for optimal crop selection.', color: 'text-purple-600 bg-purple-100' },
  { icon: TrendingUp, title: 'Demand Forecasting', desc: 'Price and demand predictions powered by time-series analytics.', color: 'text-blue-600 bg-blue-100' },
  { icon: Truck, title: 'Route Optimization', desc: 'Nearest-neighbor TSP routing for cost-efficient logistics.', color: 'text-earth-600 bg-earth-100' },
  { icon: Users, title: 'FPO Support', desc: 'Farmer Producer Organizations can list and manage bulk produce.', color: 'text-amber-600 bg-amber-100' },
  { icon: Leaf, title: 'Multilingual', desc: 'Full support for English, Hindi, and Odia languages.', color: 'text-teal-600 bg-teal-100' },
]

export default function Home() {
  const { t } = useTranslation()
  const [recentCrops, setRecentCrops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const { data } = await cropService.list()
        setRecentCrops(Array.isArray(data) && data.length > 0 ? data.slice(0, 8) : mockCrops.slice(0, 8))
      } catch (err) {
        setRecentCrops(mockCrops.slice(0, 8))
      } finally {
        setLoading(false)
      }
    }
    fetchCrops()
  }, [])

  return (
    <div className="page-enter">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-earth-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-white">

              <h1 className="font-display text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                {t('home.hero.title', 'Farm to Table,')}<br />
                <span className="text-gradient bg-gradient-to-r from-green-300 to-earth-300">
                  {t('home.hero.subtitle', 'Without the Middleman')}
                </span>
              </h1>

              <p className="text-green-200 text-lg leading-relaxed mb-10 max-w-lg">
                {t('home.hero.desc', 'KisanConnect empowers 140M+ Indian farmers with direct market access, AI-driven crop advisory, and real-time demand forecasting — eliminating the intermediary tax.')}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-accent text-base px-8 py-3.5">
                  {t('home.hero.cta1', 'Join as Farmer')} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/marketplace" className="btn-secondary border-green-400 text-green-100 hover:bg-green-800/30 text-base px-8 py-3.5">
                  {t('home.hero.cta2', 'Browse Marketplace')}
                </Link>
              </div>

            </div>

            {/* Hero Logo */}
            <div className="hidden lg:flex items-center justify-center relative">
              <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full w-96 h-96 m-auto"></div>
              <img
                src="/hero-logo.jpg"
                alt="KisanConnect Hero Logo"
                className="w-[500px] h-auto relative z-10 hover:scale-105 transition-transform duration-500"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
          </div>


        </div>
      </section>

      {/* ── How it Works ──────────────────────────────────────────────── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap className="w-3.5 h-3.5" /> Simple Process
            </div>
            <h2 className="section-title">How KisanConnect Works</h2>
            <p className="section-subtitle mx-auto">Three simple steps to connect farms with families</p>
          </div>

          <div className="relative mt-16">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-px bg-green-200" />

            <div className="grid md:grid-cols-3 gap-12 text-center relative z-10">
              {[
                { step: '01', title: 'Farmer Lists Crop', desc: 'Register, upload crop details, set price and quantity.' },
                { step: '02', title: 'Buyer Discovers', desc: 'Search, filter, and find fresh crops near you.' },
                { step: '03', title: 'Direct Transaction', desc: 'Order, pay, and track. Farmer delivers directly to you.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="relative group">
                  <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center font-display font-bold text-2xl text-white shadow-xl shadow-green-600/20 mb-8 ring-8 ring-white">
                    {step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">{t('home.features.title', 'Why KisanConnect?')}</h2>
            <p className="section-subtitle mx-auto">{t('home.features.subtitle', 'Everything farmers and buyers need in one intelligent platform.')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="kc-card p-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marketplace Preview ────────────────────────────────────────── */}
      <section className="py-24 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">{t('home.crops.title', 'Fresh From the Farm')}</h2>
              <p className="section-subtitle">{t('home.crops.subtitle', 'Directly sourced, fairly priced produce.')}</p>
            </div>
            <Link to="/marketplace" className="btn-ghost font-semibold gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              (recentCrops || []).map((crop) => <CropCard key={crop.id} crop={crop} />)
            )}
          </div>
        </div>
      </section>



      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Ready to Transform Indian Agriculture?
          </h2>
          <p className="text-green-200 text-lg mb-10">
            Join thousands of farmers already earning 18% more by selling direct.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-accent px-10 py-4 text-base">
              Register Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/ai-recommendation" className="btn-secondary border-green-400 text-green-100 hover:bg-green-800/30 px-10 py-4 text-base">
              Try AI Advisor
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
