'use client'
import { useUser } from './components/UserContext'
import Header from './components/header'
import LandingPage from './components/landing'
import Dashboard from './components/dashboard'
import './styles/page.css'
import { useState } from 'react'

export default function Home() {
  const { user } = useUser()
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <Header isSignUpModalOpen={isSignUpModalOpen} setIsSignUpModalOpen={setIsSignUpModalOpen} />
      <main className="flex-grow">
        {user ?
          <Dashboard />
          :
          <LandingPage setIsSignUpModalOpen={setIsSignUpModalOpen} />}
      </main>
    </div>
  )
}
