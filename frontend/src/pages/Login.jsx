import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { Leaf, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

// Offline demo users - works without a backend
const DEMO_USERS = {
  farmer: {
    id: 'demo-farmer-1',
    full_name: 'Ramesh Kumar (Demo)',
    email: 'farmerdemo@kisanconnect.in',
    role: 'FARMER',
    phone: '+91 98765 43210',
    location: 'Cuttack, Odisha',
  },
  buyer: {
    id: 'demo-buyer-1',
    full_name: 'Priya Sharma (Demo)',
    email: 'buyerdemo@kisanconnect.in',
    role: 'CONSUMER',
    phone: '+91 87654 32109',
    location: 'Bhubaneswar, Odisha',
  },
  admin: {
    id: 'demo-admin-1',
    full_name: 'Admin User (Demo)',
    email: 'admin@kisanconnect.in',
    role: 'ADMIN',
    phone: '+91 76543 21098',
    location: 'New Delhi',
  },
}

export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`)
      if (user.role === 'FARMER') navigate('/farmer-dashboard')
      else if (user.role === 'ADMIN') navigate('/admin')
      else navigate('/buyer-dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail
      const message = err.response
        ? detail || 'Login failed. Please check your email and password.'
        : 'Backend not connected. Use Demo buttons to explore the app.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Demo login - works OFFLINE without backend
  const loginDemo = (role) => {
    const demoUser = DEMO_USERS[role]
    // Store a fake token and user in localStorage
    localStorage.setItem('kc_token', `demo-token-${role}`)
    localStorage.setItem('kc_demo_user', JSON.stringify(demoUser))
    toast.success(`Welcome, ${demoUser.full_name.split(' ')[0]}! (Demo Mode)`)
    if (role === 'farmer') navigate('/farmer-dashboard')
    else if (role === 'admin') navigate('/admin')
    else navigate('/buyer-dashboard')
    // Force reload so AuthContext picks up the new localStorage
    window.location.href = role === 'farmer' ? '/farmer-dashboard' : role === 'admin' ? '/admin' : '/buyer-dashboard'
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-12 page-enter">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="kc-card p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-green-700 rounded-2xl flex items-center justify-center shadow-glow-green mb-3">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-green-900">{t('auth.login.title', 'Welcome Back')}</h1>
            <p className="text-gray-500 text-sm mt-1">{t('auth.login.subtitle', 'Sign in to your KisanConnect account')}</p>
          </div>

          {/* Demo Buttons - work without backend */}
          <div className="mb-4">
            <p className="text-xs text-center text-gray-400 mb-2">Quick Demo Access (No login needed)</p>
            <div className="flex gap-2 mb-6">
              {['farmer', 'buyer', 'admin'].map((role) => (
                <button key={role} onClick={() => loginDemo(role)}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg border-2 border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition-colors capitalize">
                  🌾 Demo {role === 'farmer' ? 'Farmer' : role === 'buyer' ? 'Buyer' : 'Admin'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or login with credentials</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="kc-label">{t('auth.email', 'Email Address')}</label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handle}
                placeholder="you@example.com"
                className="kc-input"
              />
            </div>

            <div>
              <label className="kc-label">{t('auth.password', 'Password')}</label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handle}
                  placeholder="••••••••"
                  className="kc-input pr-11"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base">
              {loading ? <span className="spinner" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Signing In…' : t('auth.login.btn', 'Sign In')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('auth.login.noAccount', "Don't have an account?")}{' '}
            <Link to="/register" className="font-semibold text-green-700 hover:text-green-800">
              {t('auth.login.register', 'Register here')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}