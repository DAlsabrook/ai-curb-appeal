'use client'

import { useUser } from './components/UserContext'
import Header from './components/header'
import LandingPage from './components/landing'
import Dashboard from './components/dashboard'
import './styles/page.css'

export default function Home() {
  const { user } = useUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {user ? <Dashboard /> : <LandingPage />}
      </main>
    </div>
  )
}
