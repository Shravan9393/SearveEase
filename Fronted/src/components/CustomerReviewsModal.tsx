import React, { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Star, Filter, MessageCircle } from "lucide-react"
import { reviewsAPI, Review } from "../services/reviews"

interface CustomerReviewsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CustomerReviewsModal: React.FC<CustomerReviewsModalProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all")
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    if (!isOpen) return

    const loadReviews = async () => {
      try {
        const data = await reviewsAPI.getProviderReviews({ limit: 200 })
        setReviews(data.reviews || [])
      } catch (error) {
        console.error("Failed to load provider reviews", error)
        setReviews([])
      }
    }

    loadReviews()
  }, [isOpen])

  const filteredReviews = useMemo(
    () => reviews.filter((review) => (filter === "all" ? true : review.rating === Number(filter))),
    [reviews, filter]
  )

  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, index) => (
      <Star key={index} size={16} className={index < rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"} />
    ))

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div onClick={(e) => e.stopPropagation()} className="modal-glass rounded-3xl max-w-5xl w-full max-h-[85vh] overflow-hidden border border-primary/30">
              <div className="p-6 border-b border-primary/20 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl text-foreground">Customer Reviews</h2>
                  <p className="text-sm text-muted-foreground mt-1">{reviews.length} total reviews • {averageRating} average rating</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 bg-muted/20 rounded-xl flex items-center justify-center"><X size={20} /></button>
              </div>

              <div className="p-6 border-b border-primary/20 flex gap-2 flex-wrap">
                {(["all", "5", "4", "3", "2", "1"] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`px-3 py-1.5 rounded-xl text-sm ${filter === value ? "bg-primary/20 text-primary" : "bg-muted/10 text-muted-foreground"}`}
                  >
                    {value === "all" ? "All" : `${value}★`}
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-y-auto max-h-[55vh] space-y-4">
                {filteredReviews.map((review) => (
                  <div key={review._id} className="glass-card p-4 rounded-2xl border border-primary/30">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-foreground">{review.customerProfileId?.fullName || "Customer"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                    </div>
                    <p className="text-xs text-primary mb-2">{review.bookingId?.serviceId?.title || "Service"}</p>
                    <p className="text-sm text-muted-foreground">{review.comment || "No comment"}</p>
                  </div>
                ))}
                {!filteredReviews.length && <p className="text-muted-foreground text-center py-10">No reviews found.</p>}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
