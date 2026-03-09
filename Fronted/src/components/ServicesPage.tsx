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
import { CartItem } from "../App"
import { servicesAPI, categoriesAPI } from "../services"

interface Service {
  id: string
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
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  const [showCart, setShowCart] = useState(true)
  const [servicesData, setServicesData] = useState<Service[]>([])
  const [categoriesData, setCategoriesData] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          servicesAPI.getServices({ limit: 200 }),
          categoriesAPI.getCategories(),
        ])

        const normalizedServices: Service[] = (servicesRes.services || []).map((svc: any) => ({
          id: svc._id,
          name: svc.title,
          provider: svc.providerName || svc.providerId?.displayName || "Provider",
          image: svc.images || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
          price: svc.pricing || 0,
          originalPrice: svc.originalPrice,
          rating: svc.rating || 4.5,
          reviews: svc.reviews || 0,
          duration: svc.duration || "1-2 hours",
          category: svc.categoryName || svc.categoryId?.name || "General",
          description: svc.description || "",
          features: svc.features || [],
          distance: svc.distance || "Nearby",
          availability: svc.availability || "available",
          responseTime: svc.responseTime || "30 mins",
          isOnline: svc.isOnline ?? true,
        }))

        setServicesData(normalizedServices)
        setCategoriesData(["All Services", ...(categoriesRes || []).map((cat: any) => cat.name)])
      } catch (error) {
        console.error("Failed to load services page data", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Fallback static data for development when DB is empty
  const services: Service[] = servicesData.length > 0 ? servicesData : [
    // Cleaning Services
    {
      id: "clean-1",
      name: "Premium Home Deep Cleaning",
      provider: "CleanPro Services",
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2xlYW5pbmd8ZW58MXx8fHwxNzU1OTc5OTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 299,
      originalPrice: 399,
      rating: 4.8,
      reviews: 245,
      duration: "3-4 hours",
      category: "Cleaning",
      description: "Complete home sanitization with eco-friendly products",
      features: ["Deep sanitization", "Eco-friendly", "Same day service"],
      distance: "2.3 km",
      availability: "available",
      responseTime: "15 mins",
      isOnline: true
    },
    {
      id: "clean-2",
      name: "Office Cleaning Service",
      provider: "SparkleClean Co.",
      image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBjbGVhbmluZ3xlbnwxfHx8fDE3NTU5Nzk5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 199,
      originalPrice: 249,
      rating: 4.6,
      reviews: 189,
      duration: "2-3 hours",
      category: "Cleaning",
      description: "Professional office cleaning and sanitization",
      features: ["Disinfection", "Waste disposal", "Floor polishing"],
      distance: "1.8 km",
      availability: "available",
      responseTime: "20 mins",
      isOnline: false
    },

    // AC Repair
    {
      id: "ac-1",
      name: "AC Repair & Maintenance",
      provider: "CoolTech Solutions",
      image: "https://images.unsplash.com/photo-1635281239138-1cf73c97d5aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYyUyMHJlcGFpcnxlbnwxfHx8fDE3NTU5Nzk5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 199,
      originalPrice: 249,
      rating: 4.9,
      reviews: 189,
      duration: "1-2 hours",
      category: "AC Repair",
      description: "Professional AC servicing with warranty coverage",
      features: ["Gas refill", "Filter cleaning", "6 month warranty"],
      distance: "1.8 km",
      availability: "available",
      responseTime: "10 mins",
      isOnline: true
    },
    {
      id: "ac-2",
      name: "Split AC Installation",
      provider: "AirCool Experts",
      image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb9c15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYyUyMGluc3RhbGxhdGlvbnxlbnwxfHx8fDE3NTU5Nzk5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 899,
      rating: 4.7,
      reviews: 156,
      duration: "3-4 hours",
      category: "AC Repair",
      description: "Professional split AC installation with copper piping",
      features: ["Copper piping", "Professional installation", "1 year warranty"],
      distance: "3.1 km",
      availability: "busy",
      responseTime: "30 mins",
      isOnline: false
    },

    // Electrical
    {
      id: "elec-1",
      name: "Complete Electrical Solutions",
      provider: "PowerFix Experts",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwd29ya3xlbnwxfHx8fDE3NTU5Nzk5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 149,
      originalPrice: 199,
      rating: 4.7,
      reviews: 156,
      duration: "2-3 hours",
      category: "Electrical",
      description: "Certified electricians for all your electrical needs",
      features: ["Licensed technicians", "Safety certified", "Emergency service"],
      distance: "3.1 km",
      availability: "available",
      responseTime: "25 mins",
      isOnline: true
    },
    {
      id: "elec-2",
      name: "Home Wiring & Rewiring",
      provider: "ElectroFix Pro",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJpbmclMjBlbGVjdHJpY2FsfGVufDF8fHx8MTc1NTk3OTk3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      price: 2499,
      rating: 4.8,
      reviews: 94,
      duration: "1-2 days",
      category: "Electrical",
      description: "Complete home electrical wiring and rewiring services",
      features: ["ISI certified wires", "Safety compliance", "5 year warranty"],
      distance: "4.2 km",
      availability: "available",
      responseTime: "45 mins",
      isOnline: false
    },

    // Auto Services
    {
      id: "auto-1",
      name: "Car Servicing & Repair",
      provider: "AutoCare Garage",
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjByZXBhaXJ8ZW58MXx8fHwxNzU1OTc5OTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 1299,
      originalPrice: 1599,
      rating: 4.6,
      reviews: 198,
      duration: "3-5 hours",
      category: "Auto",
      description: "Complete car servicing with genuine parts",
      features: ["Genuine parts", "Pick & drop", "6 month warranty"],
      distance: "2.7 km",
      availability: "available",
      responseTime: "1 hour",
      isOnline: true
    },
    {
      id: "auto-2",
      name: "Bike Service & Maintenance",
      provider: "BikeZone Service",
      image: "https://images.unsplash.com/photo-1558618666-fdcd7c8cd01f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWtlJTIwc2VydmljZXxlbnwxfHx8fDE3NTU5Nzk5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 599,
      rating: 4.5,
      reviews: 234,
      duration: "2-3 hours",
      category: "Auto",
      description: "Professional bike servicing and repair",
      features: ["Engine tuning", "Oil change", "Battery check"],
      distance: "1.9 km",
      availability: "available",
      responseTime: "30 mins",
      isOnline: false
    },

    // Towing
    {
      id: "tow-1",
      name: "24/7 Car Towing Service",
      provider: "QuickTow Rescue",
      image: "https://images.unsplash.com/photo-1591950337707-dfaef14e6de7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3dpbmclMjBzZXJ2aWNlfGVufDF8fHx8MTc1NTk3OTk3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      price: 799,
      rating: 4.4,
      reviews: 89,
      duration: "30-60 mins",
      category: "Towing",
      description: "Emergency towing service available 24/7",
      features: ["24/7 availability", "GPS tracking", "Insurance covered"],
      distance: "City-wide",
      availability: "available",
      responseTime: "15 mins",
      isOnline: true
    },

    // Laundry
    {
      id: "laund-1",
      name: "Premium Laundry Service",
      provider: "FreshWash Express",
      image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXVuZHJ5JTIwc2VydmljZXxlbnwxfHx8fDE3NTU5Nzk5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 199,
      originalPrice: 249,
      rating: 4.7,
      reviews: 167,
      duration: "24-48 hours",
      category: "Laundry",
      description: "Professional dry cleaning and laundry service",
      features: ["Pick & drop", "Dry cleaning", "Ironing included"],
      distance: "1.5 km",
      availability: "available",
      responseTime: "2 hours",
      isOnline: true
    },
    {
      id: "laund-2",
      name: "Express Wash & Fold",
      provider: "SpeedyClean",
      image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXNoJTIwZm9sZHxlbnwxfHx8fDE3NTU5Nzk5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 149,
      rating: 4.3,
      reviews: 145,
      duration: "Same day",
      category: "Laundry",
      description: "Quick wash and fold service for everyday clothes",
      features: ["Same day delivery", "Eco-friendly detergent", "Stain removal"],
      distance: "2.1 km",
      availability: "available",
      responseTime: "1 hour",
      isOnline: false
    },

    // Pest Control
    {
      id: "pest-1",
      name: "Comprehensive Pest Control",
      provider: "BugBusters Pro",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXN0JTIwY29udHJvbHxlbnwxfHx8fDE3NTU5Nzk5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 699,
      originalPrice: 899,
      rating: 4.8,
      reviews: 112,
      duration: "2-3 hours",
      category: "Pest Control",
      description: "Complete pest control with eco-safe chemicals",
      features: ["Eco-safe chemicals", "3 month warranty", "Cockroach, ants, termites"],
      distance: "3.8 km",
      availability: "available",
      responseTime: "2 hours",
      isOnline: true
    },

    // Barber
    {
      id: "barb-1",
      name: "Premium Home Salon Service",
      provider: "StyleCraft Barbers",
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJiZXIlMjBzYWxvbnxlbnwxfHx8fDE3NTU5Nzk5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 299,
      rating: 4.9,
      reviews: 201,
      duration: "45 mins",
      category: "Barber",
      description: "Professional haircut and grooming at your doorstep",
      features: ["Premium products", "Beard styling", "Hair wash included"],
      distance: "2.4 km",
      availability: "available",
      responseTime: "45 mins",
      isOnline: true
    },

    // Carpenter
    {
      id: "carp-1",
      name: "Custom Furniture Making",
      provider: "WoodCraft Artisans",
      image: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJwZW50ZXIlMjB3b29kd29ya3xlbnwxfHx8fDE3NTU5Nzk5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 1499,
      rating: 4.7,
      reviews: 87,
      duration: "1-3 days",
      category: "Carpenter",
      description: "Custom furniture design and manufacturing",
      features: ["Custom design", "Quality wood", "1 year warranty"],
      distance: "4.7 km",
      availability: "available",
      responseTime: "3 hours",
      isOnline: false
    },
    {
      id: "carp-2",
      name: "Furniture Repair Service",
      provider: "FixIt Carpentry",
      image: "https://images.unsplash.com/photo-1604709177225-055f99402ea3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXJuaXR1cmUlMjByZXBhaXJ8ZW58MXx8fHwxNzU1OTc5OTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 399,
      rating: 4.5,
      reviews: 134,
      duration: "2-4 hours",
      category: "Carpenter",
      description: "Professional furniture repair and restoration",
      features: ["Wood polishing", "Joint repair", "Hardware replacement"],
      distance: "2.9 km",
      availability: "available",
      responseTime: "1 hour",
      isOnline: true
    },

    // Plumber
    {
      id: "plumb-1",
      name: "Plumbing & Pipeline Services",
      provider: "AquaFix Pro",
      image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmluZyUyMHNlcnZpY2V8ZW58MXx8fHwxNzU1OTc5OTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 179,
      originalPrice: 229,
      rating: 4.6,
      reviews: 198,
      duration: "1-3 hours",
      category: "Plumbing",
      description: "Expert plumbing solutions for residential properties",
      features: ["24/7 availability", "Quality materials", "Quick response"],
      distance: "2.7 km",
      availability: "available",
      responseTime: "20 mins",
      isOnline: true
    },
    {
      id: "plumb-2",
      name: "Bathroom Fitting Service",
      provider: "FlowMaster Plumbing",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMGZpdHRpbmd8ZW58MXx8fHwxNzU1OTc5OTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 2999,
      rating: 4.8,
      reviews: 76,
      duration: "1-2 days",
      category: "Plumbing",
      description: "Complete bathroom installation and fitting",
      features: ["Premium fittings", "Waterproofing", "2 year warranty"],
      distance: "3.5 km",
      availability: "busy",
      responseTime: "2 hours",
      isOnline: false
    },

    // Painting
    {
      id: "paint-1",
      name: "Professional Painting Service",
      provider: "ColorCraft Painters",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGluZyUyMHNlcnZpY2UlMjBob21lfGVufDF8fHx8MTc1NTk3OTk3NHww&ixlib=rb-4.1.0&q=80&w=1080",
      price: 299,
      rating: 4.5,
      reviews: 134,
      duration: "1-2 days",
      category: "Painting",
      description: "Interior and exterior painting with premium materials",
      features: ["Premium paint", "Surface preparation", "Clean finish"],
      distance: "4.2 km",
      availability: "available",
      responseTime: "3 hours",
      isOnline: true
    },
    {
      id: "paint-2",
      name: "Wall Texture & Design",
      provider: "ArtWall Designers",
      image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YWxsJTIwdGV4dHVyZXxlbnwxfHx8fDE3NTU5Nzk5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 899,
      rating: 4.7,
      reviews: 92,
      duration: "2-3 days",
      category: "Painting",
      description: "Creative wall textures and artistic designs",
      features: ["Custom designs", "3D textures", "Color consultation"],
      distance: "5.1 km",
      availability: "available",
      responseTime: "4 hours",
      isOnline: false
    },

    // Appliance Install
    {
      id: "appl-1",
      name: "Home Appliance Installation",
      provider: "TechInstall Pro",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcHBsaWFuY2UlMjBpbnN0YWxsYXRpb258ZW58MXx8fHwxNzU1OTc5OTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 499,
      rating: 4.6,
      reviews: 156,
      duration: "1-2 hours",
      category: "Appliance Install",
      description: "Professional installation of home appliances",
      features: ["All brands", "Warranty support", "Safety testing"],
      distance: "2.8 km",
      availability: "available",
      responseTime: "1 hour",
      isOnline: true
    },

    // RO/Water Purifier
    {
      id: "ro-1",
      name: "RO Installation & Service",
      provider: "PureWater Solutions",
      image: "https://images.unsplash.com/photo-1582719201952-9b9f9f82ce21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMHB1cmlmaWVyfGVufDF8fHx8MTc1NTk3OTk3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      price: 799,
      originalPrice: 999,
      rating: 4.8,
      reviews: 187,
      duration: "2-3 hours",
      category: "RO/Water Purifier",
      description: "RO water purifier installation and maintenance",
      features: ["All brands", "Filter replacement", "6 month service"],
      distance: "3.2 km",
      availability: "available",
      responseTime: "2 hours",
      isOnline: true
    },

    // Movers
    {
      id: "move-1",
      name: "House Shifting Service",
      provider: "EasyMove Packers",
      image: "https://images.unsplash.com/photo-1600573472556-e636b24d01dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpbmclMjBzZXJ2aWNlfGVufDF8fHx8MTc1NTk3OTk3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      price: 2999,
      rating: 4.4,
      reviews: 143,
      duration: "4-8 hours",
      category: "Movers",
      description: "Professional packing and moving services",
      features: ["Safe packing", "Insurance covered", "Loading & unloading"],
      distance: "City-wide",
      availability: "available",
      responseTime: "2 hours",
      isOnline: false
    },

    // Gardening
    {
      id: "gard-1",
      name: "Garden & Landscaping",
      provider: "GreenThumb Experts",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW5pbmclMjBsYW5kc2NhcGluZ3xlbnwxfHx8fDE3NTU5Nzk5NzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 449,
      originalPrice: 599,
      rating: 4.9,
      reviews: 89,
      duration: "4-6 hours",
      category: "Gardening",
      description: "Complete garden makeover and maintenance services",
      features: ["Plant selection", "Irrigation setup", "Monthly maintenance"],
      distance: "5.1 km",
      availability: "available",
      responseTime: "4 hours",
      isOnline: true
    },
    {
      id: "gard-2",
      name: "Terrace Garden Setup",
      provider: "Urban Greens",
      image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXJyYWNlJTIwZ2FyZGVufGVufDF8fHx8MTc1NTk3OTk3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      price: 1299,
      rating: 4.6,
      reviews: 67,
      duration: "1-2 days",
      category: "Gardening",
      description: "Complete terrace garden design and setup",
      features: ["Vertical gardens", "Drip irrigation", "Plant selection"],
      distance: "6.2 km",
      availability: "available",
      responseTime: "5 hours",
      isOnline: false
    },

    // Sofa Cleaning
    {
      id: "sofa-1",
      name: "Sofa Deep Cleaning Service",
      provider: "FabriClean Specialists",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2ZhJTIwY2xlYW5pbmd8ZW58MXx8fHwxNzU1OTc5OTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 699,
      originalPrice: 899,
      rating: 4.7,
      reviews: 178,
      duration: "2-3 hours",
      category: "Sofa Cleaning",
      description: "Professional sofa and upholstery cleaning",
      features: ["Steam cleaning", "Stain removal", "Fabric protection"],
      distance: "2.6 km",
      availability: "available",
      responseTime: "1.5 hours",
      isOnline: true
    },

    // CCTV
    {
      id: "cctv-1",
      name: "CCTV Installation & Setup",
      provider: "SecureView Systems",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjY3R2JTIwaW5zdGFsbGF0aW9ufGVufDF8fHx8MTc1NTk3OTk3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      price: 1599,
      rating: 4.5,
      reviews: 124,
      duration: "3-5 hours",
      category: "CCTV",
      description: "Complete CCTV system installation and configuration",
      features: ["HD cameras", "Mobile app access", "Night vision"],
      distance: "4.1 km",
      availability: "available",
      responseTime: "3 hours",
      isOnline: false
    },

    // Computer Repair
    {
      id: "comp-1",
      name: "Computer Repair Service",
      provider: "TechFix Solutions",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHJlcGFpcnxlbnwxfHx8fDE3NTU5Nzk5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 799,
      rating: 4.6,
      reviews: 167,
      duration: "1-3 hours",
      category: "Computer Repair",
      description: "Professional computer and laptop repair services",
      features: ["Hardware repair", "Software installation", "Data recovery"],
      distance: "2.9 km",
      availability: "available",
      responseTime: "45 mins",
      isOnline: true
    },
    {
      id: "comp-2",
      name: "Laptop Screen Replacement",
      provider: "ScreenFix Pro",
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBzY3JlZW4lMjByZXBhaXJ8ZW58MXx8fHwxNzU1OTc5OTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 2499,
      rating: 4.4,
      reviews: 93,
      duration: "2-4 hours",
      category: "Computer Repair",
      description: "Laptop screen replacement with original parts",
      features: ["Original parts", "Same day service", "6 month warranty"],
      distance: "3.7 km",
      availability: "busy",
      responseTime: "2 hours",
      isOnline: false
    }
  ]

  const categories = categoriesData.length > 0 ? categoriesData : [
    "All Services",
    "Cleaning",
    "AC Repair",
    "Electrical",
    "Auto",
    "Towing",
    "Laundry",
    "Pest Control",
    "Barber",
    "Carpenter",
    "Plumbing",
    "Painting",
    "Appliance Install",
    "RO/Water Purifier",
    "Movers",
    "Gardening",
    "Sofa Cleaning",
    "CCTV",
    "Computer Repair"
  ]

  const sortOptions = [
    { value: "relevance", label: "Relevance", icon: <Target size={16} /> },
    { value: "popularity", label: "Popularity", icon: <TrendingUp size={16} /> },
    { value: "rating", label: "Highest Rated", icon: <Star size={16} /> },
    { value: "price-low", label: "Price: Low to High", icon: <DollarSign size={16} /> },
    { value: "price-high", label: "Price: High to Low", icon: <DollarSign size={16} /> },
  ]

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
                <GlassCard interactive className="group overflow-hidden h-full">
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
                        onClick={() => addToCart(service)}
                        disabled={service.availability === 'unavailable'}
                        className="flex-1 bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary text-xs py-2 h-8"
                      >
                        <Plus size={12} className="mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        onClick={() => openChat(service)}
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
          onBookService={(providerId, price) => {
            // Find the service and add to cart
            const service = services.find(s => s.id === providerId)
            if (service) {
              addToCart(service)
            }
            setIsChatOpen(false)
            setSelectedProvider(null)
          }}
        />
      )}
    </div>
  )
}

export { ServicesPage }