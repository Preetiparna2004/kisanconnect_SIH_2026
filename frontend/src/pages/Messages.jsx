import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Send, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { mockFarmers } from '../data/mockFarmers'

export default function Messages() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const toId = searchParams.get('to')

  const [conversations, setConversations] = useState(mockFarmers.map((f) => ({ ...f, last_message: 'Click to chat' })))
  const [activeId, setActiveId] = useState(toId ? parseInt(toId) : null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!activeId) return
    api.get(`/messages/conversation/${activeId}`)
      .then((r) => setMessages(r.data))
      .catch(() => setMessages([
        { id: 1, sender_id: activeId, receiver_id: user?.id, content: 'Hello! I saw your inquiry about my rice. How can I help?', created_at: new Date().toISOString(), is_read: true },
        { id: 2, sender_id: user?.id, receiver_id: activeId, content: 'Hi! I wanted to know if you have organic Basmati available in bulk.', created_at: new Date().toISOString(), is_read: true },
      ]))
  }, [activeId, user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activeId) return
    setSending(true)
    try {
      await api.post('/messages/', { receiver_id: activeId, content: text })
      setMessages((prev) => [...prev, {
        id: Date.now(), sender_id: user?.id, receiver_id: activeId,
        content: text, created_at: new Date().toISOString(), is_read: false,
      }])
      setText('')
    } catch {
      // Optimistic update even if API fails in demo
      setMessages((prev) => [...prev, {
        id: Date.now(), sender_id: user?.id, receiver_id: activeId,
        content: text, created_at: new Date().toISOString(), is_read: false,
      }])
      setText('')
    }
    setSending(false)
  }

  const active = conversations.find((c) => c.id === activeId)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <h1 className="section-title mb-6">Messages</h1>
      <div className="kc-card overflow-hidden flex" style={{ height: '70vh' }}>
        {/* Sidebar */}
        <div className="w-72 shrink-0 border-r border-gray-100 overflow-y-auto">
          {conversations.map((c) => (
            <button key={c.id} onClick={() => setActiveId(c.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-green-50 transition-colors text-left
                ${activeId === c.id ? 'bg-green-50 border-r-2 border-green-600' : ''}`}>
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                {c.full_name?.[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{c.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{c.last_message}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        {activeId ? (
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-green-50/50">
              <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {active?.full_name?.[0] || '?'}
              </div>
              <div>
                <p className="font-bold text-gray-800">{active?.full_name}</p>
                <p className="text-xs text-green-600">Farmer · {active?.state}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm
                      ${isMe
                        ? 'bg-green-700 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                      {msg.content}
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-green-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={send} className="px-4 py-3 border-t border-gray-100 flex gap-3">
              <input
                id="message-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                className="kc-input flex-1"
              />
              <button type="submit" disabled={sending || !text.trim()} className="btn-primary px-4 py-2.5">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <MessageSquare className="w-16 h-16 opacity-30" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}
