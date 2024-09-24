"use client";

import { useState, useEffect } from "react";
import Dashboard from './components/dashboard';
import Landing from './components/landing';
import PaymentPage from "./components/payment";
import Login from './components/login';
import Image from 'next/image';

// Firebase
import { auth } from './firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { logoutUser } from './firebase/auth'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [openAppLanding, setOpenAppLanding] = useState(true);
  const [openAppDashboard, setOpenAppDashboard] = useState(false);
  const [openAppPayment, setOpenAppPayment] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="pageContent">
      <header>
        <div className="logo" onClick={() => { setOpenAppPayment(false), setOpenAppDashboard(false), setOpenAppLanding(true) }}>
          <Image src="/whiteCircle-black.png" alt="House logo" className="logoImg" width={35} height={35} />
          <p><span>AI</span> CurbAppeal</p>
        </div>
        {!user ? (
          <Login />
        ) : (
          <div className="headerUserItems">
            <button onClick={() => {
              setOpenAppDashboard(true);
              setOpenAppLanding(false);
              setOpenAppPayment(false)
              }} className="threeD" style={{ height: '30px', color: 'white', width: '100px', cursor: 'pointer' }}>Dashboard</button>
            <button onClick={() => {
              logoutUser();
              if (openAppDashboard) {
                setOpenAppPayment(false);
                setOpenAppDashboard(false);
                setOpenAppLanding(true);
              }
            }} className="threeD" style={{ height: '30px', color: 'white', width: '100px', cursor: 'pointer' }}>Logout</button>
          </div>
        )}
      </header>

      {openAppLanding && (
        <Landing
          setOpenAppDashboard={setOpenAppDashboard}
          setOpenAppLanding={setOpenAppLanding}
          setOpenAppPayment={setOpenAppPayment}
          user={user}
        />
      )}

      {openAppPayment && (
        <PaymentPage
          setOpenAppDashboard={setOpenAppDashboard}
          setOpenAppLanding={setOpenAppLanding}
          setOpenAppPayment={setOpenAppPayment}
          user={user}
        />
      )}

      {openAppDashboard && user && (
        <Dashboard
          setOpenAppDashboard={setOpenAppDashboard}
          setOpenAppLanding={setOpenAppLanding}
          setOpenAppPayment={setOpenAppPayment}
          user={user}
        />
      )}

      <a href="https://x.com/David_Alsabrook" className="xLink" target="_blank" rel="noopener noreferrer">X: &nbsp;&nbsp;&nbsp;<span>@David_Alsabrook</span></a>
    </div>
  );
}
