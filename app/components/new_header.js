'use client'

import { useState } from 'react'
import { useUser } from './UserContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Zap, Settings, CreditCard, LogOut } from 'lucide-react'

export default function Header() {
  const { user, setUser } = useUser()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const response = await fetch('/api/firebase/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('components/login.js Response from backend')
        console.log(data.user)
        setUser(data.user); // Update the user state globally
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    }
  }

  const handleLogout = async (e) => {
    e.preventDefault();
    setUser(null);
    if (openAppDashboard) {
      setOpenAppPayment(false);
      setOpenAppDashboard(false);
      setOpenAppLanding(true);
    }
    try {
      const response = await fetch('/api/firebase/auth/logout', {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
  }

  const handleAccountPasswordChange = () => {
    // TODO: Implement password change functionality
    console.log('Password change requested')
  }

  const handleSubscriptionToggle = () => {
    setIsSubscriptionActive(!isSubscriptionActive)
    // TODO: Update subscription status in the database
  }

  const handleAccountDeactivation = () => {
    // TODO: Implement account deactivation logic
    console.log('Account deactivation requested')
  }

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center">
        <img src="/whiteCircle-black.png" alt="House logo" className="logoImg" width={35} height={35} />
        <p>AI CurbAppeal</p>
      </div>
      <nav>
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Zap className="h-5 w-5 mr-1 text-yellow-500" />
              <span>Credits: {user.credits}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsAccountSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Add Credits</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button onClick={() => setIsLoginModalOpen(true)}>Log In</Button>
        )}
      </nav>

      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log In</DialogTitle>
            <DialogDescription>Enter your credentials to access your account</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            {loginError && <p className="text-red-500">{loginError}</p>}
            <Button type="submit" className="w-full">Log In</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAccountSettingsOpen} onOpenChange={setIsAccountSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="account-email">Email</Label>
              <Input id="account-email" value={user ? user.email : ''} onChange={handleEmailChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account-password">Password</Label>
              <Button onClick={handleAccountPasswordChange} variant="outline">Change Password</Button>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="subscription">Subscription Status</Label>
              <Switch
                id="subscription"
                checked={isSubscriptionActive}
                onCheckedChange={handleSubscriptionToggle}
              />
            </div>
          </div>
          <DialogFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Deactivate Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAccountDeactivation}>Deactivate</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
