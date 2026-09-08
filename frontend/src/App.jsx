import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import Marketplace from './pages/Marketplace'
import CropDetails from './pages/CropDetails'
import FarmerProfile from './pages/FarmerProfile'
import AddCrop from './pages/AddCrop'
import CropPending from './pages/CropPending'
import Orders from './pages/Orders'
import Payment from './pages/Payment'
import Messages from './pages/Messages'
import Weather from './pages/Weather'
import AIRecommendation from './pages/AIRecommendation'
import DemandForecast from './pages/DemandForecast'
import RouteOptimization from './pages/RouteOptimization'
import Feedback from './pages/Feedback'
import AdminDashboard from './pages/AdminDashboard'

// Route Guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? children : <Navigate to="/login" />
}

const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  return user && roles.includes(user.role) ? children : <Navigate to="/" />
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) {
    if (user?.role === 'FARMER') return <Navigate to="/farmer-dashboard" />
    if (user?.role === 'ADMIN') return <Navigate to="/admin" />
    return <Navigate to="/buyer-dashboard" />
  }
  return children
}

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/crop/:id" element={<CropDetails />} />
          <Route path="/farmer/:id" element={<FarmerProfile />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/ai-recommendation" element={<AIRecommendation />} />
          <Route path="/demand-forecast" element={<DemandForecast />} />
          <Route path="/route-optimization" element={<RouteOptimization />} />

          {/* Protected */}
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/feedback" element={<PrivateRoute><Feedback /></PrivateRoute>} />

          {/* Roles */}
          <Route path="/farmer-dashboard" element={<RoleRoute roles={['FARMER']}><FarmerDashboard /></RoleRoute>} />
          <Route path="/add-crop" element={<RoleRoute roles={['FARMER']}><AddCrop /></RoleRoute>} />
          <Route path="/crop-pending" element={<RoleRoute roles={['FARMER']}><CropPending /></RoleRoute>} />
          <Route path="/buyer-dashboard" element={<RoleRoute roles={['CONSUMER', 'BULK_BUYER']}><BuyerDashboard /></RoleRoute>} />
          <Route path="/payment" element={<RoleRoute roles={['CONSUMER', 'BULK_BUYER']}><Payment /></RoleRoute>} />
          <Route path="/admin" element={<RoleRoute roles={['ADMIN']}><AdminDashboard /></RoleRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
