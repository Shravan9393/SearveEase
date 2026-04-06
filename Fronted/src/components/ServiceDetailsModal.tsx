import React, { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Star, Clock, MapPin, CircleDollarSign } from "lucide-react"
import { servicesAPI, Service as BackendService } from "../services/services"
import { reviewsAPI, Review } from "../services/reviews"
import { ImageWithFallback } from "./figma/ImageWithFallback"

interface ServiceDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  serviceId: string | null
}

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({ isOpen, onClose, serviceId }) => {
  const [service, setService] = useState<BackendService | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !serviceId) return

    const fetchDetails = async () => {
      setIsLoading(true)
      try {
        const [serviceResponse, reviewsResponse] = await Promise.all([
          servicesAPI.getServiceById(serviceId),
          reviewsAPI.getServiceReviews(serviceId, { page: 1, limit: 200 }),
        ])

        setService(serviceResponse.service || null)
        setReviews(reviewsResponse.reviews || [])
      } catch (error) {
        console.error("Failed to fetch service details", error)
        setService(null)
        setReviews([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [isOpen, serviceId])

  const providerName = useMemo(() => {
    if (!service) return "Provider"
    const provider = (service as any).providerId
    if (typeof provider === "string") return service.providerName || "Provider"
    return provider?.displayName || service.providerName || "Provider"
  }, [service])

  const averageRating = useMemo(() => {
    if (!reviews.length) return Number(service?.rating || 0).toFixed(1)
    const avg = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    return avg.toFixed(1)
  }, [reviews, service])

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={15}
        className={index < rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}
      />
    ))

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="modal-glass rounded-3xl w-full max-w-5xl h-[88vh] border border-primary/30 overflow-hidden"
            >
              <div className="p-5 border-b border-primary/20 flex items-center justify-between">
                <div>
                  <h2 className="text-xl text-foreground">Service Details</h2>
                  <p className="text-sm text-muted-foreground">Read full details and customer feedback before booking</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center">
                  <X size={18} />
                </button>
              </div>

              {isLoading && <div className="p-6 text-center text-muted-foreground">Loading service details...</div>}

              {!isLoading && !service && (
                <div className="p-6 text-center text-muted-foreground">Service details could not be loaded.</div>
              )}

              {!isLoading && service && (
                <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(88vh-88px)]">
                  <div className="p-6 border-r border-primary/20 overflow-y-auto">
                    <ImageWithFallback src={service.images} alt={service.title} className="w-full h-56 object-cover rounded-2xl" />

                    <h3 className="text-2xl text-foreground mt-4">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{service.description}</p>

                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <CircleDollarSign size={16} className="text-primary" /> ₹{service.pricing}
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock size={16} className="text-primary" /> {service.duration}
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <MapPin size={16} className="text-primary" /> {service.distance}
                      </div>
                    </div>

                    <div className="mt-5 p-4 border border-primary/20 rounded-2xl bg-muted/10">
                      <p className="text-sm text-muted-foreground">Provider</p>
                      <p className="text-foreground mt-1">{providerName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">{renderStars(Math.round(Number(averageRating)))}</div>
                        <span className="text-sm text-muted-foreground">{averageRating} ({reviews.length} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 overflow-y-auto">
                    <h4 className="text-lg text-foreground">Customer Reviews</h4>
                    <p className="text-sm text-muted-foreground mb-4">Full feedback from customers who booked this service.</p>

                    <div className="space-y-3">
                      {reviews.map((review) => (
                        <div key={review._id} className="p-4 rounded-2xl border border-primary/20 bg-muted/10">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm text-foreground">{review.customerProfileId?.fullName || "Customer"}</p>
                              <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-3">{review.comment || "No comment provided."}</p>
                        </div>
                      ))}

                      {reviews.length === 0 && (
                        <p className="text-sm text-muted-foreground py-8 text-center">No reviews available yet for this service.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
