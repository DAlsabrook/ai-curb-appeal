import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import React from 'react'
import Head from 'next/head';


// Default fonts for MaterialUI
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AICurbAppeal",
  description: "Elevate your home's exterior design with AI! Whether you're looking to clean up your current look, bring sketches and 3D models to life, or completely redesign for inspiration, our AI-driven platform has you covered. Discover your home's full potential with AICurbAppeal.com.",
};
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <title>{metadata.title}</title>
          <meta name="description" content={metadata.description} />
        </Head>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
