'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import '../styles/landing.css'

const LandingPage = () => {
  const [currentPrompt, setCurrentPrompt] = useState('Modern')
  const containerRef = React.useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  const prompts = [
    'Modern',
    'Victorian',
    'Mediterranean',
  ]

  const getImageForPrompt = (prompt) => {
    return `/prompt_images/${prompt.toLowerCase()}-house.jpg`
  }

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
      <section className="hero">
        <div className="hero-background">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className={`image-column ${colIndex % 2 === 0 ? 'up' : 'down'}`}>
              {Array.from({ length: 2 }).map((_, repeatIndex) => (
                column.map((img, imgIndex) => (
                  <img key={`${colIndex}-${imgIndex}-${repeatIndex}`} src={img} alt={`House ${imgIndex + 1}`} />
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

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Your Home</h3>
            <p>Take a photos or upload existing 10 - 20 images of your property</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Train Your AI Model</h3>
            <p>Our AI learns the unique features of your home</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Generate Designs</h3>
            <p>Use text prompts to create unlimited exterior design options</p>
          </div>
        </div>
      </section>

      <section className="interactive-demo">
        <h2>See the Magic in Action</h2>
        <div className="demo-container">
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
          <div className="image-comparison">
            <div className="before-image">
              <h3>Before</h3>
              <img src="/prompt_images/before-house.jpg" alt="House before renovation" />
            </div>
            <div className="after-image">
              <h3>After Prompt: {currentPrompt}</h3>
              <img
                src={getImageForPrompt(currentPrompt)}
                alt={`${currentPrompt} style house`}
                className='fade-in'
              />
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>"I saved thousands on my renovation by visualizing different options first!"</p>
            <h4>- Sarah J., Homeowner</h4>
          </div>
          <div className="testimonial-card">
            <p>"My clients love seeing multiple design options. It's revolutionized my business."</p>
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
            <img src="/images/logo.png" alt="AI Curb Appeal Logo" />
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
          © 2023 AI Curb Appeal. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
