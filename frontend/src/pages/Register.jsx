import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { Leaf, Eye, EyeOff, UserPlus, Tractor, ShoppingBag, Building2, User } from 'lucide-react'
import toast from 'react-hot-toast'

const STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi']

export default function Register() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '',
    role: 'CONSUMER', state: '', district: '', village: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Account created successfully! Please log in, ${user.full_name.split(' ')[0]}! 🌱`)
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-16 page-enter">
      <div className="w-full max-w-lg">
        <div className="kc-card p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-green-700 rounded-2xl flex items-center justify-center shadow-glow-green mb-3">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-green-900">{t('auth.register.title', 'Create Account')}</h1>
            <p className="text-gray-500 text-sm mt-1">Join KisanConnect today</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { role: 'CONSUMER',   label: 'Consumer',    icon: User,        desc: 'Buy directly for personal use' },
              { role: 'BULK_BUYER', label: 'Bulk Buyer',  icon: ShoppingBag, desc: 'Wholesale purchases & MOQs' },
              { role: 'FARMER',     label: 'Farmer',      icon: Tractor,     desc: 'Sell your produce directly' },
              { role: 'FPO',        label: 'FPO',         icon: Building2,   desc: 'Farmer Producer Org' },
            ].map(({ role, label, icon: Icon, desc }) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 text-left
                  ${form.role === role
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-200'}`}
              >
                <Icon className={`w-6 h-6 ${form.role === role ? 'text-green-700' : 'text-gray-400'}`} />
                <span className={`font-semibold text-sm ${form.role === role ? 'text-green-800' : 'text-gray-600'}`}>{label}</span>
                <span className="text-[10px] text-gray-400 text-center leading-tight">{desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="kc-label">Full Name</label>
                <input id="reg-name" name="full_name" required value={form.full_name} onChange={handle}
                  placeholder="Ramesh Kumar Patel" className="kc-input" />
              </div>
              <div>
                <label className="kc-label">Email</label>
                <input id="reg-email" name="email" type="email" required value={form.email} onChange={handle}
                  placeholder="you@example.com" className="kc-input" />
              </div>
              <div>
                <label className="kc-label">Phone</label>
                <input id="reg-phone" name="phone" type="tel" value={form.phone} onChange={handle}
                  placeholder="+91 9876543210" className="kc-input" />
              </div>
              <div>
                <label className="kc-label">State</label>
                <select id="reg-state" name="state" value={form.state} onChange={handle} className="kc-select">
                  <option value="">Select State</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="kc-label">District</label>
                <input id="reg-district" name="district" value={form.district} onChange={handle}
                  placeholder="Your district" className="kc-input" />
              </div>
              {(form.role === 'FARMER' || form.role === 'FPO') && (
                <div className="col-span-2">
                  <label className="kc-label">Village / Town / HQ Location</label>
                  <input id="reg-village" name="village" value={form.village} onChange={handle}
                    placeholder="Your village or HQ location" className="kc-input" />
                </div>
              )}
              <div className="col-span-2">
                <label className="kc-label">Password</label>
                <div className="relative">
                  <input id="reg-password" name="password" type={showPw ? 'text' : 'password'} required
                    value={form.password} onChange={handle}
                    placeholder="Min. 6 characters" className="kc-input pr-11" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base mt-2">
              {loading ? <span className="spinner" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Creating Account…' : t('auth.register.btn', 'Create Account')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-green-700 hover:text-green-800">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
