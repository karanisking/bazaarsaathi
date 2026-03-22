import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-16">
      <div className="page-wrapper py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="BazaarSaathi" className="h-12 w-auto mb-2" />
              <span className="font-heading font-bold text-xl">
                Bazaar<span className="text-primary">Saathi</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted grocery companion. Fresh products delivered
              right to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Home',       href: '/' },
                { label: 'Cart',       href: '/cart' },
                { label: 'My Orders',  href: '/orders' },
                { label: 'Profile',    href: '/profile' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">
              Contact
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <span>📧</span> support@bazaarsaathi.com
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span> +91 98765 43210
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-sm">
            © 2026 BazaarSaathi. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  )
}
