import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="font-heading text-6xl font-bold text-primary mb-2">404</h1>
        <h2 className="font-heading text-2xl font-bold text-dark mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Back to Home
        </Link>
      </div>
    </div>
  )
}