'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Loader from './loader'
import '../styles/landing.css'

const LandingPage = ({ setIsSignUpModalOpen }) => {
  const [currentPrompt, setCurrentPrompt] = useState('"Red brick with dark paint"')
  const [isLoading, setIsLoading] = useState(false)
  const [showImage, setShowImage] = useState(true)
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  const prompts = [
    '"Red brick with dark paint"',
    '"Add a modern beige paint"',
    '"Add fresh white paint and better landscaping"',
  ]

  const getImageForPrompt = (prompt) => {
    const promptImages = {
      'Red brick with dark paint': '/prompt_images/red_brick_house.png',
      'Add a modern beige paint': '/prompt_images/beige.png',
      'Add fresh white paint and better landscaping': '/prompt_images/white_paint.png',
    }
    return promptImages[prompt.replace(/"/g, '')]
  }

  useEffect(() => {
    if (currentPrompt) {
      setTimeout(() => {
        setIsLoading(true)
      }, 500);
      setShowImage(false)
      const timer = setTimeout(() => {
        setIsLoading(false)
        setShowImage(true)
      }, 2500) // Simulate 2 seconds of "AI generation"
      return () => clearTimeout(timer)
    }
  }, [currentPrompt])

  const houseImages = [
    '/results/earhart-house-1.jpg',
    '/results/earhart-house-2.jpeg',
    '/results/earhart-house-3.jpg',
    '/results/earhart-house-4.jpg',
    '/results/earhart-house-5.jpg',
    '/results/earhart-house-6.jpg',
    '/results/earhart-house-7.jpg',
    '/results/earhart-house-8.jpg',
    '/results/earhart-house-1.jpg',
    '/results/earhart-house-2.jpeg',
    '/results/earhart-house-3.jpg',
    '/results/earhart-house-4.jpg',
  ]
  const columns = [[], [], [], []];

  // Distribute images into columns
  houseImages.forEach((img, index) => {
    columns[index % 4].push(img);
  });

  return (
    <div ref={containerRef} className="landing-page">
      <section className="hero no-box">
        <div className="hero-background">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className={`image-column ${colIndex % 2 === 0 ? 'up' : 'down'}`}>
              {Array.from({ length: 2 }).map((_, repeatIndex) => (
                column.map((img, imgIndex) => (
                  <Image
                    src={img}
                    alt={`House ${imgIndex + 1}`}
                    key={`${colIndex}-${imgIndex}-${repeatIndex}`}
                    width={150}
                    height={100}
                    />
                ))
              ))}
            </div>
          ))}
        </div>
        <motion.div className="hero-content" style={{ y }}>
          <h1>Transform Your Home with AI</h1>
          <p>Design, visualize, and renovate with the power of artificial intelligence</p>
          <button className="cta-button" onClick={() => setIsSignUpModalOpen(true)}>Start Your AI Renovation Journey</button>
        </motion.div>
      </section>

      <section className="benefits">
        <h2>Why Try AI Curb Appeal?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>Instant Visualization</h3>
            <p>See your ideas come to life in seconds, not days</p>
          </div>
          <div className="benefit-card">
            <h3>Cost-Effective Planning</h3>
            <p>Save money by visualizing changes before purchasing materials</p>
          </div>
          <div className="benefit-card">
            <h3>Client Collaboration</h3>
            <p>Generate multiple designs to present to your clients</p>
          </div>

        </div>
      </section>

      <section className="how-it-works no-box">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step rounded-3xl">
            <Image
              className='step-image'
              src={"/landing-page/ourhouse_stack.png"}
              alt={"House before renovation"}
              width={500}
              height={500}
              style={{width: '50%', height: 'auto'}}
            />

            <div className='step-text'>
              <div className="step-number">1</div>
              <h3>Upload Your Home</h3>
              <p>Take 10 - 20 images of your property and upload them to our system</p>
            </div>
          </div>
          <div className="step rounded-3xl">
            <div className='step-text w-[50%]'>
              <div className="step-number">2</div>
              <h3>Train Your AI Model</h3>
              <p>Our AI learns the unique features of your home</p>
            </div>

            <div className="w-full max-w-md mx-auto h-[500px] relative w-[50%]">
              <div className="shimmer-container absolute top-[-7.5%] left-1/2 transform -translate-x-1/2 w-[95%]">
                <Image
                  src={"/landing-page/ourhouse_single.png"}
                  alt={"House before renovation"}
                  width={500}
                  height={500}
                />
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60%]">
                <Image
                  src={"/landing-page/aiBrain.png"}
                  alt={"House before renovation"}
                  width={400}
                  height={400}
                />
              </div>
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="absolute top-[32%] left-[48.8%] w-0.5 bg-gray-700"
                  style={{
                    height: 'calc(74.5% - 12rem)',
                    transform: `translateX(${(index - 2) * 9}px)`,
                  }}
                >
                  <div className="absolute top-[0px] left-[-1.5px] w-0.8 bg-gray-700">&nbsp;</div>
                  <motion.div
                    className="w-full h-8 bg-orange-400"
                    animate={{
                      y: ['0%', '500%'],
                      opacity: [0, 1, 1, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.6,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="step rounded-3xl">
            <Image
              src={"/landing-page/ourhouse_white_walls.webp"}
              alt={"House before renovation"}
              width={400}
              height={400}
              className='rounded-3xl'
            />
            <div className='step-text'>
              <div className="step-number">3</div>
              <h3>Generate Designs</h3>
              <p>Use text prompts to change the exterior design of your home</p>
            </div>
          </div>
        </div>
      </section>

      <section className="interactive-demo">
        <h2>See the Magic in Action</h2>
        <div className="demo-container">
          <div className="image-comparison">
            <div className="before-image">
              <h3>Before</h3>
              <Image
                src={"/prompt_images/before-house.jpg"}
                alt={"House before renovation"}
                width={200}
                height={200}
                />
            </div>
            <div className="after-image">
              <h3>After Prompt: {currentPrompt}</h3>

              <div className="image-container">
                {isLoading && (
                  <Loader/>
                )}
                <AnimatePresence>
                  {showImage && (
                    <motion.img
                      key={currentPrompt}
                      src={getImageForPrompt(currentPrompt)}
                      alt={`${currentPrompt} style house`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="prompt-selector">
            <p>Select a prompt to visualize:</p>
            <div className="prompt-buttons">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setCurrentPrompt(prompt)}
                  className={currentPrompt === prompt ? 'active' : ''}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials no-box">
        <h2>What Our Users Say</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>&quot;I saved thousands on my renovation by visualizing different options first!&quot;</p>
            <h4>- Sarah J., Homeowner</h4>
          </div>
          <div className="testimonial-card">
            <p>&quot;My clients love seeing multiple design options. It&apos;s revolutionized my business.&quot;</p>
            <h4>- Mark T., Contractor</h4>
          </div>
        </div>
      </section>

      <section className="faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          <details>
            <summary>How accurate are the AI-generated designs?</summary>
            <p>Our AI models are trained on your specific property, ensuring high accuracy and realism in the generated designs.</p>
          </details>
          <details>
            <summary>Can I use this for commercial properties?</summary>
            <p>AI Curb Appeal works great for both residential and commercial properties.</p>
          </details>
          <details>
            <summary>How long does it take to generate a design?</summary>
            <p>Most designs are generated within seconds, allowing for rapid iteration and exploration.</p>
          </details>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div className="logo ml-8 bg-white text-black p-8 h-14 rounded-full">
            <Image
              src={'/ripplesLogo.png'}
              alt={'AI Curb Appeal Logo'}
              width={69}
              height={69}
              />
            <p>Curb Appeal</p>
          </div>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact Us</a>
          </div>
          <div className="social-icons">
            {/* Add your social media icons here */}
          </div>
        </div>
        <div className="copyright">
          © 2024 AI Curb Appeal. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

