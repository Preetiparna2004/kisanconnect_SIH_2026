import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Star, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Feedback() {
  const { user } = useAuth()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [farmerId, setFarmerId] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!farmerId) return toast.error('Please enter a Farmer ID')
    setLoading(true)
    try {
      await api.post('/feedback/', { farmer_id: parseInt(farmerId), rating, comment })
      toast.success('Feedback submitted! Thank you.')
      setComment('')
      setRating(5)
    } catch {
      toast.error('Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 page-enter">
      <h1 className="section-title mb-6">Leave Feedback</h1>
      <div className="kc-card p-8">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="kc-label">Farmer ID</label>
            <input type="number" required value={farmerId} onChange={(e) => setFarmerId(e.target.value)} placeholder="e.g. 1" className="kc-input" />
          </div>
          <div>
            <label className="kc-label mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)} className="p-1 focus:outline-none">
                  <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="kc-label">Comment</label>
            <textarea required value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="How was the produce quality and experience?" className="kc-input resize-none" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? <span className="spinner" /> : <MessageSquare className="w-4 h-4" />} Submit Feedback
          </button>
        </form>
      </div>
    </div>
  )
}
