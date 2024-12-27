'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Loader from './loader'
import '../styles/landing.css'

const LandingPage = () => {
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
      setIsLoading(true)
      setShowImage(false)
      const timer = setTimeout(() => {
        setIsLoading(false)
        setShowImage(true)
      }, 2000) // Simulate 2 seconds of "AI generation"
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
          <button className="cta-button">Start Your AI Renovation Journey</button>
        </motion.div>
      </section>

      <section className="benefits">
        <h2>Why Choose AI Curb Appeal?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>Unlimited Design Options</h3>
            <p>Explore countless exterior designs without committing to costly renovations</p>
          </div>
          <div className="benefit-card">
            <h3>Cost-Effective Planning</h3>
            <p>Save money by visualizing changes before purchasing materials</p>
          </div>
          <div className="benefit-card">
            <h3>Client Collaboration</h3>
            <p>Generate multiple designs to present to your clients</p>
          </div>
          <div className="benefit-card">
            <h3>Instant Visualization</h3>
            <p>See your ideas come to life in seconds, not days</p>
          </div>
        </div>
      </section>

      <section className="how-it-works no-box">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Your Home</h3>
            <p>Take 10 - 20 images of your property and upload them to our system</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Train Your AI Model</h3>
            <p>Our AI learns the unique features of your home</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Generate Designs</h3>
            <p>Use text prompts to change the exterior design of your home</p>
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
                height={500}
                />
            </div>
            <div className="after-image">
              <h3>After Prompt: {currentPrompt}</h3>

              <div className="image-container">
                {isLoading && (
                  <Loader/>
                  // <div className="loader-container">
                  //   <div className="ripple-loader">
                  //     {[1, 2, 3].map((i) => (
                  //       <motion.div
                  //         key={i}
                  //         className="ripple"
                  //         animate={{
                  //           scale: [1, 2, 1],
                  //           opacity: [0.8, 0, 0.8],
                  //         }}
                  //         transition={{
                  //           duration: 2,
                  //           repeat: Infinity,
                  //           delay: i * 0.2,
                  //         }}
                  //       />
                  //     ))}
                  //   </div>
                  // </div>
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
            <h4>- Mark T., Interior Designer</h4>
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
          <div className="footer-logo">
            <Image
              src={'/whiteCircle-black.png'}
              alt={'AI Curb Appeal Logo'}
              width={40}
              height={40}
              />
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

