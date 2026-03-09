import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Mail, Lock, Eye, EyeOff, User, Phone, Sparkles } from "lucide-react"
import { GlassCard } from "./ui/glass-card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthComplete: (userData: any) => void
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthComplete }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const userData = {
        id: Date.now().toString(),
        name: isLogin ? 'John Doe' : formData.name,
        email: formData.email,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isProvider: false
      }

      onAuthComplete(userData)
      setIsLoading(false)
    }, 2000)
  }

  const isFormValid = () => {
    if (isLogin) {
      return formData.email && formData.password
    } else {
      return formData.name && formData.email && formData.phone && 
             formData.password && formData.confirmPassword &&
             formData.password === formData.confirmPassword
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Enhanced Backdrop - Much darker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 modal-backdrop"
            onClick={onClose}
          />

          {/* Enhanced Auth Modal - Much darker in dark mode */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md"
          >
            <div className="modal-glass rounded-3xl p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-sage-700 rounded-2xl flex items-center justify-center">
                    <Sparkles size={20} className="text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      {isLogin ? 'Welcome Back' : 'Join ServeEase'}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {isLogin ? 'Sign in to your account' : 'Create your account'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-2xl hover:bg-muted/20 dark:hover:bg-white/15 transition-all duration-200 w-10 h-10"
                >
                  <X size={20} />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name field for signup */}
                {!isLogin && (
                  <div>
                    <Label htmlFor="name" className="text-base font-medium mb-2 block">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        className="h-12 pl-12 rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div>
                  <Label htmlFor="email" className="text-base font-medium mb-2 block">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      className="h-12 pl-12 rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Phone field for signup */}
                {!isLogin && (
                  <div>
                    <Label htmlFor="phone" className="text-base font-medium mb-2 block">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                        className="h-12 pl-12 rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Password field */}
                <div>
                  <Label htmlFor="password" className="text-base font-medium mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                      className="h-12 pl-12 pr-12 rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-white/15 dark:hover:bg-white/20 rounded-xl w-8 h-8"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>

                {/* Confirm Password for signup */}
                {!isLogin && (
                  <div>
                    <Label htmlFor="confirmPassword" className="text-base font-medium mb-2 block">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        className="h-12 pl-12 rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                        required={!isLogin}
                      />
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-destructive text-sm mt-2">Passwords don't match</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid() || isLoading}
                  className="w-full bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary h-12 text-base font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                    </div>
                  ) : (
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  )}
                </Button>

                {/* Toggle between login/signup */}
                <div className="text-center pt-4">
                  <p className="text-muted-foreground text-sm">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsLogin(!isLogin)}
                      className="ml-2 p-0 h-auto text-primary hover:text-sage-700 transition-colors duration-200"
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </Button>
                  </p>
                </div>
              </form>

              {/* Social Login Options */}
              <div className="mt-8 pt-6 border-t border-white/10 dark:border-white/20">
                <p className="text-center text-muted-foreground text-sm mb-4">Or continue with</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-12 modal-internal-glass border-white/20 dark:border-white/15 hover:bg-white/15 dark:hover:bg-white/20 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 modal-internal-glass border-white/20 dark:border-white/15 hover:bg-white/15 dark:hover:bg-white/20 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export { AuthModal }