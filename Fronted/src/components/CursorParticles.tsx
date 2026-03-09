import React, { useEffect, useCallback } from "react"

const CursorParticles: React.FC = () => {
  // Enhanced createParticle function with reduced frequency for better performance
  const createParticle = useCallback((x: number, y: number) => {
    const particle = document.createElement('div')
    particle.className = 'particle'
    
    // Reduced particle sizes for less visual noise
    const size = Math.random() * 4 + 2 // 2-6px particles (was 4-10px)
    const hue = Math.random() * 60 + 80 // Green-yellow range
    const saturation = Math.random() * 25 + 35 // 35-60% saturation (reduced)
    const lightness = Math.random() * 15 + 65 // 65-80% lightness
    
    particle.style.left = x + 'px'
    particle.style.top = y + 'px'
    particle.style.width = size + 'px'
    particle.style.height = size + 'px'
    particle.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`
    particle.style.boxShadow = `0 0 ${size * 1.5}px hsl(${hue}, ${saturation}%, ${lightness}%)` // Reduced glow
    particle.style.setProperty('--random-x', (Math.random() - 0.5) * 150 + 'px') // Reduced movement
    particle.style.setProperty('--random-y', (Math.random() - 0.5) * 150 + 'px')
    
    document.body.appendChild(particle)
    
    // Remove particle after animation
    setTimeout(() => {
      if (document.body.contains(particle)) {
        document.body.removeChild(particle)
      }
    }, 2500) // Shorter duration
  }, [])

  // Create burst effect on click with fewer particles
  const createBurst = useCallback((x: number, y: number) => {
    // Create fewer particles in a burst (was 8, now 5)
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const offsetX = (Math.random() - 0.5) * 30 // Reduced spread
        const offsetY = (Math.random() - 0.5) * 30
        createParticle(x + offsetX, y + offsetY)
      }, i * 40)
    }
  }, [createParticle])

  // Reduced frequency mousemove handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Only create particles in dark mode with much lower frequency
    if (document.documentElement.classList.contains('dark')) {
      // Much more conservative particle creation (was 0.7, now 0.85)
      if (Math.random() > 0.85) {
        createParticle(e.clientX, e.clientY)
      }
    }
  }, [createParticle])

  // Click handler for burst effect with reduced intensity
  const handleClick = useCallback((e: MouseEvent) => {
    if (document.documentElement.classList.contains('dark')) {
      // Only trigger burst 30% of the time for less visual noise
      if (Math.random() > 0.7) {
        createBurst(e.clientX, e.clientY)
      }
    }
  }, [createBurst])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleClick)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick)
    }
  }, [handleMouseMove, handleClick])

  return null
}

export { CursorParticles }