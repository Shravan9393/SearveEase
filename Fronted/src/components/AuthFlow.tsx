import React, { useState, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { motion, AnimatePresence } from "motion/react"
import { X, Mail, Lock, Eye, EyeOff, User, Phone, Sparkles, ArrowLeft, Briefcase, ShoppingBag, Star, MapPin, Camera, Upload } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Checkbox } from "./ui/checkbox"

interface AuthFlowProps {
  isOpen: boolean
  onClose: () => void
  onAuthComplete: (userData: any) => void
}

type AuthStep = 'welcome' | 'userType' | 'credentials' | 'profileSetup' | 'providerDetails'
type UserType = 'customer' | 'provider'
type AuthMode = 'signin' | 'signup'
type LoginMethod = 'email' | 'phone'

const AuthFlow: React.FC<AuthFlowProps> = ({ isOpen, onClose, onAuthComplete }) => {
  const { login, registerCustomer, registerProvider, googleLogin, completeProviderProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState<AuthStep>('welcome')
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [userType, setUserType] = useState<UserType>('customer')
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isCompletingGoogleProviderProfile, setIsCompletingGoogleProviderProfile] = useState(false)

  // User credentials form data
  const [credentialsData, setCredentialsData] = useState({
    email: '',
    phone: '',
    password: '',
    name: '',
    confirmPassword: ''
  })

  // Customer profile setup data
  const [customerProfileData, setCustomerProfileData] = useState({
    profileImage: null as File | null,
    location: '',
    preferredServices: [] as string[]
  })

  // Provider details form data
  const [providerData, setProviderData] = useState({
    businessName: '',
    serviceCategory: '',
    experience: '',
    location: '',
    serviceArea: '',
    description: '',
    pricing: '',
    availability: '',
    certifications: '',
    profileImage: null as File | null,
    portfolioImages: [] as File[],
    acceptTerms: false
  })

  const serviceCategories = [
    'Cleaning & Housekeeping',
    'AC Repair & Maintenance',
    'Electrical Services',
    'Plumbing Services',
    'Carpentry & Furniture',
    'Painting & Wall Care',
    'Appliance Installation',
    'Computer & Electronics Repair',
    'Auto Services',
    'Beauty & Personal Care',
    'Pest Control',
    'Moving & Packing',
    'Gardening & Landscaping',
    'CCTV & Security',
    'Water Purifier & RO',
    'Sofa & Carpet Cleaning',
    'Other Services'
  ]

  const popularServices = [
    'House Cleaning', 'AC Repair', 'Plumbing', 'Electrical Work', 
    'Appliance Repair', 'Painting', 'Carpentry', 'Pest Control'
  ]

  const handleCredentialsChange = useCallback((field: string, value: string) => {
    setCredentialsData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleCustomerProfileChange = useCallback((field: string, value: string | File | string[]) => {
    setCustomerProfileData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleProviderDataChange = useCallback((field: string, value: string | boolean | File | File[]) => {
    setProviderData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'portfolio', userType: 'customer' | 'provider') => {
    const files = e.target.files
    if (!files) return

    if (type === 'profile') {
      if (userType === 'customer') {
        setCustomerProfileData(prev => ({ ...prev, profileImage: files[0] }))
      } else {
        setProviderData(prev => ({ ...prev, profileImage: files[0] }))
      }
    } else {
      setProviderData(prev => ({ ...prev, portfolioImages: [...prev.portfolioImages, ...Array.from(files)] }))
    }
  }, [])

  const handleServiceToggle = useCallback((service: string) => {
    setCustomerProfileData(prev => ({
      ...prev,
      preferredServices: prev.preferredServices.includes(service)
        ? prev.preferredServices.filter(s => s !== service)
        : [...prev.preferredServices, service]
    }))
  }, [])

  const isCredentialsValid = useCallback(() => {
    const baseValidation = loginMethod === 'email' 
      ? credentialsData.email && credentialsData.password
      : credentialsData.phone && credentialsData.password

    if (authMode === 'signin') {
      return baseValidation
    } else {
      return credentialsData.name && baseValidation && 
             credentialsData.confirmPassword &&
             credentialsData.password === credentialsData.confirmPassword
    }
  }, [authMode, loginMethod, credentialsData])

  const isCustomerProfileValid = useCallback(() => {
    return customerProfileData.location
  }, [customerProfileData])

  const isProviderDetailsValid = useCallback(() => {
    return providerData.businessName && providerData.serviceCategory && 
           providerData.experience && providerData.location && 
           providerData.description && providerData.acceptTerms
  }, [providerData])

  const handleNext = useCallback(() => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('userType')
        break
      case 'userType':
        setCurrentStep('credentials')
        break
      case 'credentials':
        if (authMode === 'signup') {
          if (userType === 'customer') {
            setCurrentStep('profileSetup')
          } else {
            setCurrentStep('providerDetails')
          }
        } else {
          console.log('[AuthFlow] Submitting signin from credentials step', {
            loginMethod,
            email: credentialsData.email,
            phone: credentialsData.phone,
            passwordLength: credentialsData.password.length,
          })
          handleSubmit()
        }
        break
      case 'profileSetup':
        console.log('[AuthFlow] Submitting customer profile setup', {
          location: customerProfileData.location,
          preferredServicesCount: customerProfileData.preferredServices.length,
        })
        handleSubmit()
        break
      case 'providerDetails':
        console.log('[AuthFlow] Submitting provider details', {
          businessName: providerData.businessName,
          serviceCategory: providerData.serviceCategory,
        })
        handleSubmit()
        break
    }
  }, [currentStep, userType, authMode, loginMethod, credentialsData, customerProfileData, providerData, handleSubmit])

  const handleBack = useCallback(() => {
    switch (currentStep) {
      case 'userType':
        setCurrentStep('welcome')
        break
      case 'credentials':
        setCurrentStep('userType')
        break
      case 'profileSetup':
        setCurrentStep('credentials')
        break
      case 'providerDetails':
        setCurrentStep('credentials')
        break
    }
  }, [currentStep])

  const handleSubmit = useCallback(async () => {
    setIsLoading(true)
    try {
      if (isCompletingGoogleProviderProfile) {
        await completeProviderProfile({
          displayName: credentialsData.name || providerData.businessName,
          phone: credentialsData.phone || '9999999999',
          businessName: providerData.businessName,
          description: providerData.description || 'Service provider',
        })
      } else if (authMode === 'signin') {
        const identifier = (loginMethod === 'email' ? credentialsData.email : credentialsData.phone).trim()
        console.log('[AuthFlow] handleSubmit signin payload', {
          loginMethod,
          identifier,
          passwordLength: credentialsData.password.length,
        })
        await login(identifier, credentialsData.password, userType)
      } else if (userType === 'customer') {
        await registerCustomer({
          userName: credentialsData.email.split('@')[0] || credentialsData.name.replace(/\s+/g, '').toLowerCase(),
          email: credentialsData.email,
          password: credentialsData.password,
          fullName: credentialsData.name,
          phone: credentialsData.phone || '9999999999',
        })
      } else {
        await registerProvider({
          userName: credentialsData.email.split('@')[0] || credentialsData.name.replace(/\s+/g, '').toLowerCase(),
          email: credentialsData.email,
          password: credentialsData.password,
          fullName: credentialsData.name,
          phone: credentialsData.phone || '9999999999',
          displayName: credentialsData.name,
          businessName: providerData.businessName,
          description: providerData.description || 'Service provider',
        })
      }

      onAuthComplete({
        name: credentialsData.name || credentialsData.email,
        isProvider: userType === 'provider' || isCompletingGoogleProviderProfile,
        serviceCategory: providerData.serviceCategory,
      })
      onClose()
    } catch (error) {
      alert('Authentication failed. Please check your details.')
    } finally {
      setIsLoading(false)
    }
  }, [isCompletingGoogleProviderProfile, authMode, credentialsData, userType, providerData, completeProviderProfile, login, registerCustomer, registerProvider, onAuthComplete, onClose])

  const handleSocialLogin = useCallback(async (provider: 'google') => {
    if (provider !== 'google') return

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      alert('Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID in frontend env.')
      return
    }

    const launchGoogle = () => {
      const googleObj = (window as any).google
      if (!googleObj?.accounts?.id) {
        alert('Google SDK failed to initialize.')
        return
      }

      googleObj.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) return
          try {
            const googleResult = await googleLogin(response.credential, userType)
            if (userType === 'provider' && googleResult.requiresProviderProfileCompletion) {
              setIsCompletingGoogleProviderProfile(true)
              setAuthMode('signup')
              setCurrentStep('providerDetails')
              return
            }
            onAuthComplete({
              name: 'Google User',
              isProvider: userType === 'provider',
            })
            onClose()
          } catch (error) {
            alert('Google Sign-In failed. Please try again.')
          }
        },
      })

      googleObj.accounts.id.prompt()
    }

    if (!(window as any).google?.accounts?.id) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = launchGoogle
      script.onerror = () => alert('Failed to load Google Sign-In SDK.')
      document.body.appendChild(script)
      return
    }

    launchGoogle()
  }, [googleLogin, onAuthComplete, onClose, userType])

  const renderWelcomeStep = () => (
    <div className="text-center space-y-8">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-sage-700 rounded-3xl flex items-center justify-center">
          <Sparkles size={32} className="text-primary-foreground" />
        </div>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">
          Welcome to ServeEase
        </h2>
        <p className="text-muted-foreground text-lg">
          Your trusted local services marketplace
        </p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={() => {
            setAuthMode('signin')
            handleNext()
          }}
          className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary shadow-lg"
        >
          Sign In to Your Account
        </Button>
        
        <Button
          onClick={() => {
            setAuthMode('signup')
            handleNext()
          }}
          variant="outline"
          className="w-full h-14 text-lg font-semibold rounded-2xl modal-internal-glass border-white/20 dark:border-white/15 hover:bg-white/10 dark:hover:bg-white/15"
        >
          Create New Account
        </Button>
      </div>
    </div>
  )

  const renderUserTypeStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {authMode === 'signin' ? 'Sign in as' : 'Join as'}
        </h2>
        <p className="text-muted-foreground">
          {authMode === 'signin' ? 'Select your account type' : 'Choose how you want to use ServeEase'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setUserType('customer')}
          className={`p-6 rounded-3xl border-2 transition-all duration-200 ${
            userType === 'customer'
              ? 'border-primary bg-gradient-to-r from-primary/10 to-sage-100/10 dark:from-primary/5 dark:to-sage-100/5'
              : 'border-white/20 dark:border-white/15 modal-internal-glass hover:border-primary/50'
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              userType === 'customer' ? 'bg-gradient-to-r from-primary to-sage-700' : 'bg-muted'
            }`}>
              <ShoppingBag size={24} className={userType === 'customer' ? 'text-primary-foreground' : 'text-muted-foreground'} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">I'm a Customer</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Looking for services for my home or business
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setUserType('provider')}
          className={`p-6 rounded-3xl border-2 transition-all duration-200 ${
            userType === 'provider'
              ? 'border-primary bg-gradient-to-r from-primary/10 to-sage-100/10 dark:from-primary/5 dark:to-sage-100/5'
              : 'border-white/20 dark:border-white/15 modal-internal-glass hover:border-primary/50'
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              userType === 'provider' ? 'bg-gradient-to-r from-primary to-sage-700' : 'bg-muted'
            }`}>
              <Briefcase size={24} className={userType === 'provider' ? 'text-primary-foreground' : 'text-muted-foreground'} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">I'm a Service Provider</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ready to offer my services to customers
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )

  const renderCredentialsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {authMode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="text-muted-foreground">
          {authMode === 'signin' 
            ? `Welcome back! Sign in to your ${userType} account`
            : `Create your ${userType} account to get started`
          }
        </p>
      </div>

      {/* Social Login */}
      <div className="space-y-3">
        <Button
          onClick={() => handleSocialLogin('google')}
          variant="outline"
          className="w-full h-12 modal-internal-glass border-white/20 dark:border-white/15 hover:bg-white/10 dark:hover:bg-white/15 rounded-xl"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10 dark:border-white/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-modal-glass-background text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Login Method Selection */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-muted/20 rounded-xl">
        <Button
          type="button"
          variant={loginMethod === 'email' ? 'default' : 'ghost'}
          onClick={() => setLoginMethod('email')}
          className={`rounded-xl ${loginMethod === 'email' ? 'bg-primary text-primary-foreground' : ''}`}
        >
          <Mail size={16} className="mr-2" />
          Email
        </Button>
        <Button
          type="button"
          variant={loginMethod === 'phone' ? 'default' : 'ghost'}
          onClick={() => setLoginMethod('phone')}
          className={`rounded-xl ${loginMethod === 'phone' ? 'bg-primary text-primary-foreground' : ''}`}
        >
          <Phone size={16} className="mr-2" />
          Phone
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
        {authMode === 'signup' && (
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="relative mt-1">
              <User size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                value={credentialsData.name}
                onChange={(e) => handleCredentialsChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="h-12 pl-12 rounded-xl modal-internal-glass"
                required
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor={loginMethod}>{loginMethod === 'email' ? 'Email Address' : 'Phone Number'}</Label>
          <div className="relative mt-1">
            {loginMethod === 'email' ? (
              <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            ) : (
              <Phone size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            )}
            <Input
              id={loginMethod}
              type={loginMethod === 'email' ? 'email' : 'tel'}
              value={loginMethod === 'email' ? credentialsData.email : credentialsData.phone}
              onChange={(e) => handleCredentialsChange(loginMethod, e.target.value)}
              placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
              className="h-12 pl-12 rounded-xl modal-internal-glass"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={credentialsData.password}
              onChange={(e) => handleCredentialsChange('password', e.target.value)}
              placeholder="Enter your password"
              className="h-12 pl-12 pr-12 rounded-xl modal-internal-glass"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-white/10 rounded-xl w-8 h-8"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
        </div>

        {authMode === 'signup' && (
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative mt-1">
              <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                value={credentialsData.confirmPassword}
                onChange={(e) => handleCredentialsChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                className="h-12 pl-12 rounded-xl modal-internal-glass"
                required
              />
            </div>
            {credentialsData.confirmPassword && credentialsData.password !== credentialsData.confirmPassword && (
              <p className="text-destructive text-sm mt-2">Passwords don't match</p>
            )}
          </div>
        )}
      </form>
    </div>
  )

  const renderCustomerProfileSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
        <p className="text-muted-foreground">
          Let's personalize your experience on ServeEase
        </p>
      </div>

      {/* Profile Image Upload */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-r from-primary to-sage-700 flex items-center justify-center mx-auto">
            {customerProfileData.profileImage ? (
              <img
                src={URL.createObjectURL(customerProfileData.profileImage)}
                alt="Profile"
                className="w-full h-full rounded-3xl object-cover"
              />
            ) : (
              <Camera size={32} className="text-primary-foreground" />
            )}
          </div>
          <label htmlFor="customerProfileImage" className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-sage-700 transition-colors">
            <Upload size={16} className="text-primary-foreground" />
          </label>
          <input
            id="customerProfileImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'profile', 'customer')}
            className="hidden"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">Upload your profile picture</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
        <div>
          <Label htmlFor="location">Your Location *</Label>
          <div className="relative mt-1">
            <MapPin size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              id="location"
              value={customerProfileData.location}
              onChange={(e) => handleCustomerProfileChange('location', e.target.value)}
              placeholder="City, State"
              className="h-12 pl-12 rounded-xl modal-internal-glass"
              required
            />
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">
            Services You're Interested In (Optional)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {popularServices.map((service) => (
              <Button
                key={service}
                type="button"
                variant={customerProfileData.preferredServices.includes(service) ? 'default' : 'outline'}
                onClick={() => handleServiceToggle(service)}
                className={`h-12 rounded-xl transition-all duration-200 ${
                  customerProfileData.preferredServices.includes(service)
                    ? 'bg-gradient-to-r from-primary to-sage-700 text-primary-foreground'
                    : 'modal-internal-glass hover:bg-white/10 dark:hover:bg-white/15'
                }`}
              >
                {service}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            We'll show you relevant services and offers
          </p>
        </div>
      </form>
    </div>
  )

  const renderProviderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Service Provider Details</h2>
        <p className="text-muted-foreground">
          Tell us about your business and services
        </p>
      </div>

      {/* Profile Image Upload */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-r from-primary to-sage-700 flex items-center justify-center mx-auto">
            {providerData.profileImage ? (
              <img
                src={URL.createObjectURL(providerData.profileImage)}
                alt="Profile"
                className="w-full h-full rounded-3xl object-cover"
              />
            ) : (
              <Camera size={32} className="text-primary-foreground" />
            )}
          </div>
          <label htmlFor="providerProfileImage" className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-sage-700 transition-colors">
            <Upload size={16} className="text-primary-foreground" />
          </label>
          <input
            id="providerProfileImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'profile', 'provider')}
            className="hidden"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">Upload your profile picture</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={providerData.businessName}
              onChange={(e) => handleProviderDataChange('businessName', e.target.value)}
              placeholder="Your business name"
              className="h-12 rounded-xl modal-internal-glass mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="serviceCategory">Service Category *</Label>
            <Select value={providerData.serviceCategory} onValueChange={(value) => handleProviderDataChange('serviceCategory', value)}>
              <SelectTrigger className="h-12 rounded-xl modal-internal-glass mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="experience">Years of Experience *</Label>
            <Input
              id="experience"
              value={providerData.experience}
              onChange={(e) => handleProviderDataChange('experience', e.target.value)}
              placeholder="e.g., 5 years"
              className="h-12 rounded-xl modal-internal-glass mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={providerData.location}
              onChange={(e) => handleProviderDataChange('location', e.target.value)}
              placeholder="Your city"
              className="h-12 rounded-xl modal-internal-glass mt-1"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="serviceArea">Service Area</Label>
          <Input
            id="serviceArea"
            value={providerData.serviceArea}
            onChange={(e) => handleProviderDataChange('serviceArea', e.target.value)}
            placeholder="Areas you serve (e.g., 10km radius)"
            className="h-12 rounded-xl modal-internal-glass mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Service Description *</Label>
          <Textarea
            id="description"
            value={providerData.description}
            onChange={(e) => handleProviderDataChange('description', e.target.value)}
            placeholder="Describe your services, specialties, and what makes you unique..."
            className="min-h-[100px] rounded-xl modal-internal-glass mt-1 resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pricing">Starting Price Range</Label>
            <Input
              id="pricing"
              value={providerData.pricing}
              onChange={(e) => handleProviderDataChange('pricing', e.target.value)}
              placeholder="e.g., ₹500-2000"
              className="h-12 rounded-xl modal-internal-glass mt-1"
            />
          </div>

          <div>
            <Label htmlFor="availability">Availability</Label>
            <Input
              id="availability"
              value={providerData.availability}
              onChange={(e) => handleProviderDataChange('availability', e.target.value)}
              placeholder="e.g., Mon-Fri 9AM-6PM"
              className="h-12 rounded-xl modal-internal-glass mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="certifications">Certifications & Licenses</Label>
          <Input
            id="certifications"
            value={providerData.certifications}
            onChange={(e) => handleProviderDataChange('certifications', e.target.value)}
            placeholder="List any relevant certifications or licenses"
            className="h-12 rounded-xl modal-internal-glass mt-1"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptTerms"
            checked={providerData.acceptTerms}
            onCheckedChange={(checked) => handleProviderDataChange('acceptTerms', !!checked)}
          />
          <Label htmlFor="acceptTerms" className="text-sm">
            I agree to the Terms of Service and Privacy Policy
          </Label>
        </div>
      </form>
    </div>
  )

  const canProceed = () => {
    switch (currentStep) {
      case 'welcome':
        return true
      case 'userType':
        return true
      case 'credentials':
        return isCredentialsValid()
      case 'profileSetup':
        return isCustomerProfileValid()
      case 'providerDetails':
        return isProviderDetailsValid()
      default:
        return false
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 modal-backdrop"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="modal-glass rounded-3xl p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  {currentStep !== 'welcome' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBack}
                      className="rounded-2xl hover:bg-muted/20 dark:hover:bg-white/15 w-10 h-10"
                    >
                      <ArrowLeft size={20} />
                    </Button>
                  )}
                  
                  {/* Progress indicator */}
                  <div className="flex space-x-2">
                    {['welcome', 'userType', 'credentials', ...(authMode === 'signup' ? (userType === 'customer' ? ['profileSetup'] : ['providerDetails']) : [])].map((step, index) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          ['welcome', 'userType', 'credentials', 'profileSetup', 'providerDetails'].indexOf(currentStep) >= index
                            ? 'bg-primary'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-2xl hover:bg-muted/20 dark:hover:bg-white/15 w-10 h-10"
                >
                  <X size={20} />
                </Button>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentStep === 'welcome' && renderWelcomeStep()}
                  {currentStep === 'userType' && renderUserTypeStep()}
                  {currentStep === 'credentials' && renderCredentialsStep()}
                  {currentStep === 'profileSetup' && renderCustomerProfileSetup()}
                  {currentStep === 'providerDetails' && renderProviderDetailsStep()}
                </motion.div>
              </AnimatePresence>

              {/* Footer Actions */}
              {currentStep !== 'welcome' && (
                <div className="mt-8 pt-6 border-t border-white/10 dark:border-white/20">
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed() || isLoading}
                    className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary shadow-lg disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        <span>
                          {(currentStep === 'profileSetup' || currentStep === 'providerDetails' || (currentStep === 'credentials' && authMode === 'signin'))
                            ? authMode === 'signin' ? 'Signing In...' : 'Creating Account...'
                            : 'Processing...'
                          }
                        </span>
                      </div>
                    ) : (
                      <span>
                        {(currentStep === 'profileSetup' || currentStep === 'providerDetails' || (currentStep === 'credentials' && authMode === 'signin'))
                          ? authMode === 'signin' ? 'Sign In' : 'Create Account'
                          : 'Continue'
                        }
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export { AuthFlow }
