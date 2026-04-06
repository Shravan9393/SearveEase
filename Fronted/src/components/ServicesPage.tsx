import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Star, 
  MapPin, 
  Clock, 
  Plus, 
  Minus,
  X,
  SlidersHorizontal,
  TrendingUp,
  DollarSign,
  Target,
  Award,
  ArrowRight,
  MessageCircle
} from "lucide-react"
import { GlassCard } from "./ui/glass-card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { ImageWithFallback } from "./figma/ImageWithFallback"
import { ChatModal, ServiceProvider } from "./ChatModal"
import { ServiceDetailsModal } from "./ServiceDetailsModal"
import { CartItem } from "../App"
import { servicesAPI, categoriesAPI, Service as BackendService } from "../services"
import { useAuth } from "../context/AuthContext"

const getProviderProfileId = (provider: BackendService["providerId"]) =>
  typeof provider === "string" ? provider : provider?._id || ""

interface Service {
  id: string
  providerProfileId: string
  name: string
  provider: string
  image: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  duration: string
  category: string
  description: string
  features: string[]
  distance: string
  availability: 'available' | 'busy' | 'unavailable'
  responseTime: string
  isOnline: boolean
}

interface ServicesPageProps {
  cartItems: CartItem[]
  onAddToCart: (service: Omit<CartItem, 'quantity'>) => void
  onRemoveFromCart: (serviceId: string) => void
  onUpdateQuantity: (serviceId: string, change: number) => void
  onClearCart: () => void
  onProceedToAddress: () => void
}

