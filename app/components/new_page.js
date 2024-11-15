'use client'

import { useState } from 'react'
import HeaderWithAccountSettings from './HeaderWithAccountSettings'
import Dashboard from './Dashboard'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

function LandingPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    // In a real application, you would validate credentials here
    onLogin()
  }

  return (
    <div className="landing-page">
      <h1>Welcome to AI Image Gen</h1>
      <div className="login-container">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <CardFooter className="login-footer">
                <Button type="submit">Login</Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="landing-content">
        <h2>Generate Amazing Images with AI</h2>
        <p>
          Use our powerful AI to create stunning images from text descriptions. Perfect for artists, designers, and creative professionals.
        </p>
        <div className="cta-buttons">
          <Button variant="outline">Learn More</Button>
          <Button>Sign Up</Button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  return (
    <div className="app-container">
      <HeaderWithAccountSettings />
      <main className="main-content">
        {isLoggedIn ? (
          <Dashboard />
        ) : (
          <LandingPage onLogin={handleLogin} />
        )}
      </main>
      <footer className="app-footer">
        <p>&copy; 2024 AI Image Gen. All rights reserved.</p>
      </footer>
    </div>
  )
}
