import React from "react"
import { motion } from "motion/react"
import { Star, MapPin, Clock, Verified, Heart, Phone, MessageCircle } from "lucide-react"
import { GlassCard } from "./ui/glass-card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { ImageWithFallback } from "./figma/ImageWithFallback"

interface ServiceProvider {
  id: string
  name: string
  image: string
  rating: number
  reviewCount: number
  distance: string
  responseTime: string
  verified: boolean
  pricing: {
    starting: number
    currency: string
  }
  services: string[]
  badges: string[]
  availability: "available" | "busy" | "offline"
  isLiked?: boolean
}

interface ServiceProviderCardProps {
  provider: ServiceProvider
  onContact?: (providerId: string) => void
  onLike?: (providerId: string) => void
  onViewDetails?: (providerId: string) => void
}

const ServiceProviderCard: React.FC<ServiceProviderCardProps> = ({
  provider,
  onContact,
  onLike,
  onViewDetails
}) => {
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500"
      case "busy": return "bg-yellow-500"
      case "offline": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case "available": return "Available"
      case "busy": return "Busy"
      case "offline": return "Offline"
      default: return "Unknown"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <GlassCard 
        interactive
        className="p-6 h-full group cursor-pointer"
        onClick={() => onViewDetails?.(provider.id)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <ImageWithFallback
                src={provider.image}
                alt={provider.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getAvailabilityColor(provider.availability)} rounded-full border-2 border-white dark:border-gray-900`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground">{provider.name}</h3>
                {provider.verified && (
                  <Verified size={16} className="text-blue-500" />
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star size={12} className="text-yellow-500 fill-current" />
                  <span>{provider.rating}</span>
                  <span>({provider.reviewCount})</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <MapPin size={12} />
                  <span>{provider.distance}</span>
                </div>
              </div>
            </div>
          </div>
          
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onLike?.(provider.id)
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Heart 
              size={20} 
              className={provider.isLiked ? "text-red-500 fill-current" : "text-muted-foreground"} 
            />
          </motion.button>
        </div>

        {/* Badges */}
        {provider.badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {provider.badges.slice(0, 3).map((badge, index) => (
              <Badge 
                key={index}
                variant="secondary"
                className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
              >
                {badge}
              </Badge>
            ))}
            {provider.badges.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                +{provider.badges.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Services */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Services:</p>
          <div className="flex flex-wrap gap-1">
            {provider.services.slice(0, 3).map((service, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-muted rounded-lg text-muted-foreground"
              >
                {service}
              </span>
            ))}
            {provider.services.length > 3 && (
              <span className="text-xs px-2 py-1 bg-muted rounded-lg text-muted-foreground">
                +{provider.services.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Response Time & Availability */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Clock size={12} />
            <span>Responds in {provider.responseTime}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 ${getAvailabilityColor(provider.availability)} rounded-full`} />
            <span className="text-xs text-muted-foreground">
              {getAvailabilityText(provider.availability)}
            </span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="text-lg font-semibold text-foreground">
              {provider.pricing.currency}{provider.pricing.starting}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onContact?.(provider.id)
              }}
              className="px-3 py-2 rounded-xl border-white/20 hover:bg-white/10"
            >
              <MessageCircle size={16} className="mr-1" />
              Chat
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onContact?.(provider.id)
              }}
              className="px-4 py-2 bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary rounded-xl"
            >
              <Phone size={16} className="mr-1" />
              Call
            </Button>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/5 to-sage-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </GlassCard>
    </motion.div>
  )
}

export { ServiceProviderCard, type ServiceProvider }