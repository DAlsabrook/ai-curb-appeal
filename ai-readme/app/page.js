"use client";

import { useState, useEffect } from "react";
import Dashboard from './components/dashboard';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [openApp, setOpenApp] = useState(false);
  // const [user, setUser] = useState(null); // Store use information for client side use

  // // Wait for dom to render and then attach events for SignIn
  // useEffect(() => {
  //   const initializeGoogleSignIn = () => {
  //     window.gapi.load('auth2', () => {
  //       window.gapi.auth2.init({
  //         client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  //       }).then(() => {
  //         const auth2 = window.gapi.auth2.getAuthInstance();
  //         auth2.attachClickHandler(document.getElementById('googleSignInButton'), {},
  //           onSignIn, (error) => {
  //             console.error(JSON.stringify(error, undefined, 2));
  //           });
  //       });
  //     });
  //   };

  //   if (window.gapi) { // if gapi object is present kick off the party
  //     initializeGoogleSignIn();
  //   } else { // No gapi object, manually add the script tag and attach the init func
  //     const script = document.createElement("script");
  //     script.src = "https://apis.google.com/js/platform.js";
  //     script.async = true;
  //     script.defer = true;
  //     script.onload = initializeGoogleSignIn;
  //     document.body.appendChild(script);

  //     return () => {
  //       document.body.removeChild(script);
  //     };
  //   }
  // }, []);


  // // User has signed in. Backend API to OAuth to verify
  // function onSignIn(googleUser) {
  //   var profile = googleUser.getBasicProfile();
  //   console.log('Name: ' + profile.getName());
  //   console.log('Image URL: ' + profile.getImageUrl());
  //   console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

  //   // Get the ID token
  //   const id_token = googleUser.getAuthResponse().id_token;

  //   // Send the ID token to your backend
  //   fetch('/api/authenticate', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ id_token }),
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       console.log('Page.js - User authenticated:', data);
  //       // Store user data in state
  //       setUser({
  //         name: profile.getName(),
  //         email: profile.getEmail(),
  //         imageUrl: profile.getImageUrl(),
  //         id_tok: id_token,
  //       });
  //     })
  //     .catch(error => {
  //       console.error('Error:', error);
  //     });
  // }

  return (
    <div className="bodyContent">
      <header>
        <p className="headerLogo">AI Curb Appeal</p>
        <button onClick={() => setOpenApp(true)} className="threeD" style={{height: '40px'}}>Sign-in Button</button>
      </header>

      {openApp && (
        <Dashboard/>
      )}

      {/* Setting this to the side for later Google O-Auth 2.0 */}
      {/* <div id="googleSignInButton" className="g-signin2" data-onsuccess="onSignIn"></div>
      {user && (
        <div>
          <h2>Welcome, {user.name}</h2>
          <img src={user.imageUrl} alt={user.name} />
          <p>Email: {user.email}</p>
          <Dashboard />
        </div>
      )} */}
      <a href="https://x.com/David_Alsabrook" className="xLink" target="_blank" rel="noopener noreferrer">Created by: @David_Alsabrook</a>
    </div>
  );
}
