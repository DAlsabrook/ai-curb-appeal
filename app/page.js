'use client'

import { useUser } from './components/UserContext'
import Header from './components/new_header'
import LandingPage from './components/landing'
import Dashboard from './components/new_dashboard'
import './styles/new_page.css'

export default function Home() {
  const { user } = useUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {user ? <Dashboard /> : <LandingPage />}
      </main>
      <footer className="py-4 text-center bg-background border-t">
        <p>&copy; 2024 AI Curb Appeal. All rights reserved.</p>
      </footer>
    </div>
  )
}
