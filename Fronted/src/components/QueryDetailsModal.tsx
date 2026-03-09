import React from "react"
import { motion } from "motion/react"
import { X, MapPin, DollarSign, Clock, Phone, Mail, User, MessageSquare, Check, XCircle } from "lucide-react"
import { Button } from "./ui/button"

interface QueryDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  query: {
    customerName: string
    customerAvatar: string
    service: string
    location: string
    budget: string
    time: string
    message: string
  } | null
}

export const QueryDetailsModal: React.FC<QueryDetailsModalProps> = ({ isOpen, onClose, query }) => {
  if (!isOpen || !query) return null

  const handleAccept = () => {
    alert(`You've accepted the query from ${query.customerName}. The customer will be notified.`)
    onClose()
  }

  const handleDecline = () => {
    alert(`Query declined. This query will be hidden from your notifications.`)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl glass-card border border-sage-200/20 dark:border-sage-700/30 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-sage-200/20 dark:border-sage-700/30 bg-gradient-to-r from-primary/10 to-sage-600/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-sage-200/20 dark:hover:bg-sage-700/20 rounded-lg transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30">
              <img 
                src={query.customerAvatar} 
                alt={query.customerName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl text-foreground mb-1">Service Request</h2>
              <p className="text-sm text-muted-foreground">{query.time}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-sage-100/50 dark:bg-sage-900/20 rounded-xl">
                <User size={18} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm text-foreground">{query.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-sage-100/50 dark:bg-sage-900/20 rounded-xl">
                <MapPin size={18} className="text-sage-600 dark:text-sage-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm text-foreground">{query.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-3">
            <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Service Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-sage-100/50 dark:bg-sage-900/20 rounded-xl">
                <MessageSquare size={18} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="text-sm text-foreground">{query.service}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-sage-100/50 dark:bg-sage-900/20 rounded-xl">
                <DollarSign size={18} className="text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="text-sm text-foreground">{query.budget}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Customer Message</h3>
            <div className="p-4 bg-sage-100/50 dark:bg-sage-900/20 rounded-xl border border-sage-200/20 dark:border-sage-700/30">
              <p className="text-sm text-foreground leading-relaxed">{query.message}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-foreground mb-1">Response Time</p>
                <p className="text-xs text-muted-foreground">
                  Respond within 30 minutes to increase your chances of getting this booking. Fast responders get 3x more bookings!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-sage-200/20 dark:border-sage-700/30 bg-sage-50/50 dark:bg-sage-950/50">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1 py-6 border-sage-300 dark:border-sage-700 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              <XCircle size={18} className="mr-2" />
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 py-6 bg-primary hover:bg-primary/90"
            >
              <Check size={18} className="mr-2" />
              Accept & Respond
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
