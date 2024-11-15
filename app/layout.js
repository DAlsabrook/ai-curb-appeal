"use client";

import "./globals.css";
import React from 'react'
import Head from 'next/head';
import { UserProvider } from './components/UserContext';
import { metadata } from './metadata';


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Head>
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
