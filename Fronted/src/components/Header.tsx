import React, { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Moon, Sun, Menu, X, Bell, Search } from "lucide-react"
import { GlassCard } from "./ui/glass-card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface HeaderProps {
  currentPage?: string
  onPageChange?: (page: string) => void
}

const Header: React.FC<HeaderProps> = ({ currentPage = "home", onPageChange }) => {
  const [isDark, setIsDark] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  const navItems = [
    { label: "Home", href: "home" },
    { label: "Services", href: "services" },
    { label: "About", href: "about" },
    { label: "Contact", href: "contact" }
  ]

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? "backdrop-blur-xl bg-background/80" : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-sage-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-primary to-sage-700 bg-clip-text text-transparent">
                ServiceHub
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  onClick={() => onPageChange?.(item.href)}
                  className={`relative px-4 py-2 rounded-xl transition-all duration-200 ${
                    currentPage === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                  }`}
                >
                  {item.label}
                  {currentPage === item.href && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      layoutId="nav-indicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-xl"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl relative"
              >
                <Bell size={20} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white">3</span>
                </div>
              </Button>

              <div className="hidden md:block">
                <Button className="bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary rounded-xl px-6">
                  Sign In
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden rounded-xl"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          className="fixed inset-0 z-30 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <motion.div
            className="absolute top-20 left-4 right-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard className="p-6">
              <nav className="space-y-4">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    onClick={() => {
                      onPageChange?.(item.href)
                      setIsMenuOpen(false)
                    }}
                    className="w-full justify-start text-left rounded-xl"
                  >
                    {item.label}
                  </Button>
                ))}
                <div className="pt-4 border-t border-white/20">
                  <Button className="w-full bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary rounded-xl">
                    Sign In
                  </Button>
                </div>
              </nav>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export { Header }