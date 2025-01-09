'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Loader from './loader'
import '../styles/landing.css'
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Image as ImageIcon, DollarSign, Users } from 'lucide-react';


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
    '/landing-page/ourhouse_result1.webp',
    '/results/earhart-house-3.jpg',
    '/results/earhart-house-4.jpg',
    '/landing-page/ourhouse_result2.webp',
    '/results/earhart-house-5.jpg',
    '/results/earhart-house-6.jpg',
    '/landing-page/ourhouse_result3.webp',
    '/results/earhart-house-7.jpg',
    '/results/earhart-house-8.jpg',
    '/landing-page/ourhouse_result4.webp',
    '/results/earhart-house-1.jpg',
    '/results/earhart-house-2.jpeg',
    '/landing-page/ourhouse_result5.webp',
    '/results/earhart-house-3.jpg',
    '/results/earhart-house-4.jpg',
    '/landing-page/ourhouse_result7.webp',
    '/landing-page/ourhouse_result6.webp'
  ]
  const columns = [[], [], [], []];

  // Distribute images into columns
  houseImages.forEach((img, index) => {
    columns[index % 4].push(img);
  });

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    customPaging: function (i) {
      return (
        <a>
          <Image
            src={`/landing-page/ourhouse_result${i + 1}.webp`}
            alt={`Preview ${i + 1}`}
            width={100}
            height={100}
            className="rounded-3xl"
          />
        </a>
      );
    },
    responsive: [
      {
        breakpoint: 768, // Mobile breakpoint
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div ref={containerRef} className="landing-page w-[80vw] m-auto h-auto">
      <section className="relative no-box min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="flex justify-between overflow-hidden h-[100%] absolute">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className={`image-column flex flex-col items-center w-[22%]`}>
              {Array.from({ length: 3 }).map((_, repeatIndex) => (
                column.map((img, imgIndex) => (
                  <Image
                    src={img}
                    alt={`House ${imgIndex + 1}`}
                    key={`${colIndex}-${imgIndex}-${repeatIndex}`}
                    width={150}
                    height={100}
                    className='w-[100%] mb-3 rounded-lg opacity-20'
                    />
                ))
              ))}
            </div>
          ))}
        </div>
        <motion.div className="hero-content relative z-[2] text-center p-5" style={{ y }}>
          <h1 className='text-4xl font-bold mb-5'><span className='text-purple-500'>Transform</span> Your Home with AI</h1>
          <p className='mb-5 opacity-60'>Design, visualize, and renovate with the power of artificial intelligence</p>
          <button className="cta-button p-3 text-lg rounded-full" onClick={() => setIsSignUpModalOpen(true)}>Start Your AI Renovation</button>
        </motion.div>
      </section>

      <section className="benefits flex flex-col justify-center items-center">
        <h2 className='text-center text-4xl w-[250px] mb-10 md:w-auto font-bold'>Why Try AI Curb Appeal?</h2>
        <Image
          className='min-w-[350px] h-auto'
          src={"/landing-page/laptop_on_white.png"}
          alt={"House before renovation"}
          width={500}
          height={500}
        />
        <div className="flex flex-col lg:flex-row justify-center text-left">
          <div className="benefit-card lg:mr-5 p-4 mb-8 lg:mb-1 lg:h-auto rounded-lg">
            <ImageIcon className="w-auto h-[100px] mx-auto my-6 text-purple-500" />
            <h3 className='font-bold text-center text-2xl mb-2'>Instant Visualization</h3>

            <p className='text-md p-1 border-b-4 border-gray-300 pb-4 mb-4'>Transform your ideas into stunning, photorealistic renderings of your home or property in moments.</p>

            <p className='text-md italic p-1 opacity-70'>See how new colors, materials, and landscaping will look before committing to costly changes. With AI Curb Appeal, you can experiment with endless possibilities to create the perfect design.</p>

          </div>
          <div className="benefit-card lg:mr-5 p-4 mb-8 lg:mb-1 lg:h-auto rounded-lg">
            <DollarSign className="w-auto h-[100px] mx-auto my-6 text-green-500" />
            <h3 className='font-bold text-center text-2xl mb-2'>Cost-Effective Planning</h3>
            <p className='text-md p-1 border-b-4 border-gray-300 pb-4 mb-4'>Save time and money by visualizing your renovations before breaking ground.</p>
            <p className='text-md italic p-1 opacity-70'>Our AI-powered tool eliminates guesswork, helping you make confident decisions that fit your style and budget. Plan smarter, avoid costly mistakes, and achieve your dream look efficiently.</p>
          </div>
          <div className="benefit-card lg:mr-5 p-4 mb-8 lg:mb-1 lg:h-auto rounded-lg">
            <Users className="w-auto h-[100px] mx-auto my-6 text-orange-500" />
            <h3 className='font-bold text-center text-2xl mb-2'>Client Collaboration</h3>
            <p className='text-md p-1 border-b-4 border-gray-300 pb-4 mb-4'>Simplify communication and collaboration with clients, contractors, or design teams.</p>
            <p className='text-md italic p-1 opacity-70'>Share detailed, AI-generated mockups to align visions and make adjustments with ease. Whether you&apos;re flipping homes or managing projects, AI Curb Appeal streamlines the design process for everyone involved.</p>
          </div>

        </div>
      </section>

      <section className="how-it-works no-box w-[100%] flex flex-col justify-center items-center m-auto">
        <h2 className='text-center text-4xl w-[220px] mb-10 md:w-auto font-bold'>How It Works</h2>
        <div className="steps flex flex-col w-[100%] max-w-[1200px] justify-center items-center my-auto mx-0">

          <div className="step flex flex-col w-[100%] md:flex-row justify-around text-center p-[30px] rounded-3xl">
            <Image
              className='w-[100%] md:w-[50%]'
              src={"/landing-page/ourhouse_stack.png"}
              alt={"House before renovation"}
              width={500}
              height={500}
            />
            <div className='flex flex-col justify-center items-center w-[100%] md:w-[40%]'>
              <div className="step-number">1</div>
              <h3 className='font-bold text-center text-2xl mb-2'>Upload Your Home</h3>
              <p className='text-left'>Take 10 - 20 images of your property and upload them to our system!</p>
              <p className='text-left'>Start by uploading clear images of your house or property from different angles. These photos will serve as the foundation for creating a personalized AI model tailored to your unique space. The better the photos, the more realistic and accurate your results will be!</p>
            </div>
          </div>

          <div className="step flex flex-col-reverse w-[100%] md:flex-row justify-center items-center text-center p-[30px] rounded-3xl">
            <div className='flex flex-col justify-center items-center w-[100%] md:w-[40%]'>
              <div className="step-number">2</div>
              <h3 className='font-bold text-center text-2xl mb-2'>Train Your AI Model</h3>
              <p className='text-left'>Our AI learns the unique features of your home!</p>
              <p className='text-left'>Once your images are uploaded, our system trains a specialized AI model designed to understand your home&apos;s structure and features. This step ensures that every generated design is customized to your specific property. The process is seamless, and you&apos;ll be ready to create in about 30 minutes.</p>
            </div>
            <div className="w-full mx-auto h-[500px] relative w-[100%] md:w-[50%] flex flex-col">
              <div className="shimmer-container absolute top-[-7.5%] mt-12 left-1/2 transform -translate-x-1/2 w-[320px]">
                <Image
                  className='w-[100%]'
                  src={"/landing-page/ourhouse_single.png"}
                  alt={"House before renovation"}
                  width={500}
                  height={500}
                />
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[270px]">
                <Image
                  className='w-[100%]'
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

          <div className="step flex flex-col-reverse md:flex-col w-[100%] justify-around text-center p-[30px] rounded-3xl">
            <div className='flex flex-col justify-center items-center md:w-[50%] m-auto'>
              <div className="step-number">3</div>
              <h3 className='font-bold text-center text-2xl mb-2'>Generate Designs</h3>
              <p className='text-left'>Use text prompts to change the exterior design of your home!</p>
              <p className='text-left'>Unleash your creativity by prompting the AI to reimagine your home’s exterior with different designs, materials, and features. From new wall colors to landscaping and lighting, the possibilities are endless. Instantly visualize your dream home and refine your ideas with ease!</p>
            </div>
            <div className='flex flex-col justify-around mt-5'>
              <Slider {...settings}>
                <div>
                  <Image
                    src={"/landing-page/ourhouse_result2.webp"}
                    alt={"House before renovation"}
                    width={400}
                    height={400}
                    className="rounded-3xl"
                  />
                </div>
                <div>
                  <Image
                    src={"/landing-page/ourhouse_result5.webp"}
                    alt={"House before renovation"}
                    width={400}
                    height={400}
                    className="rounded-3xl"
                  />
                </div>
                <div>
                  <Image
                    src={"/landing-page/ourhouse_result1.webp"}
                    alt={"House before renovation"}
                    width={400}
                    height={400}
                    className="rounded-3xl"
                  />
                </div>
                <div>
                  <Image
                    src={"/landing-page/ourhouse_result3.webp"}
                    alt={"House before renovation"}
                    width={400}
                    height={400}
                    className="rounded-3xl"
                  />
                </div>
                <div>
                  <Image
                    src={"/landing-page/ourhouse_result4.webp"}
                    alt={"House before renovation"}
                    width={400}
                    height={400}
                    className="rounded-3xl"
                  />
                </div>
                <div>
                  <Image
                    src={"/landing-page/ourhouse_result6.webp"}
                    alt={"House before renovation"}
                    width={400}
                    height={400}
                    className="rounded-3xl"
                  />
                </div>
                <div>
                  <Image
                    src={"/landing-page/ourhouse_result7.webp"}
                    alt={"House before renovation"}
                    width={400}
                    height={400}
                    className="rounded-3xl"
                  />
                </div>
              </Slider>
            </div>
          </div>
        </div>
      </section>

      <section className="interactive-demo flex flex-col justify-center items-center p-7">
        <h2 className='text-center text-4xl w-[220px] mb-10 md:w-auto font-bold'>See the Magic in Action</h2>
        <p>Experience the power of AI Curb Appeal with just a click! Select from pre-designed prompts to watch your home transform in real time, showcasing stunning design possibilities. From bold new colors to modern landscaping, see what’s possible and spark your creativity for your own project.</p>
        <div>
          <div className="flex flex-col justify-center items-center mb-0 mt-10">
            <div className='text-center h-auto w-[100%] md:w-[40%]'>
              <Image
                className='w-[100%] rounded-3xl'
                src={"/prompt_images/before-house.jpg"}
                alt={"House before renovation"}
                width={200}
                height={200}
                />
              <h3 className='italic'>An image the model was trained on</h3>
            </div>

            <div className="flex flex-col justify-center items-center text-center my-10">
              <div className='flex flex-col justify-center items-center relative min-h-[300px] w-[100%]  md:w-[40%]'>
                {isLoading && (
                  <Loader/>
                )}
                <AnimatePresence>
                  {showImage && (
                    <motion.img
                      className=' rounded-3xl'
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
              <h3 className='italic'>Prompt: {currentPrompt} Image</h3>
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
        <h2 className='text-center text-4xl w-[220px] mb-10 md:w-auto font-bold'>What Our Users Say</h2>
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
        <h2 className='text-center text-4xl w-[220px] mb-10 md:w-auto font-bold'>Frequently Asked Questions</h2>
        <div className="faq-list">
          <details>
            <summary>How realistic are the AI-generated designs?</summary>
            <p>Our AI models are trained using the specific images you provide, ensuring highly realistic and photorealistic results. The generated designs accurately reflect your property&apos;s dimensions, textures, and lighting, giving you a true-to-life preview of potential changes.</p>
          </details>
          <details>
            <summary>Can this tool be used for commercial properties or large-scale projects?</summary>
            <p>Absolutely! AI Curb Appeal is designed to work seamlessly with residential, commercial, and industrial properties. Whether you&apos;re redesigning a storefront, renovating a rental property, or planning updates for an office building, our AI adapts to your needs.</p>
          </details>
          <details>
            <summary>How long does it take to train the AI and generate designs?</summary>
            <p>Training your AI model typically takes about 30-45 minutes after uploading your images and you will only have to do this once. After training, designs are generated in seconds, allowing you to explore multiple ideas quickly and efficiently. We suggest making 1 change at a time and iterating on the design to get to your end goal!</p>
          </details>
          <details>
            <summary>What kinds of exterior changes can the AI handle?</summary>
            <p>The AI can modify a wide range of exterior elements, including wall colors, materials, roofing, windows, doors, landscaping, lighting, and more. You can experiment with subtle updates or completely reimagine the look of your property.</p>
          </details>
          <details>
            <summary>Do I need technical skills to use AI Curb Appeal?</summary>
            <p>No technical expertise is required! The platform is designed to be user-friendly, with intuitive prompts and straightforward processes. Upload your images, describe your vision, and let the AI do the rest.</p>
          </details>
          <details>
            <summary>Can I share the generated designs with others?</summary>
            <p>Yes, all generated designs can be easily downloaded and shared. Whether you&apos;re collaborating with contractors, designers, or clients, you can provide clear visual references to bring your vision to life.</p>
          </details>
        </div>
      </section>


      <footer className='rounded-t-3xl'>
        <div className="text-center flex flex-col justify-center items-center">
          <div className="flex flex-row justify-center items-center bg-white text-black h-[70px] rounded-full w-[200px]">
            <Image
              src={'/ripplesLogo.png'}
              alt={'AI Curb Appeal Logo'}
              width={69}
              height={69}
              />
            <p>Curb Appeal</p>
          </div>
          <div className="footer-links mt-10">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact Us</a>
          </div>
          <div className="footer-bottom m-auto">
            <p>&copy; {new Date().getFullYear()} AI Curb Appeal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

