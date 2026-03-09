import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Bell, Clock, MapPin, DollarSign, User } from "lucide-react"

interface ServiceQuery {
  id: string
  customerName: string
  customerAvatar: string
  service: string
  location: string
  budget: string
  time: string
  message: string
}

interface FloatingNotificationProps {
  notifications: ServiceQuery[]
  onDismiss: (id: string) => void
  onView: (query: ServiceQuery) => void
}

export const FloatingNotification: React.FC<FloatingNotificationProps> = ({ 
  notifications, 
  onDismiss, 
  onView 
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<ServiceQuery[]>([])

  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, 3))
  }, [notifications])

  return (
    <div className="fixed top-24 right-6 z-50 space-y-3 max-w-sm">
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              delay: index * 0.1 
            }}
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            {/* Frosted glass notification card */}
            <div className="glass-card p-4 border border-sage-200/20 dark:border-sage-700/30 shadow-lg overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sage-600/5 pointer-events-none" />
              
              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
                      <img 
                        src={notification.customerAvatar} 
                        alt={notification.customerName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Bell size={14} className="text-primary animate-pulse" />
                        <p className="text-sm text-foreground/90">New Query</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDismiss(notification.id)}
                    className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <X size={16} className="text-muted-foreground hover:text-destructive" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-sage-600 dark:text-sage-400" />
                    <p className="text-sm text-foreground">{notification.customerName}</p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{notification.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={12} className="text-primary" />
                      <span className="text-xs text-primary">{notification.budget}</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => onView(notification)}
                  className="mt-3 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
