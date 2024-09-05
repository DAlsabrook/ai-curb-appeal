"use client";
import '../styles/landing.css'

export default function Landing({ setOpenAppDashboard, setOpenAppLanding }) {
  return (
  <div className="landingContainer">
      <button onClick={() => { setOpenAppDashboard(true); setOpenAppLanding(false); }} className="threeD" style={{ height: '40px', color: 'white', width: '150px', margin: '0 auto' }}>Sign-in Button</button>
  </div>
  )
}
