import Navbar from '@/components/user/Navbar'
import Footer from '@/components/user/Footer'

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}