import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import LanguageSelector from './LanguageSelector'
import {
  Leaf, ShoppingCart, User, Menu, X, LayoutDashboard,
  LogOut, Store, Brain, BarChart2, MapPin, MessageSquare,
  Star, Shield
} from 'lucide-react'

export default function Navbar() {
  const { t } = useTranslation()
  const { user, logout, isFarmer, isBuyer, isAdmin, isAuthenticated } = useAuth()
  const { cartCount } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  const farmerLinks = [
    { to: '/farmer-dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/add-crop', label: t('nav.addCrop'), icon: Leaf },
    { to: '/orders', label: t('nav.orders'), icon: Store },
    { to: '/ai-recommendation', label: t('nav.aiAdvisor'), icon: Brain },
    { to: '/demand-forecast', label: t('nav.forecast'), icon: BarChart2 },
    { to: '/messages', label: t('nav.messages'), icon: MessageSquare },
  ]

  const buyerLinks = [
    { to: '/buyer-dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/marketplace', label: t('nav.marketplace'), icon: Store },
    { to: '/orders', label: t('nav.myOrders'), icon: Star },
    { to: '/weather', label: t('nav.weather'), icon: MapPin },
    { to: '/messages', label: t('nav.messages'), icon: MessageSquare },
  ]

  const links = isAdmin ? [] : isFarmer ? farmerLinks : buyerLinks

  return (
    <nav className="sticky top-0 z-50 glass shadow-md border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shadow-md group-hover:bg-green-600 transition-colors">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-green-800">
              Kisan<span className="text-earth-500">Connect</span>
            </span>
          </Link>

          {/* Desktop Links */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-green-50 hover:text-green-700'}`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:bg-purple-50'}`}>
                  <Shield className="w-4 h-4" /> Admin
                </NavLink>
              )}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <LanguageSelector />

            {isAuthenticated ? (
              <>
                {/* Cart (buyers) */}
                {isBuyer && (
                  <Link to="/payment" className="relative btn-ghost p-2 rounded-xl">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-earth-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-green-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user?.full_name?.[0] || 'U'}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user?.full_name?.split(' ')[0]}
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 glass rounded-2xl shadow-xl border border-green-100 py-2 animate-fade-in">
                      <div className="px-4 py-2 border-b border-green-50">
                        <p className="text-sm font-semibold text-green-900 truncate">{user?.full_name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
                      </div>
                      <Link to={isFarmer ? '/farmer-dashboard' : '/buyer-dashboard'}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-800 transition-colors"
                        onClick={() => setProfileOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <button
                        onClick={() => { logout(); setProfileOpen(false) }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary py-2 text-sm">
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-green-50 text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && isAuthenticated && (
          <div className="lg:hidden py-3 border-t border-green-100 animate-slide-up">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium mb-1 transition-colors
                  ${isActive ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-green-50'}`
                }
              >
                <Icon className="w-4 h-4" />{label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
