"use client";
import '../styles/landing.css'
import Image from 'next/image';
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

export default function Landing({ setOpenAppDashboard, setOpenAppLanding, setOpenAppPayment }) {
  return (
  <div className="landingContainer">
      <div className='blueShadow'></div>
      <div className='orangeShadow'></div>

      <div className='bannerContainer'>
        {/* Left Side */}
        <div className='bannerLeftContent'>
          <h1>AI House Remodel</h1>
          <p>Redesign the exterior of your home with no material cost.</p>
          <p>Create an AI model based on your house and change the style</p>
          <p>Homeowners</p>
          <p>Flippers</p>
          <p>Agents</p>

          <button onClick={() => { setOpenAppPayment(true); setOpenAppLanding(false); }} className="plansButton">View all plans</button>
        </div>

        {/* Right side */}
        <div className='bannerRightContent'>
          <div className='bannerPhotoGrid'>
            <div className='bannerPhotoGridRow'>
              <Image src="/results/replicate-prediction-ttzkweh5nxrm20chtkcvqx13bm-0.png" alt="House logo" className="bannerHouseImg" width={200} height={200} />
              <Image src="/results/replicate-prediction-wvjykv1yvnrm60chtkgr5n902m-2.png" alt="House logo" className="bannerHouseImg" width={200} height={200} />
              <Image src="/results/replicate-prediction-ttzkweh5nxrm20chtkcvqx13bm-1.png" alt="House logo" className="bannerHouseImg" width={200} height={200} />
            </div>
            <div className='bannerPhotoGridRow'>
              <Image src="/results/replicate-prediction-wvjykv1yvnrm60chtkgr5n902m-3.png" alt="House logo" className="bannerHouseImg" width={200} height={200} />
              <Image src="/results/replicate-prediction-wvjykv1yvnrm60chtkgr5n902m-2.png" alt="House logo" className="bannerHouseImg" width={200} height={200} />
              <Image src="/results/replicate-prediction-ttzkweh5nxrm20chtkcvqx13bm-0.png" alt="House logo" className="bannerHouseImg" width={200} height={200} />
            </div>
            <div className='bannerPhotoGridRow'>
              <Image src="/results/replicate-prediction-wvjykv1yvnrm60chtkgr5n902m-2.png" alt="House logo" className="bannerHouseImg" width={200} height={200} />
              <Image src="/results/replicate-prediction-ttzkweh5nxrm20chtkcvqx13bm-1.png" alt="House logo" className="bannerHouseImg" width={200} height={200} />
              <Image src="/results/replicate-prediction-wvjykv1yvnrm60chtkgr5n902m-3.png" alt="House logo" className="bannerHouseImg" width={200} height={200} />
            </div>
          </div>
        </div>
      </div>
  </div>
  )
}

// What to do after successfull payment
// https://docs.stripe.com/checkout/fulfillment

// Landing page inspiration
// https://knowledge.hubspot.com/hubfs/landing-page-examples-13-20240628-8598415.webp
