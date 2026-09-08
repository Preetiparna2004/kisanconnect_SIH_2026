import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Users, Leaf, Package, Activity, Clock, CheckCircle, XCircle, ShieldCheck, AlertTriangle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = ['Overview', 'Pending Crops', 'All Crops', 'All Users']

const statusBadge = {
  PENDING:  'bg-amber-100 text-amber-700 border-amber-200',
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('Overview')
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [allCrops, setAllCrops] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [rejectModal, setRejectModal] = useState(null) // { cropId, cropName }
  const [rejectReason, setRejectReason] = useState('')

  // Load stats on mount
  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => setStats({
        total_users: '—', total_farmers: '—', total_buyers: '—',
        total_crops: '—', pending_crops: '—', approved_crops: '—', total_orders: '—',
      }))
  }, [])

  // Load tab-specific data
  useEffect(() => {
    if (tab === 'Pending Crops') {
      setLoading(true)
      api.get('/admin/crops/pending')
        .then(r => setPending(r.data))
        .catch(() => toast.error('Failed to load pending crops'))
        .finally(() => setLoading(false))
    }
    if (tab === 'All Crops') {
      setLoading(true)
      api.get('/admin/crops/all')
        .then(r => setAllCrops(r.data))
        .catch(() => toast.error('Failed to load crops'))
        .finally(() => setLoading(false))
    }
    if (tab === 'All Users') {
      setLoading(true)
      api.get('/admin/users')
        .then(r => setUsers(r.data))
        .catch(() => toast.error('Failed to load users'))
        .finally(() => setLoading(false))
    }
  }, [tab])

  const handleApproval = async (cropId, status, reason = null) => {
    try {
      await api.patch(`/crops/${cropId}/approval`, {
        status,
        rejection_reason: reason,
      })
      toast.success(status === 'APPROVED' ? '✅ Crop approved! Now live in marketplace.' : '❌ Crop rejected.')
      setPending(prev => prev.filter(c => c.id !== cropId))
      // Refresh stats
      api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {})
      setRejectModal(null)
      setRejectReason('')
    } catch {
      toast.error('Action failed. Please try again.')
    }
  }

  const handleDeleteCrop = async (cropId) => {
    if (!window.confirm("Are you sure you want to delete this crop?")) return;
    try {
      await api.delete(`/crops/${cropId}`)
      toast.success('Crop deleted successfully')
      setAllCrops(prev => prev.filter(c => c.id !== cropId))
      setPending(prev => prev.filter(c => c.id !== cropId))
      // Refresh stats
      api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {})
    } catch {
      toast.error('Failed to delete crop')
    }
  }

  const toggleUserActive = async (userId, currentState) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`)
      toast.success(currentState ? 'User deactivated' : 'User activated')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u))
    } catch {
      toast.error('Failed to update user status')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-purple-700 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Logged in as {user?.full_name}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t}
            {t === 'Pending Crops' && stats?.pending_crops > 0 && (
              <span className="ml-2 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full inline-flex items-center justify-center">
                {stats.pending_crops}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {tab === 'Overview' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users',    value: stats?.total_users,    icon: Users,         color: 'bg-blue-50 text-blue-600' },
              { label: 'Total Farmers',  value: stats?.total_farmers,  icon: Leaf,          color: 'bg-green-50 text-green-600' },
              { label: 'Total Buyers',   value: stats?.total_buyers,   icon: Activity,      color: 'bg-purple-50 text-purple-600' },
              { label: 'Total Orders',   value: stats?.total_orders,   icon: Package,       color: 'bg-amber-50 text-amber-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="kc-card p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value ?? '...'}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="kc-card p-5 border-l-4 border-amber-400">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-gray-700">Pending Approval</span>
              </div>
              <p className="text-3xl font-bold text-amber-600">{stats?.pending_crops ?? '...'}</p>
              <button onClick={() => setTab('Pending Crops')} className="text-xs text-amber-600 font-semibold mt-2 hover:underline">
                Review now →
              </button>
            </div>
            <div className="kc-card p-5 border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-gray-700">Approved Crops</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats?.approved_crops ?? '...'}</p>
            </div>
            <div className="kc-card p-5 border-l-4 border-gray-300">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-700">Total Crops</span>
              </div>
              <p className="text-3xl font-bold text-gray-700">{stats?.total_crops ?? '...'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Pending Crops ── */}
      {tab === 'Pending Crops' && (
        <div>
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading...</div>
          ) : pending.length === 0 ? (
            <div className="kc-card p-16 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">All caught up!</h3>
              <p className="text-gray-400 text-sm">No crops are waiting for approval.</p>
            </div>
          ) : (
            <div className="kc-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-gray-700">{pending.length} crop{pending.length > 1 ? 's' : ''} awaiting review</span>
              </div>
              <div className="divide-y divide-gray-50">
                {pending.map(crop => (
                  <div key={crop.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 hover:bg-gray-50/70 transition-colors">
                    {/* Crop image */}
                    {crop.image_url ? (
                      <img src={crop.image_url} alt={crop.name} className="w-16 h-16 object-cover rounded-xl border border-gray-200 shrink-0" />
                    ) : (
                      <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                        <Leaf className="w-6 h-6 text-green-500" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className="font-bold text-gray-900 truncate">{crop.name}</p>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.PENDING}`}>
                          PENDING
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 capitalize mt-0.5">
                        {crop.category?.toLowerCase()} · ₹{crop.price_per_kg}/kg · {crop.quantity_kg} kg
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Farmer: {crop.farmer?.full_name || `ID #${crop.farmer_id}`} · {crop.location || '—'}
                      </p>
                      {crop.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{crop.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApproval(crop.id, 'APPROVED')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => setRejectModal({ cropId: crop.id, cropName: crop.name })}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-semibold rounded-xl transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: All Crops ── */}
      {tab === 'All Crops' && (
        <div className="kc-card overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Crop</th>
                  <th className="text-left px-5 py-3 font-semibold">Category</th>
                  <th className="text-left px-5 py-3 font-semibold">Price/Qty</th>
                  <th className="text-center px-5 py-3 font-semibold">Status</th>
                  <th className="text-center px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allCrops.map(crop => (
                  <tr key={crop.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        {crop.image_url ? (
                          <img src={crop.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <Leaf className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                        <span>{crop.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 capitalize">{crop.category?.toLowerCase()}</td>
                    <td className="px-5 py-3.5 text-gray-500">₹{crop.price_per_kg}/kg <br/> <span className="text-xs">{crop.quantity_kg} kg</span></td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge[crop.approval_status] || 'bg-gray-100 text-gray-700'}`}>
                        {crop.approval_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleDeleteCrop(crop.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex items-center gap-1.5 mx-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Tab: All Users ── */}
      {tab === 'All Users' && (
        <div className="kc-card overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Name</th>
                  <th className="text-left px-5 py-3 font-semibold">Email</th>
                  <th className="text-center px-5 py-3 font-semibold">Role</th>
                  <th className="text-left px-5 py-3 font-semibold">State</th>
                  <th className="text-center px-5 py-3 font-semibold">Status</th>
                  <th className="text-center px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{u.full_name}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        u.role === 'FARMER' ? 'bg-green-100 text-green-700 border-green-200' :
                        u.role === 'ADMIN'  ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{u.state || '—'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        u.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-600 border-red-200'
                      }`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => toggleUserActive(u.id, u.is_active)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          u.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-gray-900">Reject Crop Listing</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              You are rejecting <strong>{rejectModal.cropName}</strong>. Provide a reason so the farmer knows what to fix.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Image is unclear, price seems too high, description missing..."
              className="kc-input resize-none w-full mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="btn-secondary flex-1 justify-center">Cancel</button>
              <button
                onClick={() => handleApproval(rejectModal.cropId, 'REJECTED', rejectReason)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
