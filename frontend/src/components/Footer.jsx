import React from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Phone, Mail, MapPin, Github, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-green-950 text-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Kisan<span className="text-earth-400">Connect</span>
              </span>
            </Link>
            <p className="text-green-400 text-sm leading-relaxed">
              Empowering farmers by eliminating intermediaries and enabling direct market access.
            </p>

          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-2">
              {[
                { to: '/weather', label: 'Weather Forecast' },
                { to: '/demand-forecast', label: 'Demand Forecast' },
                { to: '/route-optimization', label: 'Route Optimizer' },
                { to: '/#', label: 'Multilingual' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-green-400 hover:text-green-200 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Farmers */}
          <div>
            <h4 className="font-semibold text-white mb-4">For Farmers</h4>
            <ul className="space-y-2">
              {[
                { to: '/register', label: 'Register as Farmer' },
                { to: '/farmer-dashboard', label: 'Farmer Dashboard' },
                { to: '/add-crop', label: 'List Your Crop' },
                { to: '/feedback', label: 'Feedback' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-green-400 hover:text-green-200 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-green-400">
                <Phone className="w-4 h-4 shrink-0" />
                <span>1800-180-KISAN (Toll Free)</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-green-400">
                <Mail className="w-4 h-4 shrink-0" />
                <span>support@kisanconnect.in</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-green-400">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Bhubaneswar, Odisha</span>
              </li>
            </ul>
            {/* Language badges */}
            <div className="flex gap-2 mt-5">
              {['English', 'हिंदी', 'ଓଡ଼ିଆ'].map((lang) => (
                <span key={lang} className="px-2.5 py-1 bg-green-800 text-green-200 text-xs rounded-lg font-medium">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-green-900 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-green-500 text-sm">
            © 2026 KisanConnect.
          </p>
        </div>
      </div>
    </footer>
  )
}
