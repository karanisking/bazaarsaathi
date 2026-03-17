export default function AuthLayout({ children }) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
        {children}
      </div>
    )
  }