const ServicesPage: React.FC<ServicesPageProps> = ({
  cartItems,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity,
  onClearCart,
  onProceedToAddress
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortBy, setSortBy] = useState("relevance")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isServiceDetailsOpen, setIsServiceDetailsOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  const [showCart, setShowCart] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<string[]>(["All Services"])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()


  const sortOptions = [
    {
      value: "relevance",
      label: "Relevance",
      icon: <Target size={14} />,
    },
    {
      value: "popularity",
      label: "Popularity",
      icon: <TrendingUp size={14} />,
    },
    {
      value: "rating",
      label: "Top Rated",
      icon: <Award size={14} />,
    },
    {
      value: "price-low",
      label: "Price: Low to High",
      icon: <DollarSign size={14} />,
    },
    {
      value: "price-high",
      label: "Price: High to Low",
      icon: <ArrowRight size={14} />,
    },
  ]

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const [servicesResponse, categoriesResponse] = await Promise.all([
          servicesAPI.getServices({ limit: 100 }),
          categoriesAPI.getCategories(),
        ])

        const mappedServices: Service[] = (servicesResponse.services || []).map((service: BackendService) => ({
          id: service._id,

          providerProfileId: getProviderProfileId(service.providerId),

          name: service.title,
          provider: service.providerName,
          image: service.images,
          price: service.pricing,
          originalPrice: service.originalPrice,
          rating: service.rating,
          reviews: service.reviews,
          duration: service.duration,
          category: service.categoryName,
          description: service.description,
          features: service.features || [],
          distance: service.distance,
          availability: service.availability,
          responseTime: service.responseTime,
          isOnline: service.isOnline,
        }))

        setServices(mappedServices)
        setCategories([
          "All Services",
          ...(categoriesResponse || []).map((category: { name: string }) => category.name),
        ])
      } catch (error) {
        console.error("Failed to fetch services page data", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServicesData()
  }, [])

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.includes("All Services") ||
                           selectedCategories.includes(service.category)
    const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1]
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case "popularity":
        return b.reviews - a.reviews
      case "rating":
        return b.rating - a.rating
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      default:
        return 0
    }
  })

  const addToCart = (service: Service) => {
    const cartItem: Omit<CartItem, 'quantity'> = {
      id: service.id,
      providerProfileId: service.providerProfileId,
      name: service.name,
      provider: service.provider,
      image: service.image,
      price: service.price,
      originalPrice: service.originalPrice,
      category: service.category,
      duration: service.duration,
      features: service.features
    }
    onAddToCart(cartItem)
  }

  const openChat = (service: Service) => {
    const provider: ServiceProvider = {
      id: service.id,
      profileId: service.providerProfileId,
      name: service.provider,
      image: service.image,
      rating: service.rating,
      reviewCount: service.reviews,
      responseTime: service.responseTime,
      isOnline: service.isOnline,
      serviceName: service.name,
      basePrice: service.price
    }
    setSelectedProvider(provider)
    setIsChatOpen(true)
  }

  const openServiceDetails = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    setIsServiceDetailsOpen(true)
  }

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategories(prev => {
      if (category === "All Services") {
        return ["All Services"]
      }
      const filtered = prev.filter(c => c !== "All Services")
      if (filtered.includes(category)) {
        return filtered.filter(c => c !== category)
      } else {
        return [...filtered, category]
      }
    })
  }

  if (isLoading) {
    return <div className="pt-20 text-center text-muted-foreground">Loading services...</div>
  }

  return (
    <div className="pt-12 pb-32 px-4 w-full">
      <div className="flex flex-col lg:flex-row gap-6 h-full max-w-[2000px] mx-auto">
        {/* Left Sidebar - Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`${showCart ? 'lg:w-1/5' : 'lg:w-1/4'} space-y-6`}
          >
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Filter size={18} className="mr-2" />
                Filters
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Service Categories</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map(category => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategorySelect(category)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={3000}
                  min={0}
                  step={100}
                  className="w-full"
                />
              </div>

              {/* Sort Options */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Sort By</Label>
                <div className="space-y-2">
                  {sortOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={sortBy === option.value}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border-border"
                      />
                      <span className="flex items-center space-x-2 text-sm">
                        {option.icon}
                        <span>{option.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Main Content - Services */}
        <div className={`flex-1 space-y-6 ${!showFilters && !showCart ? 'lg:w-full' : !showFilters || !showCart ? 'lg:w-3/4' : 'lg:w-1/2'}`}>
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search for services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass bg-transparent border-white/20"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`glass btn-consistent ${showFilters ? 'bg-primary/20' : ''}`}
                >
                  <SlidersHorizontal size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowCart(!showCart)}
                  className="relative glass btn-consistent"
                >
                  <ShoppingCart size={18} />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Services Grid - Dynamic columns based on sidebar visibility */}
          <div className={`grid gap-4 ${
            !showFilters && !showCart 
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
              : !showFilters || !showCart
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3'
          }`}>
            {sortedServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.6 }}
              >
                <GlassCard
                  interactive
                  className="group overflow-hidden h-full cursor-pointer"
                  onClick={() => openServiceDetails(service.id)}
                >
                  <div className="relative">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        service.availability === 'available' 
                          ? 'bg-green-500 text-white'
                          : service.availability === 'busy'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {service.availability === 'available' ? 'Available' : 
                         service.availability === 'busy' ? 'Busy' : 'Unavailable'}
                      </span>
                    </div>
                    {service.originalPrice && (
                      <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Save ₹{service.originalPrice - service.price}
                      </div>
                    )}
                    {service.isOnline && (
                      <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span>Online</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{service.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{service.provider}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        <Star size={12} className="text-yellow-500 fill-current" />
                        <span className="text-xs">{service.rating}</span>
                        <span className="text-xs text-muted-foreground">({service.reviews})</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        <span>{service.distance}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{service.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock size={12} />
                        <span>{service.duration}</span>
                      </div>
                      <div className="text-right">
                        {service.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through mr-1">
                            ₹{service.originalPrice}
                          </span>
                        )}
                        <span className="font-bold text-primary">₹{service.price}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={(event) => {
                          event.stopPropagation()
                          addToCart(service)
                        }}
                        disabled={service.availability === 'unavailable'}
                        className="flex-1 bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary text-xs py-2 h-8"
                      >
                        <Plus size={12} className="mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        onClick={(event) => {
                          event.stopPropagation()
                          openChat(service)
                        }}
                        variant="outline"
                        className="h-8 px-3 glass"
                      >
                        <MessageCircle size={12} />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {sortedServices.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <GlassCard className="p-8">
                <p className="text-muted-foreground">No services found matching your criteria.</p>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar - Cart */}
        {showCart && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className={`${showFilters ? 'lg:w-3/10' : 'lg:w-1/4'} space-y-6`}
          >
            <GlassCard className="p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center">
                  <ShoppingCart size={18} className="mr-2" />
                  Your Cart ({cartItems.length})
                </h3>
                {cartItems.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearCart}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground text-sm">Your cart is empty</p>
                  <p className="text-muted-foreground text-xs">Add services to get started</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-muted/20 rounded-xl">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.provider}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold text-xs text-primary">₹{item.price}</span>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="w-6 h-6 p-0"
                            >
                              <Minus size={12} />
                            </Button>
                            <span className="text-xs w-6 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="w-6 h-6 p-0"
                            >
                              <Plus size={12} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveFromCart(item.id)}
                        className="w-6 h-6 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {cartItems.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-bold text-lg text-primary">₹{getTotalAmount()}</span>
                  </div>
                  
                  <Button
                    onClick={onProceedToAddress}
                    className="w-full bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary flex items-center justify-center space-x-2"
                    size="lg"
                  >
                    <span>Proceed</span>
                    <ArrowRight size={18} />
                  </Button>

                  <div className="mt-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      Secure checkout • Money back guarantee
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </div>

      {/* Chat Modal */}
      {selectedProvider && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false)
            setSelectedProvider(null)
          }}
          provider={selectedProvider}
          customerId={isAuthenticated && user?.role === "customer" ? user._id : undefined}
        />
      )}

      <ServiceDetailsModal
        isOpen={isServiceDetailsOpen}
        onClose={() => {
          setIsServiceDetailsOpen(false)
          setSelectedServiceId(null)
        }}
        serviceId={selectedServiceId}
      />
    </div>
  )
}

export { ServicesPage }
