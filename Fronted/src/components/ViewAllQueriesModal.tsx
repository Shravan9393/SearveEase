import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  X, 
  Search,
  Filter,
  Clock,
  MapPin,
  DollarSign,
  User,
  MessageCircle,
  CheckCircle2,
  XCircle
} from "lucide-react"

interface Query {
  id: string
  customerName: string
  customerAvatar: string
  service: string
  location: string
  budget: string
  time: string
  message: string
  date: string
  urgency: 'low' | 'medium' | 'high'
}

interface ViewAllQueriesModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ViewAllQueriesModal: React.FC<ViewAllQueriesModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')

  // Mock queries data
  const queries: Query[] = [
    {
      id: "1",
      customerName: "Rahul Sharma",
      customerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      service: "AC Repair",
      location: "Koramangala, Bangalore",
      budget: "₹500-800",
      time: "2 min ago",
      date: "Dec 20, 2024",
      message: "Need urgent AC repair. Not cooling properly. Has been making strange noises.",
      urgency: 'high'
    },
    {
      id: "2",
      customerName: "Priya Mehta",
      customerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      service: "Electrical Work",
      location: "Indiranagar, Bangalore",
      budget: "₹300-500",
      time: "5 min ago",
      date: "Dec 20, 2024",
      message: "Light fixtures installation needed in 2 rooms. Looking for professional electrician.",
      urgency: 'medium'
    },
    {
      id: "3",
      customerName: "Amit Kumar",
      customerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      service: "Plumbing",
      location: "HSR Layout, Bangalore",
      budget: "₹400-600",
      time: "12 min ago",
      date: "Dec 20, 2024",
      message: "Kitchen sink is leaking. Need immediate fix before water damage occurs.",
      urgency: 'high'
    },
    {
      id: "4",
      customerName: "Sneha Reddy",
      customerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      service: "Painting",
      location: "Whitefield, Bangalore",
      budget: "₹2000-3000",
      time: "25 min ago",
      date: "Dec 20, 2024",
      message: "Looking for painting service for bedroom and living room. Need color consultation as well.",
      urgency: 'low'
    },
    {
      id: "5",
      customerName: "Karthik Iyer",
      customerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      service: "Carpentry",
      location: "Electronic City, Bangalore",
      budget: "₹1500-2500",
      time: "1 hour ago",
      date: "Dec 20, 2024",
      message: "Custom wardrobe installation needed. Have designs ready.",
      urgency: 'medium'
    },
    {
      id: "6",
      customerName: "Divya Nair",
      customerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      service: "Cleaning",
      location: "Jayanagar, Bangalore",
      budget: "₹800-1200",
      time: "2 hours ago",
      date: "Dec 20, 2024",
      message: "Deep cleaning service needed for 3BHK apartment before move-in.",
      urgency: 'medium'
    }
  ]

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || query.urgency === filter
    return matchesSearch && matchesFilter
  })

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'high': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
      default: return 'bg-muted/20 text-muted-foreground'
    }
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <MessageCircle size={24} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl text-foreground">All Service Queries</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {filteredQueries.length} queries available
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

                {/* Search and Filter */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by customer or service..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-primary/20 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['all', 'high', 'medium', 'low'].map((f) => (
                      <motion.button
                        key={f}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all ${
                          filter === f 
                            ? 'bg-primary/20 text-primary border border-primary/40' 
                            : 'bg-muted/10 text-muted-foreground border border-transparent hover:bg-muted/20'
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Queries List */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredQueries.map((query, index) => (
                    <motion.div
                      key={query.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card p-5 rounded-2xl border border-primary/30 hover:border-primary/50 transition-all group"
                      style={{
                        boxShadow: '0 0 15px rgba(88, 129, 87, 0.2), inset 0 0 10px rgba(88, 129, 87, 0.05)'
                      }}
                    >
                      {/* Customer Info */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative">
                          <img 
                            src={query.customerAvatar} 
                            alt={query.customerName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-foreground truncate">{query.customerName}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getUrgencyColor(query.urgency)}`}>
                              {query.urgency}
                            </span>
                          </div>
                          <p className="text-xs text-primary">{query.service}</p>
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {query.message}
                      </p>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-primary" />
                          {query.location.split(',')[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={12} className="text-primary" />
                          {query.budget}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-primary" />
                          {query.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-primary" />
                          {query.date}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-primary/10">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-all flex items-center justify-center gap-2 border border-primary/30 text-sm"
                        >
                          <CheckCircle2 size={16} />
                          Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-all flex items-center justify-center gap-2 border border-red-500/30 text-sm"
                        >
                          <XCircle size={16} />
                          Decline
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredQueries.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                      <Search size={32} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No queries found matching your search</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
