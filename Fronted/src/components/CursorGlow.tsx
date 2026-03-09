import React, { useState, useEffect, useCallback } from "react"
import { motion } from "motion/react"

const CursorGlow: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isMoving, setIsMoving] = useState(false)

  // Memoize event handlers to prevent unnecessary re-renders
  const updateMousePosition = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
    setIsVisible(true)
    setIsMoving(true)
    
    // Clear moving state after a short delay
    clearTimeout((window as any).glowTimeout)
    ;(window as any).glowTimeout = setTimeout(() => setIsMoving(false), 100)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false)
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      document.removeEventListener("mouseleave", handleMouseLeave)
      clearTimeout((window as any).glowTimeout)
    }
  }, [updateMousePosition, handleMouseLeave])

  return (
    <>
      {/* Outer Glow - 500px */}
      <motion.div
        className="fixed pointer-events-none z-0 mix-blend-screen dark:opacity-100 opacity-60"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
        animate={{
          x: -250,
          y: -250,
          opacity: isVisible ? (isMoving ? 0.8 : 0.4) : 0,
          scale: isMoving ? 1.1 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 20,
          mass: 0.2,
        }}
      >
        <div className="w-[500px] h-[500px] bg-gradient-radial from-sage-400/30 via-sage-500/15 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Mid Glow - 350px */}
      <motion.div
        className="fixed pointer-events-none z-0 mix-blend-soft-light dark:opacity-80 opacity-40"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
        animate={{
          x: -175,
          y: -175,
          opacity: isVisible ? (isMoving ? 1 : 0.6) : 0,
          scale: isMoving ? 1.05 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 25,
          mass: 0.15,
        }}
      >
        <div className="w-[350px] h-[350px] bg-gradient-radial from-primary/40 via-sage-100/20 to-transparent rounded-full blur-2xl" />
      </motion.div>

      {/* Inner Glow - 200px */}
      <motion.div
        className="fixed pointer-events-none z-0 mix-blend-overlay dark:opacity-60 opacity-30"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
        animate={{
          x: -100,
          y: -100,
          opacity: isVisible ? (isMoving ? 1 : 0.7) : 0,
          scale: isMoving ? 1.2 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 30,
          mass: 0.1,
        }}
      >
        <div className="w-[200px] h-[200px] bg-gradient-radial from-sage-100/60 via-primary/30 to-transparent rounded-full blur-xl" />
      </motion.div>

      {/* Core Highlight - 100px */}
      <motion.div
        className="fixed pointer-events-none z-0 mix-blend-screen dark:opacity-40 opacity-20"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
        animate={{
          x: -50,
          y: -50,
          opacity: isVisible ? (isMoving ? 0.8 : 0.4) : 0,
          scale: isMoving ? 1.3 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 35,
          mass: 0.05,
        }}
      >
        <div className="w-[100px] h-[100px] bg-gradient-radial from-white/40 via-sage-50/20 to-transparent rounded-full blur-lg" />
      </motion.div>
    </>
  )
}

export { CursorGlow }