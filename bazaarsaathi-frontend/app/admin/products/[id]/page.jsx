'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/axios'
import ProductForm from '@/components/admin/ProductForm'
export const dynamic = 'force-dynamic'

export default function EditProductPage() {
  const { id }   = useParams()
  const router   = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-xl font-bold text-dark mb-6">
        Edit Product
      </h1>
      <div className="card p-6">
        <ProductForm
          editData={product}
          onSaved={() => router.push('/products')}
        />
      </div>
    </div>
  )
}
