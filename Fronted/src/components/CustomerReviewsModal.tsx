import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  X, 
  Star,
  ThumbsUp,
  MessageCircle,
  Filter,
  TrendingUp
} from "lucide-react"

interface Review {
  id: string
  customerName: string
  customerAvatar: string
  service: string
  rating: number
  date: string
  comment: string
  helpful: number
  response?: string
}

interface CustomerReviewsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CustomerReviewsModal: React.FC<CustomerReviewsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all')

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: "1",
      customerName: "Rahul Sharma",
      customerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      service: "AC Repair & Maintenance",
      rating: 5,
      date: "Dec 18, 2024",
      comment: "Excellent service! Very professional and quick. Fixed my AC within 30 minutes. Highly recommend!",
      helpful: 12,
      response: "Thank you for your kind words! We're glad we could help you."
    },
    {
      id: "2",
      customerName: "Priya Mehta",
      customerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      service: "Electrical Work",
      rating: 5,
      date: "Dec 17, 2024",
      comment: "Great work! The electrician was very knowledgeable and completed the installation perfectly. Very satisfied with the service.",
      helpful: 8
    },
    {
      id: "3",
      customerName: "Amit Kumar",
      customerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      service: "Plumbing",
      rating: 4,
      date: "Dec 16, 2024",
      comment: "Good service overall. The plumber was on time and fixed the leak. Would have given 5 stars if the pricing was slightly better.",
      helpful: 5,
      response: "Thank you for your feedback! We'll review our pricing to ensure it remains competitive."
    },
    {
      id: "4",
      customerName: "Sneha Reddy",
      customerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      service: "AC Repair & Maintenance",
      rating: 5,
      date: "Dec 15, 2024",
      comment: "Amazing experience! Very courteous and professional. Explained everything clearly and the AC is working perfectly now.",
      helpful: 15
    },
    {
      id: "5",
      customerName: "Karthik Iyer",
      customerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      service: "Emergency Repair Service",
      rating: 5,
      date: "Dec 14, 2024",
      comment: "Responded very quickly to my emergency call. Fixed the issue promptly. Very reliable service!",
      helpful: 10
    },
    {
      id: "6",
      customerName: "Divya Nair",
      customerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      service: "Regular Maintenance",
      rating: 4,
      date: "Dec 13, 2024",
      comment: "Regular maintenance was done well. Technician was professional and thorough. Just wished the appointment was available sooner.",
      helpful: 6
    },
    {
      id: "7",
      customerName: "Ravi Shankar",
      customerAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      service: "AC Repair & Maintenance",
      rating: 5,
      date: "Dec 12, 2024",
      comment: "Best AC service in Bangalore! Very professional team, reasonable pricing, and excellent quality of work.",
      helpful: 18
    },
    {
      id: "8",
      customerName: "Lakshmi Menon",
      customerAvatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      service: "Electrical Work",
      rating: 4,
      date: "Dec 11, 2024",
      comment: "Satisfied with the service. The work was done neatly and efficiently. Will book again for future needs.",
      helpful: 7
    }
  ]

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true
    return review.rating === parseInt(filter)
  })

  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
  }))

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating 
            ? 'fill-yellow-500 text-yellow-500' 
            : 'text-muted-foreground/30'
        }`}
      />
    ))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="modal-glass rounded-3xl max-w-5xl w-full max-h-[85vh] overflow-hidden border border-primary/30"
              style={{
                boxShadow: '0 0 40px rgba(88, 129, 87, 0.3), inset 0 0 30px rgba(88, 129, 87, 0.05)'
              }}
            >
              {/* Header */}
              <div className="p-6 border-b border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <MessageCircle size={24} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl text-foreground">Customer Reviews</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {reviews.length} total reviews • {averageRating} average rating
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-10 h-10 bg-muted/20 hover:bg-muted/30 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <X size={20} className="text-muted-foreground" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="flex">
                {/* Sidebar - Rating Overview */}
                <div className="w-80 p-6 border-r border-primary/20">
                  <div className="glass-card p-5 rounded-2xl border border-primary/30 mb-4"
                    style={{
                      boxShadow: '0 0 15px rgba(88, 129, 87, 0.2), inset 0 0 10px rgba(88, 129, 87, 0.05)'
                    }}
                  >
                    <div className="text-center mb-4">
                      <div className="text-5xl text-foreground mb-2">{averageRating}</div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {renderStars(Math.round(parseFloat(averageRating)))}
                      </div>
                      <p className="text-sm text-muted-foreground">Based on {reviews.length} reviews</p>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="space-y-3 mb-6">
                    {ratingDistribution.map(({ rating, count, percentage }) => (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm text-foreground">{rating}</span>
                          <Star size={14} className="fill-yellow-500 text-yellow-500" />
                        </div>
                        <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-sage-700 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">{count}</span>
                      </div>
                    ))}
                  </div>

                  {/* Filter */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Filter size={16} />
                      Filter by rating
                    </p>
                    <div className="flex flex-col gap-2">
                      {['all', '5', '4', '3', '2', '1'].map((f) => (
                        <motion.button
                          key={f}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFilter(f as any)}
                          className={`px-4 py-2 rounded-xl text-sm transition-all text-left ${
                            filter === f 
                              ? 'bg-primary/20 text-primary border border-primary/40' 
                              : 'bg-muted/10 text-muted-foreground border border-transparent hover:bg-muted/20'
                          }`}
                        >
                          {f === 'all' ? 'All Reviews' : `${f} Stars`}
                          {f !== 'all' && ` (${reviews.filter(r => r.rating === parseInt(f)).length})`}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                  <div className="space-y-4">
                    {filteredReviews.map((review, index) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card p-5 rounded-2xl border border-primary/30 hover:border-primary/50 transition-all"
                        style={{
                          boxShadow: '0 0 15px rgba(88, 129, 87, 0.2), inset 0 0 10px rgba(88, 129, 87, 0.05)'
                        }}
                      >
                        {/* Customer Info */}
                        <div className="flex items-start gap-3 mb-3">
                          <img 
                            src={review.customerAvatar} 
                            alt={review.customerName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-foreground">{review.customerName}</h4>
                              <span className="text-xs text-muted-foreground">{review.date}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-primary">{review.service}</span>
                            </div>
                          </div>
                        </div>

                        {/* Comment */}
                        <p className="text-sm text-muted-foreground mb-3">
                          {review.comment}
                        </p>

                        {/* Provider Response */}
                        {review.response && (
                          <div className="mt-3 pt-3 border-t border-primary/10">
                            <div className="bg-primary/5 rounded-xl p-3">
                              <p className="text-xs text-primary mb-1 flex items-center gap-2">
                                <MessageCircle size={12} />
                                Your Response
                              </p>
                              <p className="text-sm text-foreground">{review.response}</p>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-primary/10">
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ThumbsUp size={14} />
                            {review.helpful} found helpful
                          </button>
                          {!review.response && (
                            <button className="text-sm text-primary hover:underline">
                              Respond to review
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {filteredReviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                        <Star size={32} className="text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No reviews with this rating</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
