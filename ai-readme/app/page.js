"use client";

import { useState, useEffect } from "react";
import Dashboard from './components/dashboard';
import Landing from './components/landing';
import PaymentPage from "./components/payment";

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
        {/* Close all pages and returnt to landing page */}
        <a href="#" onClick={() => { setOpenAppPayment(false), setOpenAppDashboard(false), setOpenAppLanding(true) }} className="headerLogo">AI Curb Appeal</a>
        <SignedIn>
          <UserButton />
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
