"use client";

import '../styles/landing.css'
import Image from 'next/image';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { useUser } from './UserContext'; // Import the useUser hook


export default function Landing({ setOpenAppDashboard, setOpenAppLanding, setOpenAppPayment }) {
  const [promptResultsImg, setPromptResultsImg] = useState("/results/replicate-prediction-ttzkweh5nxrm20chtkcvqx13bm-0.png"); // Initialize state
  const { user, setUser } = useUser(); // Use the useUser hook to get user and setUser

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
          <Button
            variant="outlined"
            onClick={() => { setOpenAppPayment(true); setOpenAppLanding(false); }}
            style={{ width: "200px",
            borderRadius: 50,
            border: "1px solid white",
            color: "white",
            backgroundColor: 'var(--color-blue'}}>
              View all plans
          </Button>
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

      {/* Prompts section */}
      <div className='prompts'>
        <h2>Upload Images, Create Prompt, Get New Home</h2>
        <p>by just giving a simple prompt you can alter ANYTHING about your house</p>
        <div className='promptsContent'>

          <div className='promtFile'>
            <Image src='/file-1453.svg' alt='file image' width={350} height={350} />
            <div className='promptsUserImages'>
              <p>Upload Files</p>
              <Image src="/results/earhart-house-6.jpg" alt="House logo" className="promptUserImg" width={300} height={230} />
              <div className='promptsUserImagesSmall'>
                <Image src="/results/earhart-house-1.jpg" alt="House logo" className="promptUserImg" width={145} height={112} />
                <Image src="/results/earhart-house-5.jpg" alt="House logo" className="promptUserImg" width={145} height={112} />
              </div>
            </div>
          </div>

          <p className='lilArrow'>&rarr;</p>

          <div className='rainbowWrapper'>
            <div className='promptsSelector'>
              <h3>Select a Prompt</h3>
              <button className='promptSelectorBtn' onClick={() => { setPromptResultsImg('/results/replicate-prediction-ttzkweh5nxrm20chtkcvqx13bm-0.png')}}>"Brick Walls"</button>
              <button className='promptSelectorBtn' onClick={() => { setPromptResultsImg('/results/replicate-prediction-wvjykv1yvnrm60chtkgr5n902m-2.png') }}>"Add Landscaping"</button>
              <button className='promptSelectorBtn' onClick={() => { setPromptResultsImg('/results/replicate-prediction-wvjykv1yvnrm60chtkgr5n902m-3.png')}}>"Add Modern Paint"</button>
            </div>
          </div>

          <p className='lilArrow'>&rarr;</p>

          <div className='promptsResults'>
            <Image src={promptResultsImg} alt="House logo" className='promptsResult' width={350} height={350} />
          </div>

        </div>
      </div>

      {/* Who uses section */}
      <div className='whoFor'>
        <h2>Who is This Model For?</h2>
        <div className='whoForContent'>

          {/* item */}
          <div className='whoForItem'>
            <Image src='/results/family.jpg' alt="House logo" width={350} height={350} />
            <h3>Homeowners</h3>
          </div>

          {/* item */}
          <div className='whoForItem'>
            <h3>Property developers</h3>
          </div>

          {/* item */}
          <div className='whoForItem'>
            <h3>Contractors</h3>
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
