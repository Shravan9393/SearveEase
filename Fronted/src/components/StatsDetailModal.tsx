import React from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  X, 
  DollarSign, 
  CheckCircle2, 
  Calendar, 
  Clock,
  MapPin,
  User,
  Star,
  TrendingUp,
  Package
} from "lucide-react"

interface StatsDetailModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'revenue' | 'completed' | 'bookings'
}

export const StatsDetailModal: React.FC<StatsDetailModalProps> = ({
  isOpen,
  onClose,
  type
}) => {
  // Mock detailed data based on type
  const getDetailedData = () => {
    switch (type) {
      case 'revenue':
        return [
          {
            id: 1,
            service: "AC Repair & Maintenance",
            customer: "Rahul Sharma",
            amount: 1200,
            date: "Dec 18, 2024",
            status: "paid",
            paymentMethod: "UPI"
          },
          {
            id: 2,
            service: "Emergency Repair Service",
            customer: "Priya Mehta",
            amount: 1800,
            date: "Dec 17, 2024",
            status: "paid",
            paymentMethod: "Card"
          },
          {
            id: 3,
            service: "Regular Maintenance",
            customer: "Amit Kumar",
            amount: 650,
            date: "Dec 16, 2024",
            status: "paid",
            paymentMethod: "Cash"
          },
          {
            id: 4,
            service: "AC Repair & Maintenance",
            customer: "Sneha Reddy",
            amount: 950,
            date: "Dec 15, 2024",
            status: "pending",
            paymentMethod: "UPI"
          },
          {
            id: 5,
            service: "Emergency Repair Service",
            customer: "Karthik Iyer",
            amount: 2000,
            date: "Dec 14, 2024",
            status: "paid",
            paymentMethod: "Card"
          }
        ]
      case 'completed':
        return [
          {
            id: 1,
            service: "AC Repair & Maintenance",
            customer: "Rahul Sharma",
            location: "Koramangala, Bangalore",
            completedDate: "Dec 18, 2024",
            duration: "2 hours",
            rating: 5,
            revenue: 1200
          },
          {
            id: 2,
            service: "Emergency Repair Service",
            customer: "Priya Mehta",
            location: "Indiranagar, Bangalore",
            completedDate: "Dec 17, 2024",
            duration: "1.5 hours",
            rating: 4.5,
            revenue: 1800
          },
          {
            id: 3,
            service: "Regular Maintenance",
            customer: "Amit Kumar",
            location: "HSR Layout, Bangalore",
            completedDate: "Dec 16, 2024",
            duration: "1 hour",
            rating: 5,
            revenue: 650
          },
          {
            id: 4,
            service: "AC Repair & Maintenance",
            customer: "Sneha Reddy",
            location: "Whitefield, Bangalore",
            completedDate: "Dec 15, 2024",
            duration: "2.5 hours",
            rating: 4.8,
            revenue: 950
          },
          {
            id: 5,
            service: "Emergency Repair Service",
            customer: "Karthik Iyer",
            location: "Electronic City, Bangalore",
            completedDate: "Dec 14, 2024",
            duration: "3 hours",
            rating: 4.7,
            revenue: 2000
          }
        ]
      case 'bookings':
        return [
          {
            id: 1,
            service: "AC Repair & Maintenance",
            customer: "Ravi Shankar",
            location: "Marathahalli, Bangalore",
            scheduledDate: "Dec 21, 2024",
            scheduledTime: "10:00 AM",
            status: "confirmed",
            budget: "₹800-1200"
          },
          {
            id: 2,
            service: "Emergency Repair Service",
            customer: "Divya Nair",
            location: "Jayanagar, Bangalore",
            scheduledDate: "Dec 21, 2024",
            scheduledTime: "2:00 PM",
            status: "confirmed",
            budget: "₹1000-1500"
          },
          {
            id: 3,
            service: "Regular Maintenance",
            customer: "Arun Patel",
            location: "BTM Layout, Bangalore",
            scheduledDate: "Dec 22, 2024",
            scheduledTime: "11:00 AM",
            status: "pending",
            budget: "₹500-700"
          },
          {
            id: 4,
            service: "AC Repair & Maintenance",
            customer: "Lakshmi Menon",
            location: "Koramangala, Bangalore",
            scheduledDate: "Dec 22, 2024",
            scheduledTime: "3:00 PM",
            status: "confirmed",
            budget: "₹900-1300"
          },
          {
            id: 5,
            service: "Emergency Repair Service",
            customer: "Suresh Babu",
            location: "Hebbal, Bangalore",
            scheduledDate: "Dec 23, 2024",
            scheduledTime: "9:00 AM",
            status: "confirmed",
            budget: "₹1200-1800"
          }
        ]
      default:
        return []
    }
  }

  const detailedData = getDetailedData()

  const getTitle = () => {
    switch (type) {
      case 'revenue': return 'Total Revenue Breakdown'
      case 'completed': return 'Completed Services Details'
      case 'bookings': return 'Active Bookings Details'
      default: return ''
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'revenue': return DollarSign
      case 'completed': return CheckCircle2
      case 'bookings': return Calendar
      default: return Package
    }
  }

  const Icon = getIcon()

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
              className="modal-glass rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-primary/30"
              style={{
                boxShadow: '0 0 40px rgba(88, 129, 87, 0.3), inset 0 0 30px rgba(88, 129, 87, 0.05)'
              }}
            >
              {/* Header */}
              <div className="p-6 border-b border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon size={24} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl text-foreground">{getTitle()}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {detailedData.length} {type === 'revenue' ? 'transactions' : type === 'completed' ? 'services' : 'bookings'}
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
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                <div className="space-y-4">
                  {type === 'revenue' && detailedData.map((item: any, index: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card p-5 rounded-2xl border border-primary/30 hover:border-primary/50 transition-all"
                      style={{
                        boxShadow: '0 0 15px rgba(88, 129, 87, 0.2), inset 0 0 10px rgba(88, 129, 87, 0.05)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-foreground">{item.service}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === 'paid' 
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                                : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {item.customer}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {item.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package size={14} />
                              {item.paymentMethod}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl text-primary">₹{item.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {type === 'completed' && detailedData.map((item: any, index: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card p-5 rounded-2xl border border-primary/30 hover:border-primary/50 transition-all"
                      style={{
                        boxShadow: '0 0 15px rgba(88, 129, 87, 0.2), inset 0 0 10px rgba(88, 129, 87, 0.05)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-foreground mb-2">{item.service}</h4>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {item.customer}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {item.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={18} className="fill-yellow-500 text-yellow-500" />
                          <span className="text-lg text-foreground">{item.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-primary/10">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {item.completedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {item.duration}
                          </span>
                        </div>
                        <span className="text-lg text-primary">₹{item.revenue.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  ))}

                  {type === 'bookings' && detailedData.map((item: any, index: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card p-5 rounded-2xl border border-primary/30 hover:border-primary/50 transition-all"
                      style={{
                        boxShadow: '0 0 15px rgba(88, 129, 87, 0.2), inset 0 0 10px rgba(88, 129, 87, 0.05)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-foreground">{item.service}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === 'confirmed' 
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                                : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {item.customer}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {item.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-primary/10">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {item.scheduledDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {item.scheduledTime}
                          </span>
                        </div>
                        <span className="text-sm text-primary">{item.budget}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Summary */}
                {type === 'revenue' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-5 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl border border-primary/30"
                    style={{
                      boxShadow: '0 0 20px rgba(88, 129, 87, 0.2)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp size={24} className="text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl text-primary">
                            ₹{detailedData.reduce((sum: number, item: any) => sum + item.amount, 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Paid: {detailedData.filter((item: any) => item.status === 'paid').length}</p>
                        <p className="text-sm text-muted-foreground">Pending: {detailedData.filter((item: any) => item.status === 'pending').length}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}