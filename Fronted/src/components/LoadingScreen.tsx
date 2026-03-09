import React from "react"
import { motion } from "motion/react"

const LoadingScreen: React.FC = () => (
  <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <motion.div
        className="w-16 h-16 bg-gradient-to-br from-primary to-sage-700 rounded-2xl flex items-center justify-center mx-auto mb-4"
        animate={{ 
          rotateY: [0, 180, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <span className="text-white font-bold text-xl">S</span>
      </motion.div>
      <motion.p
        className="text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Loading ServeEase...
      </motion.p>
    </motion.div>
  </div>
)

export { LoadingScreen }