'use client'

import { motion } from 'framer-motion'
import '../styles/loader.css'

export default function Loader() {
    return (
      <div className="loader-container">
          <div className="ripple-loader">
              {[1, 2, 3].map((i) => (
                  <motion.div
                      key={i}
                      className="ripple"
                      animate={{
                          scale: [1, 2, 1],
                          opacity: [0.8, 0, 0.8],
                      }}
                      transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                      }}
                  />
              ))}
          </div>
      </div>
    )
}
