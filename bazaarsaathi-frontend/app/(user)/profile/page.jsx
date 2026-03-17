'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import useAuthStore from '@/store/useAuthStore'
import AddressCard from '@/components/user/AddressCard'
import AddressForm from '@/components/user/AddressForm'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)

  const [addresses,    setAddresses]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [editAddress,  setEditAddress]  = useState(null)

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/addresses')
        setAddresses(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAddresses()
  }, [])

  const handleAdded = (newAddr) => {
    setAddresses((prev) => [newAddr, ...prev])
    setShowForm(false)
  }

  const handleUpdated = (updated) => {
    setAddresses((prev) =>
      prev.map((a) => (a._id === updated._id ? updated : a))
    )
    setEditAddress(null)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/addresses/${id}`)
      setAddresses((prev) => prev.filter((a) => a._id !== id))
      toast.success('Address deleted.')
    } catch (err) {
      toast.error('Failed to delete address.')
    }
  }

  return (
    <div className="section">
      <div className="page-wrapper max-w-3xl">
        <h1 className="font-heading text-2xl font-bold text-dark mb-6">
          My Profile
        </h1>

        {/* User info card */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-dark">
                {user?.name}
              </h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className="badge-primary mt-1 inline-block">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-dark">
              Saved Addresses
            </h2>
            <button
              onClick={() => { setShowForm(!showForm); setEditAddress(null) }}
              className="btn-outline py-2 px-4 text-sm"
            >
              {showForm ? 'Cancel' : '+ Add New'}
            </button>
          </div>

          {/* Add form */}
          {showForm && (
            <div className="mb-5 pb-5 border-b border-gray-100">
              <AddressForm
                onAdded={handleAdded}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Edit form */}
          {editAddress && (
            <div className="mb-5 pb-5 border-b border-gray-100">
              <AddressForm
                editData={editAddress}
                onUpdated={handleUpdated}
                onCancel={() => setEditAddress(null)}
              />
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[1,2].map((i) => (
                <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📍</p>
              <p className="text-gray-400 text-sm">
                No saved addresses yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr._id}
                  address={addr}
                  onEdit={() => {
                    setEditAddress(addr)
                    setShowForm(false)
                  }}
                  onDelete={() => handleDelete(addr._id)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
