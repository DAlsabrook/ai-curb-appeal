'use client'

import { motion } from 'framer-motion'

export default function Loader() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-24 h-24">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 border-4 border-purple-500 rounded-full"
                        animate={{
                            scale: [1, 1.5, 1],
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
