'use client'

import { useState } from 'react'
import { useUser } from './UserContext'
import { Zap, Settings, CreditCard, LogOut } from 'lucide-react'
import '../styles/header.css'

export default function Header() {
  const { user, setUser } = useUser()
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false)

  // TODO: Implement sign-up functionality
  // const handleSignUp = async (e) => {
  //   // Add sign-up logic here
  // }

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
        setUser(data.user);
        setIsLoginModalOpen(false);
      } else {
        setLoginError(data.error);
      }
    } catch (error) {
      setLoginError('An unexpected error occurred');
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
            <div className="credits">
              <Zap className="credits-icon" />
              <span>Credits: {user.data.credits}</span>
            </div>
            <div className="dropdown">
              <button className="avatar-button">
                <img src={user.data.avatarUrl} alt={user.data.first} className="avatar-image" />
              </button>
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
          <div>
            <button onClick={() => setIsSignUpModalOpen(true)} className="button">Sign up</button>
            <button onClick={() => setIsLoginModalOpen(true)} className="button">Log in</button>
          </div>
        )}
      </nav>

      {/* TODO: Implement sign-up modal */}
      {isSignUpModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={() => setIsSignUpModalOpen(false)} className="close-button">Close</button>
            <p>Sign Up Form</p>
            <form onSubmit={handleLogin} className="login-form">
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              {loginError && <p className="error">{loginError}</p>}
              <button type="submit" className="button">Log In</button>
            </form>
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={() => setIsLoginModalOpen(false)} className="close-button">Close</button>
            <form onSubmit={handleLogin} className="login-form">
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              {loginError && <p className="error">{loginError}</p>}
              <button type="submit" className="button">Log In</button>
            </form>
          </div>
        </div>
      )}

      {isAccountSettingsOpen && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={() => setIsAccountSettingsOpen(false)} className="close-button">Close</button>
            <h2>Account Settings</h2>
            <div className="account-settings">
              <div>
                <label htmlFor="account-email">Email</label>
                <input id="account-email" value={user ? user.data.email : ''} onChange={handleEmailChange} />
              </div>
              <div>
                <label htmlFor="account-password">Password</label>
                <button onClick={handleAccountPasswordChange} className="button outline">Change Password</button>
              </div>
              <div className="subscription-toggle">
                <label htmlFor="subscription">Subscription Status</label>
                <input
                  type="checkbox"
                  id="subscription"
                  checked={isSubscriptionActive}
                  onChange={handleSubscriptionToggle}
                />
              </div>
            </div>
            <button onClick={handleAccountDeactivation} className="button destructive">Deactivate Account</button>
          </div>
        </div>
      )}
    </header>
  )
}
