import { Suspense } from 'react'
import ProductClient from '../ProductClient'

export async function generateMetadata({ params }) {
  const { id } = await params   // ← await params in Next.js 15
  try {
    const res  = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
      { cache: 'no-store' }
    )
    const data = await res.json()
    const p    = data.data
    return {
      title:       `${p.name} — BazaarSathi`,
      description: p.description?.slice(0, 155),
      openGraph: {
        title:  p.name,
        images: [p.images?.[0]?.url ?? '/logo.png'],
      },
    }
  } catch {
    return { title: 'Product — BazaarSathi' }
  }
}

export default async function ProductPage({ params }) {
  const { id } = await params   // ← await params in Next.js 15

  return (
    <Suspense fallback={
      <div className="section">
        <div className="page-wrapper animate-pulse grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gray-200 rounded-3xl aspect-square" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    }>
      <ProductClient id={id} />
    </Suspense>
  )
}