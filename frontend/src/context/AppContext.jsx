import React, { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [cart, setCart] = useState([])
  const [notifications, setNotifications] = useState([])
  const [language, setLanguage] = useState(localStorage.getItem('i18nextLng') || 'en')

  const addToCart = useCallback((crop, qty) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.crop.id === crop.id)
      if (exists) {
        return prev.map((i) => i.crop.id === crop.id ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { crop, qty }]
    })
  }, [])

  const removeFromCart = useCallback((cropId) => {
    setCart((prev) => prev.filter((i) => i.crop.id !== cropId))
  }, [])

  const updateCartQty = useCallback((cropId, qty) => {
    if (qty <= 0) { removeFromCart(cropId); return }
    setCart((prev) => prev.map((i) => i.crop.id === cropId ? { ...i, qty } : i))
  }, [removeFromCart])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = cart.reduce((sum, i) => sum + i.crop.price_per_kg * i.qty, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  const addNotification = useCallback((msg) => {
    const id = Date.now()
    setNotifications((prev) => [{ id, msg, read: false }, ...prev])
    setTimeout(() => removeNotification(id), 10000)
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <AppContext.Provider value={{
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      cartTotal, cartCount,
      notifications, addNotification, removeNotification,
      language, setLanguage,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
