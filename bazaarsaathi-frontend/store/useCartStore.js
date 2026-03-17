import { create } from 'zustand'
import api from '@/lib/axios'

const useCartStore = create((set) => ({
  items:      [],
  itemsTotal: 0,
  count:      0,

  // Fetch cart from backend → called after login + on refresh
  fetchCart: async () => {
    try {
      const res = await api.get('/cart')
      const { items, itemsTotal } = res.data.data
      const count = items.reduce((sum, item) => sum + item.quantity, 0)
      set({ items, itemsTotal, count })
    } catch (err) {
      set({ items: [], itemsTotal: 0, count: 0 })
    }
  },

  // Update cart locally after any cart API call
  // so count updates instantly without extra fetch
  setCart: (items, itemsTotal) => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    set({ items, itemsTotal, count })
  },

  // Called on logout
  clearCart: () => {
    set({ items: [], itemsTotal: 0, count: 0 })
  },
}))

export default useCartStore