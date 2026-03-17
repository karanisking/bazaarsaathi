'use client'
import { useEffect } from 'react'
import useAuthStore from '@/store/useAuthStore'
import useCartStore from '@/store/useCartStore'

export default function InitStore() {
  const init        = useAuthStore((state) => state.init)
  const fetchCart   = useCartStore((state) => state.fetchCart)
  const token       = useAuthStore((state) => state.token)
  const initialized = useAuthStore((state) => state.initialized)

  // On every page load → restore session silently
  useEffect(() => {
    init()
  }, [])

  // Once init is done and user has token → fetch cart
  useEffect(() => {
    if (initialized && token) {
      fetchCart()
    }
  }, [initialized, token])

  return null
}