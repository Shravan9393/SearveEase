import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, MapPin, Navigation, Clock, Home, Building2 } from "lucide-react"
import { GlassCard } from "./ui/glass-card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Checkbox } from "./ui/checkbox"

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onProceedToPayment: (address: AddressData) => void
  cartTotal: number
}

interface AddressData {
  type: 'home' | 'work' | 'other'
  name: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
  landmark?: string
  instructions?: string
  useCurrentLocation?: boolean
  cashOnDelivery?: boolean
}

const AddressModal: React.FC<AddressModalProps> = ({ 
  isOpen, 
  onClose, 
  onProceedToPayment,
  cartTotal 
}) => {
  const [formData, setFormData] = useState<AddressData>({
    type: 'home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    instructions: '',
    useCurrentLocation: false,
    cashOnDelivery: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [locationError, setLocationError] = useState('')

  const handleInputChange = (field: keyof AddressData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getCurrentLocation = async () => {
    setIsLoading(true)
    setLocationError('')
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser')
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })

      // Mock reverse geocoding (in real app, you'd use a geocoding service)
      const mockAddress = {
        addressLine1: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
        addressLine2: 'Current Location',
        city: 'Your City',
        state: 'Your State',
        pincode: '123456'
      }

      setFormData(prev => ({
        ...prev,
        ...mockAddress,
        useCurrentLocation: true
      }))
    } catch (error) {
      setLocationError('Unable to get your location. Please enter manually.')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.phone.trim() && 
           formData.addressLine1.trim() && 
           formData.city.trim() && 
           formData.state.trim() && 
           formData.pincode.trim()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid()) {
      onProceedToPayment(formData)
    }
  }

  const addressTypes = [
    { id: 'home', label: 'Home', icon: <Home size={16} /> },
    { id: 'work', label: 'Work', icon: <Building2 size={16} /> },
    { id: 'other', label: 'Other', icon: <MapPin size={16} /> }
  ]

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

          {/* Enhanced Modal - Much darker in dark mode */}
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
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Delivery Address
                  </h2>
                  <p className="text-muted-foreground text-base mt-2">
                    Where should we deliver your service?
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-2xl hover:bg-muted/20 dark:hover:bg-white/15 transition-all duration-200 w-12 h-12"
                >
                  <X size={24} />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Address Type */}
                <div>
                  <Label className="text-base font-semibold mb-4 block">Address Type</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {addressTypes.map((type) => (
                      <Button
                        key={type.id}
                        type="button"
                        variant={formData.type === type.id ? "default" : "outline"}
                        onClick={() => handleInputChange('type', type.id as 'home' | 'work' | 'other')}
                        className={`flex items-center justify-center space-x-2 h-14 rounded-2xl transition-all duration-200 ${
                          formData.type === type.id 
                            ? 'bg-gradient-to-r from-primary to-sage-700 text-primary-foreground shadow-lg' 
                            : 'modal-internal-glass hover:bg-muted/20 dark:hover:bg-white/20'
                        }`}
                      >
                        {type.icon}
                        <span className="font-medium">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Current Location */}
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-3 h-14 modal-internal-glass border-primary/30 hover:border-primary/50 dark:border-primary/40 dark:hover:border-primary/60 rounded-2xl transition-all duration-200"
                  >
                    <Navigation size={20} className={isLoading ? 'animate-spin' : ''} />
                    <span className="font-medium">
                      {isLoading ? 'Getting location...' : 'Use Current Location'}
                    </span>
                  </Button>
                  {locationError && (
                    <p className="text-destructive text-sm mt-3 px-2">{locationError}</p>
                  )}
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-base font-medium mb-2 block">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="h-12 rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-base font-medium mb-2 block">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="h-12 rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="addressLine1" className="text-base font-medium mb-2 block">
                      Address Line 1 *
                    </Label>
                    <Input
                      id="addressLine1"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      placeholder="House/Flat number, Building name"
                      className="h-12 rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine2" className="text-base font-medium mb-2 block">
                      Address Line 2
                    </Label>
                    <Input
                      id="addressLine2"
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      placeholder="Area, Street, Sector, Village"
                      className="h-12 rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-base font-medium mb-2 block">
                        City *
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                        className="h-12 rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-base font-medium mb-2 block">
                        State *
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="State"
                        className="h-12 rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode" className="text-base font-medium mb-2 block">
                        PIN Code *
                      </Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        placeholder="PIN Code"
                        className="h-12 rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="landmark" className="text-base font-medium mb-2 block">
                      Landmark (Optional)
                    </Label>
                    <Input
                      id="landmark"
                      value={formData.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                      placeholder="Nearby landmark"
                      className="h-12 rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructions" className="text-base font-medium mb-2 block">
                      Delivery Instructions (Optional)
                    </Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      placeholder="Any specific instructions for our service provider"
                      className="min-h-[100px] rounded-xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold block">Payment Type</Label>
                  <div className="flex items-start gap-3 rounded-2xl modal-internal-glass border border-white/20 dark:border-white/15 px-4 py-4">
                    <Checkbox
                      id="cashOnDelivery"
                      checked={formData.cashOnDelivery}
                      onCheckedChange={(checked) => handleInputChange('cashOnDelivery', checked === true)}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="cashOnDelivery" className="text-sm font-medium cursor-pointer">
                        Cash on Delivery
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Optional. Leave unchecked to keep this booking ready for a future online payment flow.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Summary - Enhanced for dark mode */}
                <div className="modal-internal-glass rounded-2xl p-6 bg-gradient-to-r from-primary/10 via-sage-100/10 to-primary/5 dark:from-primary/5 dark:via-sage-100/5 dark:to-primary/3 border border-primary/20 dark:border-primary/15">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-sage-700 rounded-xl flex items-center justify-center">
                        <Clock size={20} className="text-primary-foreground" />
                      </div>
                      <span className="text-lg font-semibold">Order Total</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">₹{cartTotal}</span>
                  </div>
                  <p className="text-muted-foreground mt-3 text-base">
                    Service will be delivered to your selected address
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid()}
                  className="w-full bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary h-14 text-lg font-semibold rounded-2xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                >
                  Confirm Booking - ₹{cartTotal}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export { AddressModal, type AddressData }