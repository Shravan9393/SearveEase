import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, ArrowRight, Star, Users, Shield, MapPin, Clock, Award, ChevronLeft, ChevronRight } from "lucide-react"
import { GlassCard } from "./ui/glass-card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { CategoryChips } from "./CategoryChips"
import { ServiceProviderCard, ServiceProvider } from "./ServiceProviderCard"
import { ImageWithFallback } from "./figma/ImageWithFallback"
import { ImageCollage, CollageImage } from "./ImageCollage"
import { CartItem } from "../App"
import { servicesAPI, categoriesAPI, Service, Category } from "../services"

import divya from "../assets/Images/divya.jpg";
import saurav from "../assets/Images/saurav.jpg";
import shravan from "../assets/Images/shravan.jpg";
import shubham from "../assets/Images/shubham.png";

interface HomePageProps {
  onNavigate?: (page: string) => void
  onBookNow?: (service: Omit<CartItem, 'quantity'>) => void
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onBookNow }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [providerSlideIndex, setProviderSlideIndex] = useState(0)
  const [testimonialSlideIndex, setTestimonialSlideIndex] = useState(0)
  
  // State for API data
  const [featuredServices, setFeaturedServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [popularProviders, setPopularProviders] = useState<ServiceProvider[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services
        const servicesResponse = await servicesAPI.getServices({ limit: 10 })
        setFeaturedServices(servicesResponse.services || [])
        setIsLoadingServices(false)
        
        // Fetch categories
        const categoriesResponse = await categoriesAPI.getCategories()
        setCategories(categoriesResponse || [])
        setIsLoadingCategories(false)
        
        // Map services to providers (backend needs separate provider profiles API)
        const providers: ServiceProvider[] = (servicesResponse.services || []).slice(0, 6).map((service: Service) => ({
          id: service._id,
          name: service.providerName,
          image: service.providerImage || service.images,
          rating: service.rating,
          reviewCount: service.reviews,
          distance: service.distance,
          responseTime: service.responseTime,
          verified: true,
          pricing: { starting: service.pricing, currency: "₹" },
          services: [service.categoryName],
          badges: service.availability === 'available' ? ['Available'] : ['Busy'],
          availability: service.availability
        }))
        setPopularProviders(providers)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoadingServices(false)
        setIsLoadingCategories(false)
      }
    }
    
    fetchData()
  }, [])

  const handleCategorySelect = useCallback((id: string) => {
    onNavigate?.("services")
  }, [onNavigate])

  const handleSearchClick = useCallback(() => {
    onNavigate?.("services")
  }, [onNavigate])

  const handleViewAllServices = useCallback(() => {
    onNavigate?.("services")
  }, [onNavigate])

  const handleFindServices = useCallback(() => {
    onNavigate?.("services")
  }, [onNavigate])

  const handleBookNowClick = useCallback((service: any) => {
    const cartItem: Omit<CartItem, 'quantity'> = {
      id: service._id || service.id,
      providerProfileId: service.providerId || service.providerProfileId || "",
      name: service.title || service.name,
      provider: service.providerName || service.provider,
      image: service.images || service.image,
      price: service.pricing || service.price,
      originalPrice: service.originalPrice,
      category: service.categoryName || service.category,
      duration: service.duration,
      features: service.features || []
    }
    onBookNow?.(cartItem)
  }, [onBookNow])

  const teamMembers = [
    { id: "1", name: "Vaddi Divya", role: "UI/UX Designer", image: divya, bio: "Designed the complete UI/UX and visual identity of ServeEase", experience: "UI/UX" },
    { id: "2", name: "Saurav Kumar", role: "Backend – Database", image: saurav, bio: "Designed database schema and data architecture", experience: "Backend" },
    { id: "3", name: "Shravan Yadav", role: "Backend Developer", image: shravan, bio: "Developed backend APIs, authentication, and system integration", experience: "Backend" },
    { id: "4", name: "Shubham Kumar", role: "Frontend Developer", image: shubham, bio: "Implemented frontend logic and backend integration", experience: "Frontend" }
  ];

  const heroMasonryImages: CollageImage[] = [
    { src: "https://images.unsplash.com/photo-1683115097173-f24516d000c6?w=1080", alt: "Professional Cleaning Services" },
    { src: "https://images.unsplash.com/photo-1727413434026-0f8314c037d8?w=1080", alt: "Expert Repair Services" },
    { src: "https://images.unsplash.com/photo-1651449815993-706eaa7a936a?w=1080", alt: "Local Business Support" },
    { src: "https://images.unsplash.com/photo-1619243142206-381c5aeda31c?w=1080", alt: "Skilled Service Providers" },
    { src: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1080", alt: "Professional Painting" },
    { src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1080", alt: "Garden & Landscaping" },
    { src: "https://images.unsplash.com/photo-1631038506857-6c970dd9ba02?w=1080", alt: "Team Collaboration" },
    { src: "https://images.unsplash.com/photo-1736939666660-d4c776e0532c?w=1080", alt: "Business Excellence" }
  ]

  const testimonials = [
    { id: "1", name: "Sarah Johnson", image: "https://images.unsplash.com/photo-1736939666660-d4c776e0532c?w=100", rating: 5, text: "Amazing service! They cleaned my entire house perfectly and were very professional.", service: "Home Cleaning" },
    { id: "2", name: "Mike Chen", image: "https://images.unsplash.com/photo-1687570461530-fd0051bb2aaf?w=100", rating: 5, text: "Fixed my AC in no time. Great communication and fair pricing. Highly recommend!", service: "AC Repair" },
    { id: "3", name: "Jennifer Martinez", image: "https://images.unsplash.com/photo-1736939666660-d4c776e0532c?w=100", rating: 5, text: "Electrical work was done professionally and safely. Very satisfied with the quality!", service: "Electrical Services" },
    { id: "4", name: "Robert Taylor", image: "https://images.unsplash.com/photo-1687570461530-fd0051bb2aaf?w=100", rating: 5, text: "Quick response for plumbing emergency. Fixed the leak perfectly. Highly professional team!", service: "Plumbing" },
    { id: "5", name: "Amanda White", image: "https://images.unsplash.com/photo-1736939666660-d4c776e0532c?w=100", rating: 5, text: "The gardening service transformed my backyard beautifully. Excellent attention to detail!", service: "Gardening" },
    { id: "6", name: "David Kim", image: "https://images.unsplash.com/photo-1687570461530-fd0051bb2aaf?w=100", rating: 5, text: "Car servicing was thorough and reasonably priced. Will definitely use again!", service: "Auto Service" }
  ]
  
  const providersPerSlide = 2
  const testimonialsPerSlide = 2
  const maxProviderSlides = Math.ceil(popularProviders.length / providersPerSlide) || 1
  const maxTestimonialSlides = Math.ceil(testimonials.length / testimonialsPerSlide)
  
  const handleProviderNext = useCallback(() => {
    setProviderSlideIndex((prev) => (prev + 1) % maxProviderSlides)
  }, [maxProviderSlides])
  
  const handleProviderPrev = useCallback(() => {
    setProviderSlideIndex((prev) => (prev - 1 + maxProviderSlides) % maxProviderSlides)
  }, [maxProviderSlides])
  
  const handleTestimonialNext = useCallback(() => {
    setTestimonialSlideIndex((prev) => (prev + 1) % maxTestimonialSlides)
  }, [maxTestimonialSlides])
  
  const handleTestimonialPrev = useCallback(() => {
    setTestimonialSlideIndex((prev) => (prev - 1 + maxTestimonialSlides) % maxTestimonialSlides)
  }, [maxTestimonialSlides])

  const howItWorksSteps = [
    { icon: <Search size={24} />, title: "Search & Browse", description: "Find services and providers in your area" },
    { icon: <Users size={24} />, title: "Connect & Chat", description: "Chat with providers and get quotes" },
    { icon: <Shield size={24} />, title: "Book & Relax", description: "Secure booking with guaranteed service" }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden pb-32">
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-12 pb-16 px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-sage-700 bg-clip-text text-transparent">
                Local Services,<br /><span className="text-primary">Made Simple</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mb-8">
                ServeEase connects you with trusted local service providers. From cleaning to repairs, find verified professionals in your neighborhood.
              </p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
                <GlassCard className="p-2 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 flex items-center space-x-2">
                      <Search size={20} className="text-muted-foreground ml-2" />
                      <Input placeholder="What service do you need?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-0 bg-transparent focus:ring-0 text-base" />
                    </div>
                    <Button onClick={handleSearchClick} className="bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary rounded-xl px-6">Search</Button>
                  </div>
                </GlassCard>
              </motion.div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center"><Star size={16} className="text-primary" /></div>
                  <span>500+ Verified Providers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center"><Shield size={16} className="text-primary" /></div>
                  <span>Insured & Licensed</span>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
              <ImageCollage images={heroMasonryImages} variant="masonry" autoPlay={true} autoPlayDelay={6000} className="h-[500px]" />
            </motion.div>
          </div>
        </section>

        {/* Category Chips */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="py-8 px-4 max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Popular Services</h2>
          {isLoadingCategories ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : (
            <CategoryChips categories={categories} selectedCategories={selectedCategories} onCategorySelect={handleCategorySelect} />
          )}
        </motion.section>

        {/* Featured Services */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-semibold">Featured Services</h2>
              <Button variant="ghost" onClick={handleViewAllServices} className="text-primary hover:text-sage-700">View All <ArrowRight size={16} className="ml-1" /></Button>
            </div>
            {isLoadingServices ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : featuredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredServices.slice(0, 4).map((service, index) => (
                  <motion.div key={service._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}>
                    <GlassCard interactive className="group overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative sm:w-1/3 h-48 sm:h-auto">
                          <ImageWithFallback src={service.images} alt={service.title} className="w-full h-full object-cover sm:rounded-l-3xl rounded-t-3xl sm:rounded-tr-none" />
                          <div className="absolute top-4 left-4"><span className="px-3 py-1 bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs font-medium rounded-full">Featured</span></div>
                          <div className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1"><span className="text-white text-xs font-medium">{service.duration}</span></div>
                        </div>
                        <div className="sm:w-2/3 p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{service.title}</h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                                <Star size={14} className="text-yellow-500 fill-current" /><span>{service.rating}</span><span>({service.reviews} reviews)</span><span>•</span><span>{service.providerName}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                {service.originalPrice && <span className="text-xs text-muted-foreground line-through">₹{service.originalPrice}</span>}
                                <span className="text-xl font-bold text-primary">₹{service.pricing}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {service.features?.map((feature, idx) => (<span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg">{feature}</span>))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Clock size={14} /><span>{service.duration}</span><MapPin size={14} className="ml-2" /><span>{service.distance}</span>
                            </div>
                            <Button size="sm" onClick={() => handleBookNowClick(service)} className="bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary rounded-xl transition-all hover:scale-105">Book Now</Button>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground"><p>No services available yet. Be the first to list your service!</p></div>
            )}
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }} className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Getting the service you need is just three simple steps away</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorksSteps.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 + index * 0.1, duration: 0.6 }}>
                <GlassCard className="text-center p-8 h-full">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-sage-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">{step.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Our Team */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.6 }} className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">The passionate people behind ServeEase</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 + index * 0.1, duration: 0.6 }}>
                <GlassCard interactive className="text-center p-6">
                  <div className="relative mb-4">
                    <ImageWithFallback src={member.image} alt={member.name} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4" />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary to-sage-700 rounded-full flex items-center justify-center"><Award size={12} className="text-white" /></div>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm mb-3">{member.bio}</p>
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1">{member.experience} experience</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Popular Providers */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.0, duration: 0.6 }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-semibold">Top Rated Providers</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={handleProviderPrev} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"><ChevronLeft size={20} /></Button>
                  <Button variant="ghost" size="icon" onClick={handleProviderNext} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"><ChevronRight size={20} /></Button>
                </div>
                <Button variant="ghost" onClick={handleViewAllServices} className="text-primary hover:text-sage-700">View All <ArrowRight size={16} className="ml-1" /></Button>
              </div>
            </div>
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={providerSlideIndex} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {popularProviders.slice(providerSlideIndex * providersPerSlide, (providerSlideIndex + 1) * providersPerSlide).map((provider, index) => (
                    <motion.div key={provider.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.4 }}>
                      <ServiceProviderCard provider={provider} onViewDetails={(id) => console.log("View details:", id)} onContact={(id) => console.log("Contact:", id)} onLike={(id) => console.log("Like:", id)} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            {maxProviderSlides > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: maxProviderSlides }).map((_, index) => (<button key={index} onClick={() => setProviderSlideIndex(index)} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === providerSlideIndex ? "bg-primary w-8" : "bg-white/20 hover:bg-white/40"}`} aria-label={`Go to slide ${index + 1}`} />))}
              </div>
            )}
          </motion.div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4, duration: 0.6 }}>
            <div className="flex items-center justify-between mb-12">
              <div className="text-center flex-1">
                <h2 className="text-3xl font-semibold mb-4">What Our Customers Say</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">Real reviews from real customers who love ServeEase</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={handleTestimonialPrev} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"><ChevronLeft size={20} /></Button>
                <Button variant="ghost" size="icon" onClick={handleTestimonialNext} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"><ChevronRight size={20} /></Button>
              </div>
            </div>
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={testimonialSlideIndex} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testimonials.slice(testimonialSlideIndex * testimonialsPerSlide, (testimonialSlideIndex + 1) * testimonialsPerSlide).map((testimonial, index) => (
                    <motion.div key={testimonial.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.4 }}>
                      <GlassCard className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <ImageWithFallback src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <h4 className="font-semibold">{testimonial.name}</h4>
                            <div className="flex items-center space-x-1">{[...Array(testimonial.rating)].map((_, i) => (<Star key={i} size={14} className="text-yellow-500 fill-current" />))}</div>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-3">"{testimonial.text}"</p>
                        <span className="text-sm text-primary">{testimonial.service}</span>
                      </GlassCard>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: maxTestimonialSlides }).map((_, index) => (<button key={index} onClick={() => setTestimonialSlideIndex(index)} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === testimonialSlideIndex ? "bg-primary w-8" : "bg-white/20 hover:bg-white/40"}`} aria-label={`Go to slide ${index + 1}`} />))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.8, duration: 0.6 }}>
            <GlassCard className="text-center p-12 bg-gradient-to-r from-primary/5 to-sage-500/5">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers who trust ServeEase for their local service needs</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleFindServices} className="bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary rounded-xl px-8">Find Services</Button>
                <Button variant="outline" size="lg" className="border-white/20 hover:bg-white/10 rounded-xl px-8">Become a Provider</Button>
              </div>
            </GlassCard>
          </motion.div>
        </section>
      </div>
    </div>
  )
}

export { HomePage }


