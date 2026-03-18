import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  DollarSign,
  History,
  ThumbsUp,
  ThumbsDown,
  User
} from "lucide-react"

interface Notification {
  id: string
  bookingId?: string
  customerName: string
  customerAvatar: string
  service: string
  location: string
  budget: string
  paymentLabel?: string
  time: string
  message: string
  status?: 'pending' | 'accepted' | 'denied' | 'dismissed'
  timestamp?: Date
}

interface NotificationSidebarProps {
  notifications: Notification[]
  onAccept: (id: string) => void
  onDeny: (id: string) => void
  onDismiss: (id: string) => void
  onCollapseChange?: (isCollapsed: boolean) => void
}

export const NotificationSidebar: React.FC<NotificationSidebarProps> = ({
  notifications,
  onAccept,
  onDeny,
  onDismiss,
  onCollapseChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'accepted' | 'denied' | 'history'>('active')

  const handleToggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    onCollapseChange?.(newState)
  }

  // Filter notifications by status
  const activeNotifications = notifications.filter(n => !n.status || n.status === 'pending')
  const acceptedNotifications = notifications.filter(n => n.status === 'accepted')
  const deniedNotifications = notifications.filter(n => n.status === 'denied')
  const historyNotifications = notifications.filter(n => n.status === 'dismissed')

  const tabs = [
    { id: 'active', label: 'Active', count: activeNotifications.length, icon: Bell },
    { id: 'accepted', label: 'Accepted', count: acceptedNotifications.length, icon: ThumbsUp },
    { id: 'denied', label: 'Denied', count: deniedNotifications.length, icon: ThumbsDown },
    { id: 'history', label: 'History', count: historyNotifications.length, icon: History }
  ]

  const getCurrentNotifications = () => {
    switch (activeTab) {
      case 'active': return activeNotifications
      case 'accepted': return acceptedNotifications
      case 'denied': return deniedNotifications
      case 'history': return historyNotifications
      default: return []
    }
  }

  const currentNotifications = getCurrentNotifications()

  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: isCollapsed ? 320 : 0 }}
      className="fixed right-0 top-20 bottom-32 w-96 z-40"
    >
      {/* Collapse/Expand Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleCollapse}
        className="absolute -left-10 top-4 w-10 h-10 glass-card rounded-l-xl rounded-r-none border-r-0 border border-primary/30 shadow-lg shadow-primary/20 flex items-center justify-center group hover:border-primary/50 transition-all"
        style={{
          boxShadow: '0 0 20px rgba(88, 129, 87, 0.3), inset 0 0 10px rgba(88, 129, 87, 0.1)'
        }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight size={20} className="text-primary" />
        </motion.div>
        {!isCollapsed && activeNotifications.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -left-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
          >
            <span className="text-xs text-white">{activeNotifications.length}</span>
          </motion.div>
        )}
      </motion.button>

      {/* Sidebar Content */}
      <div 
        className="h-full glass-card border-l border-primary/30 shadow-xl overflow-hidden flex flex-col"
        style={{
          boxShadow: '0 0 30px rgba(88, 129, 87, 0.3), inset 0 0 20px rgba(88, 129, 87, 0.05)'
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Bell size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-foreground">Notifications</h3>
              <p className="text-xs text-muted-foreground">
                {activeNotifications.length} new request{activeNotifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative p-2 rounded-lg transition-all border ${
                    activeTab === tab.id 
                      ? 'bg-primary/20 border-primary/40 shadow-lg' 
                      : 'bg-transparent border-transparent hover:bg-primary/5'
                  }`}
                  style={activeTab === tab.id ? {
                    boxShadow: '0 0 15px rgba(88, 129, 87, 0.3)'
                  } : {}}
                >
                  <Icon size={16} className={`mx-auto mb-1 ${
                    activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <p className={`text-xs ${
                    activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {tab.count}
                  </p>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {currentNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                  <Bell size={32} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  No {activeTab} notifications
                </p>
              </motion.div>
            ) : (
              currentNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: 100 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-4 rounded-2xl border border-primary/30 hover:border-primary/50 transition-all group"
                  style={{
                    boxShadow: '0 0 15px rgba(88, 129, 87, 0.2), inset 0 0 10px rgba(88, 129, 87, 0.05)'
                  }}
                >
                  {/* Customer Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <img 
                        src={notification.customerAvatar} 
                        alt={notification.customerName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-foreground truncate">{notification.customerName}</h4>
                      <p className="text-xs text-primary truncate">{notification.service}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{notification.time}</span>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {notification.message}
                  </p>

                  {/* Details */}
                  <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-primary" />
                      {notification.location.split(',')[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} className="text-primary" />
                      {notification.budget}
                    </span>
                  </div>

                  {notification.paymentLabel && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary border border-primary/20">
                        {notification.paymentLabel}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {activeTab === 'active' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onAccept(notification.id)}
                        className="flex-1 px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-all flex items-center justify-center gap-2 border border-primary/30"
                        style={{
                          boxShadow: '0 0 10px rgba(88, 129, 87, 0.2)'
                        }}
                      >
                        <CheckCircle2 size={16} />
                        Accept
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onDeny(notification.id)}
                        className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-all flex items-center justify-center gap-2 border border-red-500/30"
                      >
                        <XCircle size={16} />
                        Deny
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Dismiss button for history */}
                  {(activeTab === 'accepted' || activeTab === 'denied' || activeTab === 'history') && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onDismiss(notification.id)}
                        className="flex-1 px-3 py-2 bg-muted/20 hover:bg-muted/30 text-muted-foreground rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        <XCircle size={14} />
                        Remove
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Status Badge */}
                  {notification.status && activeTab !== 'active' && (
                    <div className="mt-3 pt-3 border-t border-primary/10">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        notification.status === 'accepted' 
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                          : notification.status === 'denied'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-muted/20 text-muted-foreground'
                      }`}>
                        {notification.status === 'accepted' && <CheckCircle2 size={12} />}
                        {notification.status === 'denied' && <XCircle size={12} />}
                        {notification.status === 'dismissed' && <Clock size={12} />}
                        {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
