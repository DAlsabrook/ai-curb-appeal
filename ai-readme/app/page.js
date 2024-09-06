"use client";

import { useState, useEffect } from "react";
import Dashboard from './components/dashboard';
import Landing from './components/landing';
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [openAppDashboard, setOpenAppDashboard] = useState(false);
  const [openAppLanding, setOpenAppLanding] = useState(true);

  return (
    <div className="pageContent">
      <header>
        <a href="#" onClick={() => { setOpenAppDashboard(false), setOpenAppLanding(true) }} className="headerLogo">AI Curb Appeal</a>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      {openAppLanding && (
        <Landing
          setOpenAppDashboard={setOpenAppDashboard}
          setOpenAppLanding={setOpenAppLanding}
        />
      )}

      {openAppDashboard && (
        <SignedIn>
          <Dashboard/>
        </SignedIn>
      )}

      <a href="https://x.com/David_Alsabrook" className="xLink" target="_blank" rel="noopener noreferrer">X: &nbsp;&nbsp;&nbsp;<span>@David_Alsabrook</span></a>
    </div>
  );
}
