'use client'
import { useRouter } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  const router = useRouter()
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-xl font-bold text-dark mb-6">
        Add New Product
      </h1>
      <div className="card p-6">
        <ProductForm onSaved={() => router.push('/admin/products')} />
      </div>
    </div>
  )
}