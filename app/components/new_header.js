'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ImagePlus, Zap, Settings, CreditCard, LogOut } from 'lucide-react'

export default function HeaderWithAccountSettings({ isLoggedIn, onLogin, onLogout }) {
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [email, setEmail] = useState('user@example.com')
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(true)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = () => {
    console.log('Password change requested')
    // TODO: Implement password change functionality
  }

  const handleImageUpload = (e) => {
    console.log('Image upload requested')
    // TODO: Implement image upload functionality
  }

  const handleSubscriptionToggle = () => {
    setIsSubscriptionActive(!isSubscriptionActive)
    // TODO: Update subscription status in the database
  }

  const handleAccountDeactivation = () => {
    console.log('Account deactivation requested')
    // TODO: Implement account deactivation logic
  }

  const handleLogin = (e) => {
    e.preventDefault()
    // TODO: Implement actual login logic
    onLogin()
    setIsLoginModalOpen(false)
  }

  return (
    <header className="header">
      <div className="logo">
        <ImagePlus className="logo-icon" />
        <h1>AI Image Gen</h1>
      </div>
      <div className="user-menu">
        {isLoggedIn ? (
          <>
            <div className="credits">
              <Zap className="credits-icon" />
              <span>Credits: 100</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="user-avatar">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsAccountSettingsOpen(true)}>
                  <Settings className="menu-icon" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="menu-icon" />
                  <span>Add Credits</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onLogout}>
                  <LogOut className="menu-icon" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button onClick={() => setIsLoginModalOpen(true)}>Login</Button>
        )}
      </div>

      <Dialog open={isAccountSettingsOpen} onOpenChange={setIsAccountSettingsOpen}>
        <DialogContent className="account-settings-modal">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
          </DialogHeader>
          <div className="account-settings-content">
            <div className="avatar-section">
              <Avatar className="avatar-large">
                <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <Input id="picture" type="file" className="hidden" onChange={handleImageUpload} />
                <Button asChild>
                  <Label htmlFor="picture">Change Picture</Label>
                </Button>
              </div>
            </div>
            <div className="form-group">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={handleEmailChange} />
            </div>
            <div className="form-group">
              <Label htmlFor="password">Password</Label>
              <Button onClick={handlePasswordChange} variant="outline">Change Password</Button>
            </div>
            <div className="form-group subscription-toggle">
              <Label htmlFor="subscription">Subscription Status</Label>
              <Switch
                id="subscription"
                checked={isSubscriptionActive}
                onCheckedChange={handleSubscriptionToggle}
              />
            </div>
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
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="login-modal">
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="login-button">Login</Button>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
