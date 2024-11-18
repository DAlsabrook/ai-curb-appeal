"use client";

import '../styles/landing.css'
import { useUser } from './UserContext'; // Import the useUser hook


export default function Landing({ setOpenAppDashboard, setOpenAppLanding, setOpenAppPayment }) {
 const { user, setUser } = useUser(); // Use the useUser hook to get user and setUser

  return (
  <div className="landingContainer">
  </div>
  )
}

// What to do after successfull payment
// https://docs.stripe.com/checkout/fulfillment

// Landing page inspiration
// https://knowledge.hubspot.com/hubfs/landing-page-examples-13-20240628-8598415.webp
