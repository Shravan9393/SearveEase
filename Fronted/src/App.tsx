import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { FloatingNavigation } from "./components/FloatingNavigation"
import { HomePage } from "./components/HomePage"
import { ProviderHomePage } from "./components/ProviderHomePage"
import { ServicesPage } from "./components/ServicesPage"
import { AuthFlow } from "./components/AuthFlow"
import { AddressModal, AddressData } from "./components/AddressModal"
import { CursorParticles } from "./components/CursorParticles"
import { CursorGlow } from "./components/CursorGlow"
import { LoadingScreen } from "./components/LoadingScreen"
import { AboutPage } from "./components/pages/AboutPage"
import { ContactPage } from "./components/pages/ContactPage"
import { ProfilePage } from "./components/pages/ProfilePage"
import { Footer } from "./components/Footer"
import { useAuth } from "./context/AuthContext"
import { Service } from "./services/services"

// Cart item interface
interface CartItem {
  id: string
  name: string
  provider: string
  image: string
  price: number
  originalPrice?: number
  quantity: number
  category: string
  duration: string
  features: string[]
}

export default function App() {
  const { user, isAuthenticated, login, logout: authLogout, isLoading: authLoading } = useAuth()
  
  const [currentPage, setCurrentPage] = useState("home")
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthFlowOpen, setIsAuthFlowOpen] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    // Simulate app loading
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleAuthClick = useCallback(() => {
    if (isAuthenticated) {
      setCurrentPage("profile")
    } else {
      setIsAuthFlowOpen(true)
    }
  }, [isAuthenticated])

  const handleAuthComplete = useCallback((userData: any) => {
    // The user data is already handled by AuthContext
    console.log("Authentication completed:", userData)
    
    // Show welcome message
    if (userData.isProvider) {
      alert(`Welcome ${userData.name}! Your service provider account has been created. You can now start receiving bookings for ${userData.serviceCategory}.`)
    } else {
      alert(`Welcome ${userData.name}! Your customer account is ready. Start exploring services in your area.`)
    }
  }, [])

  const handleLogout = useCallback(() => {
    authLogout()
    setCurrentPage("home")
  }, [authLogout])

  // Cart management functions with useCallback
  const addToCart = useCallback((service: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === service.id)
      if (existing) {
        return prev.map(item => 
          item.id === service.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, { ...service, quantity: 1 }]
      }
    })
  }, [])

  const removeFromCart = useCallback((serviceId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== serviceId))
  }, [])

  const updateCartQuantity = useCallback((serviceId: string, change: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === serviceId) {
          const newQuantity = Math.max(0, item.quantity + change)
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
        }
        return item
      }).filter(Boolean) as CartItem[]
    })
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }, [cartItems])

  // Handle book now from homepage
  const handleBookNow = useCallback((service: Omit<CartItem, 'quantity'>) => {
    addToCart(service)
    setCurrentPage("services")
  }, [addToCart])

  // Handle proceed to address
  const handleProceedToAddress = useCallback(() => {
    if (!isAuthenticated) {
      setIsAuthFlowOpen(true)
      return
    }
    setIsAddressModalOpen(true)
  }, [isAuthenticated])

  // Handle address completion and payment
  const handleProceedToPayment = useCallback((addressData: AddressData) => {
    setIsAddressModalOpen(false)
    const total = getCartTotal()
    
    // Here you would typically integrate with a payment gateway
    console.log("Proceeding to payment with address:", addressData)
    console.log("Cart items:", cartItems)
    console.log("Total amount:", total)
    
    // For demo purposes, show a success message and clear cart
    alert(`Payment of ₹${total} initiated! Order will be delivered to ${addressData.addressLine1}, ${addressData.city}`)
    clearCart()
  }, [cartItems, getCartTotal, clearCart])

  // Navigation handler
  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page)
  }, [])

  const renderPage = useCallback(() => {
    switch (currentPage) {
      case "home":
        // Show ProviderHomePage if user is logged in as a provider
        if (isAuthenticated && user?.role === "provider") {
          return <ProviderHomePage user={user} />
        }
        // Show customer HomePage for everyone else (not logged in or customer)
        return <HomePage onNavigate={handleNavigate} onBookNow={handleBookNow} />
      case "services":
        return (
          <ServicesPage 
            cartItems={cartItems}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            onUpdateQuantity={updateCartQuantity}
            onClearCart={clearCart}
            onProceedToAddress={handleProceedToAddress}
          />
        )
      case "about":
        return <AboutPage />
      case "contact":
        return <ContactPage />
      case "profile":
        return (
          <ProfilePage 
            user={user} 
            onLogout={handleLogout} 
            isAuthenticated={isAuthenticated}
            onAuthClick={handleAuthClick}
          />
        )
      default:
        // Default to customer homepage
        if (isAuthenticated && user?.role === "provider") {
          return <ProviderHomePage user={user} />
        }
        return <HomePage onNavigate={handleNavigate} onBookNow={handleBookNow} />
    }
  }, [
    currentPage, 
    handleNavigate, 
    handleBookNow, 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    handleProceedToAddress, 
    user, 
    handleLogout, 
    isAuthenticated,
    handleAuthClick
  ])

  if (isLoading || authLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background homepage-gradient">
      {/* Enhanced Cursor Effects */}
      <CursorGlow />
      <CursorParticles />

      <AnimatePresence mode="wait">
        <motion.main
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative"
        >
          {renderPage()}
        </motion.main>
      </AnimatePresence>

      <FloatingNavigation 
        activeTab={currentPage} 
        onTabChange={setCurrentPage}
        onAuthClick={handleAuthClick}
        isAuthenticated={isAuthenticated}
        userAvatar={user?.profileImage}
        isProvider={user?.role === "provider"}
      />

      {/* Enhanced Authentication Flow */}
      <AnimatePresence>
        {isAuthFlowOpen && (
          <AuthFlow
            isOpen={isAuthFlowOpen}
            onClose={() => setIsAuthFlowOpen(false)}
            onAuthComplete={handleAuthComplete}
          />
        )}
      </AnimatePresence>

      {/* Address Selection Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <AddressModal
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            onProceedToPayment={handleProceedToPayment}
            cartTotal={getCartTotal()}
          />
        )}
      </AnimatePresence>
      
      <Footer onNavigate={handleNavigate} />
    </div>
  )
}

export type { CartItem }
