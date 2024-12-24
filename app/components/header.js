'use client'

import { useState } from 'react'
import { useUser } from './UserContext'
import { Zap, Settings, CreditCard, LogOut } from 'lucide-react'
import '../styles/header.css'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Header() {
  const { user, setUser } = useUser()
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false)

  // Sign-up form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [signUpError, setSignUpError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      if (email.toLowerCase() != "dfalsabrook@gmail.com") {
        setLoginError('This site is still under construction. Check back soon!')
        return;
      }
      const response = await fetch('/api/firebase/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setIsLoginModalOpen(false);
      } else {
        setLoginError(data.error);
      }
    } catch (error) {
      setLoginError('An unexpected error occurred');
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setSignUpError('')

    if (signUpPassword !== confirmPassword) {
      setSignUpError('Passwords do not match')
      return
    }

    try {
      setSignUpError("Working like is should.")
      // const response = await fetch('/api/firebase/auth/signup', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     firstName,
      //     lastName,
      //     email: signUpEmail,
      //     password: signUpPassword,
      //   }),
      // })

      // const data = await response.json()

      // if (response.ok) {
      //   setUser(data.user)
      //   setIsSignUpModalOpen(false)
      // } else {
      //   setSignUpError(data.error)
      // }
    } catch (error) {
      setSignUpError('An unexpected error occurred')
    }
  }

  const handleLogout = async (e) => {
    e.preventDefault();
    setUser(null);
    try {
      const response = await fetch('/api/firebase/auth/logout', {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) {
        setLoginError(data.error);
      }
    } catch (error) {
      setLoginError('An unexpected error occurred');
    }
  };

  const handleEmailChange = (e) => setEmail(e.target.value)
  const handlePasswordChange = (e) => setPassword(e.target.value)

  // TODO: Implement password change functionality
  const handleAccountPasswordChange = () => {
    console.log('Password change requested')
    // Add logic to change password
  }

  // TODO: Implement subscription toggle functionality
  const handleSubscriptionToggle = () => {
    setIsSubscriptionActive(!isSubscriptionActive)
    // Add logic to update subscription status in the database
  }

  // TODO: Implement account deactivation functionality
  const handleAccountDeactivation = () => {
    console.log('Account deactivation requested')
    // Add logic to deactivate the account
  }

  return (
    <header className="header">
      <div className="logo">
        <img src="/whiteCircle-black.png" alt="House logo" className="logoImg" width={35} height={35} />
        <p>AI CurbAppeal</p>
      </div>
      <nav>
        {user ? (
          <div className="user-menu">
            <div className="dropdown">
              <div className='user-display'>
                <div className="credits">
                  <Zap className="credits-icon" />
                  <span>Credits: {user.data.credits}</span>
                </div>
                <button className="avatar-button">
                  <img src={user.data.avatarUrl} alt={user.data.first} className="avatar-image" />
                </button>
              </div>
              <div className="dropdown-content">
                <button onClick={() => setIsAccountSettingsOpen(true)}>
                  <Settings className="dropdown-icon" />
                  <span>Account Settings</span>
                </button>
                <button>
                  <CreditCard className="dropdown-icon" />
                  <span>Add Credits</span>
                </button>
                <button onClick={handleLogout}>
                  <LogOut className="dropdown-icon" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className='login-buttons'>
            <Dialog open={isSignUpModalOpen} onOpenChange={setIsSignUpModalOpen}>
              <DialogTrigger asChild>
                <Button variant="default">Sign up</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Sign Up</DialogTitle>
                  <DialogDescription>
                    Create your account to get started.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSignUp}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="firstName" className="text-right">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="lastName" className="text-right">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="signUpEmail" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="signUpEmail"
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="signUpPassword" className="text-right">
                        Password
                      </Label>
                      <Input
                        id="signUpPassword"
                        type="password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="confirmPassword" className="text-right">
                        Confirm
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  {signUpError && <p className="text-red-500 text-sm mt-2">{signUpError}</p>}
                  <DialogFooter>
                    <Button type="submit">Sign Up</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Log in</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Log In</DialogTitle>
                  <DialogDescription>
                    Enter your credentials to access your account.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLogin}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password" className="text-right">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
                  <DialogFooter>
                    <Button type="submit">Log In</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </nav>

      {isAccountSettingsOpen && (
        <Dialog open={isAccountSettingsOpen} onOpenChange={setIsAccountSettingsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Account Settings</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="account-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="account-email"
                  value={user ? user.data.email : ''}
                  onChange={handleEmailChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="account-password" className="text-right">
                  Password
                </Label>
                <Button onClick={handleAccountPasswordChange} className="col-span-3">
                  Change Password
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="subscription">Subscription Status</Label>
                <Switch
                  id="subscription"
                  checked={isSubscriptionActive}
                  onCheckedChange={handleSubscriptionToggle}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAccountDeactivation} variant="destructive">
                Deactivate Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </header>
  )
}

