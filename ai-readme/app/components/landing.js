"use client";
import '../styles/landing.css'
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

export default function Landing({ setOpenAppDashboard, setOpenAppLanding, setOpenAppPayment }) {
  return (
  <div className="landingContainer">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <button onClick={() => { setOpenAppDashboard(true); setOpenAppLanding(false); }} className="threeD" style={{ height: '40px', color: 'white', width: '150px', margin: '50px auto' }}>Go to app</button>
        <button onClick={() => { setOpenAppPayment(true); setOpenAppLanding(false); }} className="threeD" style={{ height: '40px', color: 'white', width: '150px', margin: '50px auto' }}>Payments Page</button>
      </SignedIn>
  </div>
  )
}

// What to do after successfull payment
// https://docs.stripe.com/checkout/fulfillment
