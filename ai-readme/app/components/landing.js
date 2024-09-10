"use client";
import '../styles/landing.css'
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

export default function Landing({ setOpenAppDashboard, setOpenAppLanding }) {
  return (
  <div className="landingContainer">
      <SignedOut>
        <SignInButton />

        <stripe-buy-button
          buy-button-id="buy_btn_1PxKnS02RqCe7z2q4uHEjAnb"
          publishable-key="pk_test_51Pwx0102RqCe7z2q0HI8Hjefqi4BdSdUhzlHVQGqHuqkEB1HNP8iB79mXfCXdqpI3x8FjiXWKp2FlruSwip1yJXu006rqYEW2c"
        >
        </stripe-buy-button>
      </SignedOut>
      <SignedIn>
        <button onClick={() => { setOpenAppDashboard(true); setOpenAppLanding(false); }} className="threeD" style={{ height: '40px', color: 'white', width: '150px', margin: '50px auto' }}>Go to app</button>
      </SignedIn>
  </div>
  )
}
