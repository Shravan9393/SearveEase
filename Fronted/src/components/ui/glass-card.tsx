import React from "react"
import { motion } from "motion/react"
import { cn } from "./utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
  interactive?: boolean
  variant?: "default" | "elevated" | "subtle"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, hover = false, interactive = false, variant = "default", ...props }, ref) => {
    const variants = {
      default: "glass rounded-3xl",
      elevated: "glass rounded-3xl shadow-2xl",
      subtle: "backdrop-blur-md bg-white/30 dark:bg-white/5 border border-white/20 rounded-3xl"
    }

    const Component = interactive ? motion.div : "div"
    const motionProps = interactive ? {
      whileHover: { 
        y: -6, 
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 30 }
      },
      whileTap: { 
        scale: 0.98,
        transition: { type: "spring", stiffness: 400, damping: 30 }
      },
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, ease: "easeOut" }
    } : {}

    return (
      <Component
        className={cn(
          variants[variant],
          hover && "glass-hover cursor-pointer",
          "relative overflow-hidden",
          className
        )}
        ref={ref}
        {...motionProps}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }