import React, { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence, PanInfo } from "motion/react"
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react"
import { ImageWithFallback } from "./figma/ImageWithFallback"
import { Button } from "./ui/button"

interface CollageImage {
  src: string
  alt: string
  className?: string
  delay?: number
}

interface ImageCollageProps {
  images: CollageImage[]
  variant?: "stack" | "grid" | "organic" | "masonry"
  className?: string
  autoPlay?: boolean
  autoPlayDelay?: number
}

const ImageCollage: React.FC<ImageCollageProps> = ({ 
  images, 
  variant = "masonry", 
  className = "",
  autoPlay = false,
  autoPlayDelay = 4000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null)
  const [shuffledImages, setShuffledImages] = useState(images)
  const [isAnimating, setIsAnimating] = useState(false)
  const constraintsRef = useRef(null)

  // Shuffle images for masonry layout
  useEffect(() => {
    setShuffledImages([...images])
  }, [images])

  // Memoize the shuffle function to prevent infinite loops
  const handleShuffle = useCallback(() => {
    if (isAnimating) return
    
    setIsAnimating(true)
    const shuffled = [...images].sort(() => Math.random() - 0.5)
    setShuffledImages(shuffled)
    
    setTimeout(() => setIsAnimating(false), 800)
  }, [images, isAnimating])

  // Memoize navigation functions
  const goToNext = useCallback(() => {
    setDragDirection('left')
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setTimeout(() => setDragDirection(null), 300)
  }, [images.length])

  const goToPrevious = useCallback(() => {
    setDragDirection('right')
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setTimeout(() => setDragDirection(null), 300)
  }, [images.length])

  const resetToFirst = useCallback(() => {
    setCurrentIndex(0)
  }, [])

  // Auto-play functionality for stack variant
  useEffect(() => {
    if (!autoPlay || images.length <= 1 || variant !== 'stack') return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, autoPlayDelay)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayDelay, images.length, variant])

  // Auto-shuffle for masonry layout with stable dependencies
  useEffect(() => {
    if (variant !== 'masonry' || !autoPlay) return

    const interval = setInterval(handleShuffle, autoPlayDelay)
    return () => clearInterval(interval)
  }, [variant, autoPlay, autoPlayDelay, handleShuffle])

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const swipeThreshold = 100
    const swipeVelocityThreshold = 500

    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold) {
      if (info.offset.x > 0) {
        goToPrevious()
      } else {
        goToNext()
      }
    }
  }, [goToNext, goToPrevious])

  const renderMasonry = useCallback(() => (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-muted-foreground">Our Services in Action</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShuffle}
          disabled={isAnimating}
          className="glass btn-consistent hover:scale-105 transition-transform"
        >
          <Shuffle size={14} className="mr-2" />
          Shuffle
        </Button>
      </div>
      
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {shuffledImages.map((image, index) => {
          const heights = ['h-48', 'h-56', 'h-64', 'h-40', 'h-52', 'h-60']
          const randomHeight = heights[index % heights.length]
          
          return (
            <motion.div
              key={`${image.src}-${index}`}
              className={`relative break-inside-avoid mb-4 ${randomHeight} group overflow-hidden rounded-2xl`}
              initial={{ 
                opacity: 0, 
                scale: 0.8,
                y: 30
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: 0
              }}
              transition={{ 
                delay: isAnimating ? index * 0.1 : index * 0.05,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              whileHover={{ 
                scale: 1.03,
                zIndex: 10,
                transition: { duration: 0.2 }
              }}
              layout
            >
              <ImageWithFallback
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover rounded-2xl"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-4 text-white"
                initial={{ y: 20, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm font-medium">{image.alt}</p>
              </motion.div>
              
              <div className="absolute inset-0 glass opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl" />
            </motion.div>
          )
        })}
      </div>
      
      {autoPlay && (
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs text-muted-foreground">Auto-shuffling every {autoPlayDelay / 1000}s</p>
        </motion.div>
      )}
    </div>
  ), [className, shuffledImages, isAnimating, autoPlay, autoPlayDelay, handleShuffle])

  const renderStack = useCallback(() => (
    <div className={`relative h-96 w-full max-w-md mx-auto ${className}`} ref={constraintsRef}>
      <div className="absolute inset-0">
        {images.map((_, index) => {
          const offset = Math.min(index, 3) * 4
          const scale = 1 - Math.min(index, 3) * 0.05
          const isVisible = index <= currentIndex + 2

          return (
            <motion.div
              key={`bg-${index}`}
              className="absolute inset-0 rounded-3xl glass border border-white/20"
              style={{
                zIndex: images.length - index,
                display: isVisible ? 'block' : 'none'
              }}
              animate={{
                x: offset,
                y: offset,
                scale: scale,
                opacity: isVisible ? 0.7 - (index * 0.2) : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          initial={{ 
            x: dragDirection === 'left' ? 300 : dragDirection === 'right' ? -300 : 0,
            opacity: 0,
            scale: 0.8
          }}
          animate={{ 
            x: 0, 
            opacity: 1,
            scale: 1
          }}
          exit={{ 
            x: dragDirection === 'left' ? -300 : 300,
            opacity: 0,
            scale: 0.8
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          whileHover={{ scale: 1.02 }}
          whileDrag={{ scale: 0.95, rotate: 0 }}
          style={{ zIndex: 1000 }}
        >
          <div className="relative h-full w-full rounded-3xl overflow-hidden glass border border-white/30 shadow-2xl">
            <ImageWithFallback
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">{images[currentIndex].alt}</p>
                  <p className="text-xs opacity-70">{currentIndex + 1} of {images.length}</p>
                </div>
                <div className="flex space-x-1">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          className="rounded-full glass btn-consistent shadow-lg hover:scale-110 transition-transform"
          disabled={images.length <= 1}
        >
          <ChevronLeft size={18} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={resetToFirst}
          className="rounded-full glass btn-consistent shadow-lg hover:scale-110 transition-transform"
          disabled={currentIndex === 0}
        >
          <RotateCcw size={16} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="rounded-full glass btn-consistent shadow-lg hover:scale-110 transition-transform"
          disabled={images.length <= 1}
        >
          <ChevronRight size={18} />
        </Button>
      </div>

      <motion.div
        className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full text-white text-xs"
        initial={{ opacity: 1 }}
        animate={{ opacity: currentIndex === 0 ? 1 : 0 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        Drag to explore
      </motion.div>
    </div>
  ), [className, images, currentIndex, dragDirection, handleDragEnd, goToPrevious, goToNext, resetToFirst])

  const renderOrganic = useCallback(() => (
    <div className={`relative grid grid-cols-12 gap-4 h-80 ${className}`}>
      {images.map((image, index) => {
        const positions = [
          "col-span-3 row-span-2",
          "col-span-4 row-span-1", 
          "col-span-2 row-span-3",
          "col-span-3 row-span-1",
          "col-span-2 row-span-2",
          "col-span-2 row-span-1"
        ]
        
        return (
          <motion.div
            key={index}
            className={`${positions[index % positions.length]} rounded-2xl overflow-hidden`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <ImageWithFallback
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )
      })}
    </div>
  ), [className, images])

  const renderGrid = useCallback(() => (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {images.map((image, index) => (
        <motion.div
          key={index}
          className="rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <ImageWithFallback
            src={image.src}
            alt={image.alt}
            className="w-full h-32 md:h-40 object-cover"
          />
        </motion.div>
      ))}
    </div>
  ), [className, images])

  switch (variant) {
    case "masonry":
      return renderMasonry()
    case "stack":
      return renderStack()
    case "organic":
      return renderOrganic()
    case "grid":
    default:
      return renderGrid()
  }
}

export { ImageCollage, type CollageImage }