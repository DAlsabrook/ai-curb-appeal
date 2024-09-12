"use client";

import { useState, useEffect } from "react";
import Dashboard from './components/dashboard';
import Landing from './components/landing';
import PaymentPage from "./components/payment";
import Image from 'next/image';

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [openAppLanding, setOpenAppLanding] = useState(true);
  const [openAppDashboard, setOpenAppDashboard] = useState(false);
  const [openAppPayment, setOpenAppPayment] = useState(false);

  return (
    <div className="pageContent">
      <header>
        <div className="logo" onClick={() => { setOpenAppPayment(false), setOpenAppDashboard(false), setOpenAppLanding(true) }}>
          <Image src="/whiteCircle-black.png" alt="House logo" className="logoImg" width={35} height={35} />
          <p><span>AI</span> CurbAppeal</p>
        </div>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <div className="headerUserItems">
            <button onClick={() => { setOpenAppDashboard(true); setOpenAppLanding(false); }} className="threeD" style={{ height: '30px', color: 'white', width: '100px', cursor: 'pointer' }}>Dashboard</button>
            <UserButton />
          </div>
        </SignedIn>
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

      {openAppDashboard && (
        <SignedIn>
          <Dashboard
            setOpenAppDashboard={setOpenAppDashboard}
            setOpenAppLanding={setOpenAppLanding}
            setOpenAppPayment={setOpenAppPayment}
          />
        </SignedIn>
      )}

      <a href="https://x.com/David_Alsabrook" className="xLink" target="_blank" rel="noopener noreferrer">X: &nbsp;&nbsp;&nbsp;<span>@David_Alsabrook</span></a>
    </div>
  );
}
