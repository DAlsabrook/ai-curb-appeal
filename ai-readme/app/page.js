"use client";

import { useState, useEffect } from "react";
import Dashboard from './components/dashboard'; // Switching dashboards here
import Landing from './components/landing';
import PaymentPage from "./components/payment";
import Login from './components/login';
import Image from 'next/image';
import { useUser } from './components/UserContext'; // Import the useUser hook
import Admin from '@/app/components/admin'

// Firebase
import { auth } from './firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function Home() {
  const [openAppLanding, setOpenAppLanding] = useState(true);
  const [openAppDashboard, setOpenAppDashboard] = useState(false);
  const [openAppPayment, setOpenAppPayment] = useState(false);
  const [error, setError] = useState(null); // Define the error state
  const { user, setUser } = useUser(); // Use the useUser hook to get user and setUser

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [setUser]);

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

              {user && user.uid === 'ghKALyqoHHOMOknTGMsrk86sqOW2' && (
              <Admin/>
            )}

            <button onClick={() => {
              setOpenAppDashboard(true);
              setOpenAppLanding(false);
              setOpenAppPayment(false)
            }}>Dashboard</button>

            <button onClick={handleLogout}>Logout</button>

          </div>
        )}
      </header>

      {openAppLanding && (
        <Landing
          setOpenAppDashboard={setOpenAppDashboard}
          setOpenAppLanding={setOpenAppLanding}
          setOpenAppPayment={setOpenAppPayment}
        />
      )}

      {openAppPayment && (
        <PaymentPage
          setOpenAppDashboard={setOpenAppDashboard}
          setOpenAppLanding={setOpenAppLanding}
          setOpenAppPayment={setOpenAppPayment}
        />
      )}

      {openAppDashboard && user && (
        <Dashboard
          setOpenAppDashboard={setOpenAppDashboard}
          setOpenAppLanding={setOpenAppLanding}
          setOpenAppPayment={setOpenAppPayment}
        />
      )}

      <a href="https://x.com/David_Alsabrook" className="xLink" target="_blank" rel="noopener noreferrer">X: &nbsp;&nbsp;&nbsp;<span>@David_Alsabrook</span></a>
    </div>
  );
}
