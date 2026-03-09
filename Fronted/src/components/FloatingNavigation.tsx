import React, { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Home, Search, Calendar, MessageCircle, User, Plus, Moon, Sun, LogIn, UserCircle } from "lucide-react"
import { GlassCard } from "./ui/glass-card"
import { Button } from "./ui/button"
import logo from "../assets/Images/logo.png";

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  isActive?: boolean
}

interface FloatingNavigationProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  onAuthClick?: () => void
  isAuthenticated?: boolean
  userAvatar?: string
  isProvider?: boolean
}

const FloatingNavigation: React.FC<FloatingNavigationProps> = ({ 
  activeTab = "home", 
  onTabChange,
  onAuthClick,
  isAuthenticated = false,
  userAvatar,
  isProvider = false
}) => {
  const [isDark, setIsDark] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  const handleBookNow = () => {
    onTabChange?.("services")
  }

  const navItems: NavItem[] = [
    { icon: <Home size={20} />, label: "Home", href: "home" },
    { icon: <Search size={20} />, label: "Services", href: "services" },
    { icon: <Calendar size={20} />, label: "About", href: "about" },
    { icon: <MessageCircle size={20} />, label: "Contact", href: "contact" },
    { icon: <User size={20} />, label: "Profile", href: "profile" },
  ]

  return (
    <motion.div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled ? "bottom-8" : "bottom-6"
      }`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
    >
      <GlassCard className="px-3 py-3 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2 px-4 py-2 mr-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-6.8 h-6.8 bg-primary from-primary rounded flex items-center justify-center shadow-lg">
              <img 
                             src={logo}
                             alt="ServeEase Logo"
                             className="w-9 h-9  object-cover shadow-lg"
                           />
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-sage-700 bg-clip-text text-transparent hidden sm:block">
              ServeEase
            </span>
          </motion.div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.button
                key={item.href}
                onClick={() => onTabChange?.(item.href)}
                className={`
                  relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200
                  ${activeTab === item.href
                    ? "text-primary bg-primary/10 shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                  }
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.6 + index * 0.1 }
                }}
              >
                {item.icon}
                {activeTab === item.href && (
                  <motion.div
                    className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                    layoutId="nav-indicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/20">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl p-3 btn-consistent hover:scale-105 transition-transform"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            
            {/* Enhanced Login/SignUp Button */}
            {isAuthenticated ? (
              <motion.button
                onClick={onAuthClick}
                className="flex items-center space-x-2 px-4 py-3 btn-consistent rounded-2xl shadow-lg hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {userAvatar ? (
                  <img src={userAvatar} alt="User" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <UserCircle size={18} />
                )}
                <span className="text-sm font-medium hidden sm:block">Profile</span>
              </motion.button>
            ) : (
              <motion.button
                onClick={onAuthClick}
                className="flex items-center space-x-2 px-4 py-3 btn-consistent rounded-2xl shadow-lg hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, type: "spring" }}
              >
                <LogIn size={16} />
                <span className="text-sm font-medium">Login</span>
              </motion.button>
            )}
            
            {/* Enhanced Book Now Button - Only show for customers */}
            {!isProvider && (
              <motion.button
                onClick={handleBookNow}
                className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary to-sage-700 text-primary-foreground rounded-2xl shadow-lg hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, type: "spring" }}
              >
                <Plus size={16} className="mr-1" />
                <span className="text-sm font-medium hidden sm:block">Book Now</span>
                <span className="text-sm font-medium sm:hidden">Book</span>
              </motion.button>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export { FloatingNavigation }