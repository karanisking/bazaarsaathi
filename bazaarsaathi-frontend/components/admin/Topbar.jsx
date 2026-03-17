'use client'
import { usePathname } from 'next/navigation'
import useAuthStore from '@/store/useAuthStore'

const PAGE_TITLES = {
  '/admin/dashboard':       'Dashboard',
  '/admin/products':        'Products',
  '/admin/products/new':    'Add Product',
  '/admin/categories':      'Categories',
  '/admin/orders':          'Orders',
  '/admin/discounts':       'Discounts',
  '/admin/reviews':         'Reviews',
}

export default function TopBar() {
  const pathname = usePathname()
  const user     = useAuthStore((state) => state.user)

  // Handle dynamic routes like /admin/products/[id]
  const title =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith('/admin/products/') ? 'Edit Product' :
     pathname.startsWith('/admin/orders/')   ? 'Order Detail' :
     'Admin Panel')

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <h1 className="font-heading font-bold text-xl text-dark">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-dark">{user?.name}</p>
          <p className="text-xs text-gray-400">Administrator</p>
        </div>
        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-primary font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  )
}