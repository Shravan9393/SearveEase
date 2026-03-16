import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  TrendingUp, 
  Eye, 
  CheckCircle2, 
  DollarSign, 
  Star, 
  Clock,
  MapPin,
  Users,
  ArrowUp,
  ArrowDown,
  Activity,
  BarChart3,
  Package,
  Bell,
  Award,
  Target,
  Zap,
  Calendar
} from "lucide-react"
import { NotificationSidebar } from "./NotificationSidebar"
import { StatsDetailModal } from "./StatsDetailModal"
import { QueryDetailsModal } from "./QueryDetailsModal"
import { ViewAllQueriesModal } from "./ViewAllQueriesModal"
import { CustomerReviewsModal } from "./CustomerReviewsModal"
import { ManageServicesModal } from "./ManageServicesModal"
import { ServiceManagementModal } from "./ServiceManagementModal"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { providerAPI, ProviderDashboardData } from "../services/provider"

interface ProviderHomePageProps {
  user: any
}

export const ProviderHomePage: React.FC<ProviderHomePageProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [showAllListings, setShowAllListings] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<any>(null)
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false)
  const [detailModalType, setDetailModalType] = useState<'revenue' | 'completed' | 'bookings' | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isQueriesModalOpen, setIsQueriesModalOpen] = useState(false)
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false)
  const [isManageServicesModalOpen, setIsManageServicesModalOpen] = useState(false)
  const [isServiceManagementModalOpen, setIsServiceManagementModalOpen] = useState(false)
  const [serviceManagementMode, setServiceManagementMode] = useState<'add' | 'select-edit'>('add')

  const [dashboardData, setDashboardData] = useState<ProviderDashboardData | null>(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoadingDashboard(true)
        const data = await providerAPI.getProviderDashboard()
        setDashboardData(data)

        const pendingNotifications = data.activityData
          .map((entry, index) => ({
            id: `${index + 1}`,
            customerName: "New Customer",
            customerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            service: data.provider.category || "Service Request",
            location: user.location?.city ? `${user.location.city}, ${user.location?.state || ""}` : "Your service area",
            budget: "Check booking details",
            time: `${entry.day}`,
            message: `You received ${entry.queries} new queries`,
            status: 'pending' as const
          }))
          .filter((entry) => Number(entry.message.match(/\d+/)?.[0] || 0) > 0)

        setNotifications(pendingNotifications)
      } catch (error) {
        console.error("Failed to load provider dashboard", error)
      } finally {
        setIsLoadingDashboard(false)
      }
    }

    loadDashboard()
  }, [user.location?.city, user.location?.state])

  const handleAcceptNotification = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, status: 'accepted' as const } : n
    ))
  }

  const handleDenyNotification = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, status: 'denied' as const } : n
    ))
  }

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleViewQuery = (query: any) => {
    setSelectedQuery(query)
    setIsQueryModalOpen(true)
  }

  const stats = dashboardData?.stats || {
    totalRevenue: 0,
    revenueGrowth: 0,
    profileViews: 0,
    viewsGrowth: 0,
    completedServices: 0,
    servicesGrowth: 0,
    activeBookings: 0,
    pendingBookings: 0,
    rating: 0,
    responseRate: 0,
    completionRate: 0,
  }

  const revenueData = dashboardData?.revenueData || []
  const activityData = dashboardData?.activityData || []
  const listings = dashboardData?.services || []
  const competitorData = dashboardData?.priceComparison || []

  const handleServiceAdded = (newService: ProviderDashboardData["services"][number]) => {
    setDashboardData((prev) =>
      prev
        ? {
            ...prev,
            services: [newService, ...prev.services],
          }
        : prev
    )
  }

  const handleServiceUpdated = (updatedService: ProviderDashboardData["services"][number]) => {
    setDashboardData((prev) =>
      prev
        ? {
            ...prev,
            services: prev.services.map((service) =>
              service.id === updatedService.id
                ? {
                    ...service,
                    ...updatedService,
                    bookings: service.bookings,
                    revenue: service.revenue,
                    views: service.views,
                    rating: service.rating,
                  }
                : service
            ),
          }
        : prev
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-32 px-4 md:px-8">
      {/* Notification Sidebar */}
      <NotificationSidebar 
        notifications={notifications}
        onAccept={handleAcceptNotification}
        onDeny={handleDenyNotification}
        onDismiss={handleDismissNotification}
        onCollapseChange={setIsSidebarCollapsed}
      />

      <motion.div 
        animate={{ marginRight: isSidebarCollapsed ? 0 : 384 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {isLoadingDashboard && (
          <div className="text-sm text-muted-foreground">Loading dashboard data...</div>
        )}

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl border border-primary/30"
          style={{
            boxShadow: '0 0 20px rgba(88, 129, 87, 0.3), inset 0 0 15px rgba(88, 129, 87, 0.05)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Profile Picture */}
              <div className="relative">
                <img 
                  src={dashboardData?.provider?.profileImage || user.profilePhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"} 
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/50"
                  style={{
                    boxShadow: '0 0 15px rgba(88, 129, 87, 0.4)'
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>
              <div>
                <h1 className="text-2xl text-foreground mb-1">
                  Welcome back, {dashboardData?.provider?.displayName || user.name}! 👋
                </h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your services today
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-lg text-foreground">{stats.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">Your Rating</p>
              </div>
              {user.verified && (
                <div className="px-3 py-2 bg-primary/10 rounded-xl border border-primary/20">
                  <Award size={20} className="text-primary" />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setDetailModalType('revenue')}
            className="glass-card p-5 rounded-2xl border border-primary/30 relative overflow-hidden group cursor-pointer"
            style={{
              boxShadow: '0 0 20px rgba(88, 129, 87, 0.3), inset 0 0 15px rgba(88, 129, 87, 0.05)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <DollarSign size={20} className="text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  stats.revenueGrowth > 0 
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}>
                  {stats.revenueGrowth > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {Math.abs(stats.revenueGrowth)}%
                </div>
              </div>
              <p className="text-2xl text-foreground mb-1">₹{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </motion.div>

          {/* Profile Views */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-5 rounded-2xl border border-primary/30 relative overflow-hidden group cursor-pointer"
            style={{
              boxShadow: '0 0 20px rgba(88, 129, 87, 0.3), inset 0 0 15px rgba(88, 129, 87, 0.05)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sage-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-sage-500/10 rounded-xl flex items-center justify-center">
                  <Eye size={20} className="text-sage-600 dark:text-sage-400" />
                </div>
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  stats.viewsGrowth > 0 
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}>
                  {stats.viewsGrowth > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {Math.abs(stats.viewsGrowth)}%
                </div>
              </div>
              <p className="text-2xl text-foreground mb-1">{stats.profileViews.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Profile Views</p>
            </div>
          </motion.div>

          {/* Completed Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setDetailModalType('completed')}
            className="glass-card p-5 rounded-2xl border border-primary/30 relative overflow-hidden group cursor-pointer"
            style={{
              boxShadow: '0 0 20px rgba(88, 129, 87, 0.3), inset 0 0 15px rgba(88, 129, 87, 0.05)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  stats.servicesGrowth > 0 
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}>
                  {stats.servicesGrowth > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {Math.abs(stats.servicesGrowth)}%
                </div>
              </div>
              <p className="text-2xl text-foreground mb-1">{stats.completedServices}</p>
              <p className="text-xs text-muted-foreground">Services Completed</p>
            </div>
          </motion.div>

          {/* Active Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setDetailModalType('bookings')}
            className="glass-card p-5 rounded-2xl border border-primary/30 relative overflow-hidden group cursor-pointer"
            style={{
              boxShadow: '0 0 20px rgba(88, 129, 87, 0.3), inset 0 0 15px rgba(88, 129, 87, 0.05)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <Calendar size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div className="px-2 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                  Active
                </div>
              </div>
              <p className="text-2xl text-foreground mb-1">{stats.activeBookings}</p>
              <p className="text-xs text-muted-foreground">Active Bookings</p>
              <p className="text-[10px] text-orange-500 mt-1">Pending: {stats.pendingBookings}</p>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 rounded-2xl border border-primary/30"
            style={{
              boxShadow: '0 0 20px rgba(88, 129, 87, 0.3), inset 0 0 15px rgba(88, 129, 87, 0.05)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg text-foreground mb-1">Revenue Overview</h3>
                <p className="text-xs text-muted-foreground">Last 6 months performance</p>
              </div>
              <TrendingUp size={20} className="text-primary" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#588157" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#588157" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(163, 177, 138, 0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(163, 177, 138, 0.5)" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(163, 177, 138, 0.5)" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(218, 215, 205, 0.9)',
                    border: '1px solid rgba(163, 177, 138, 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#588157" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6 rounded-2xl border border-primary/30"
            style={{
              boxShadow: '0 0 20px rgba(88, 129, 87, 0.3), inset 0 0 15px rgba(88, 129, 87, 0.05)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg text-foreground mb-1">Weekly Activity</h3>
                <p className="text-xs text-muted-foreground">Queries vs Bookings</p>
              </div>
              <Activity size={20} className="text-sage-600 dark:text-sage-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(163, 177, 138, 0.1)" />
                <XAxis 
                  dataKey="day" 
                  stroke="rgba(163, 177, 138, 0.5)" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(163, 177, 138, 0.5)" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(218, 215, 205, 0.9)',
                    border: '1px solid rgba(163, 177, 138, 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar dataKey="queries" fill="#A3B18A" radius={[8, 8, 0, 0]} />
                <Bar dataKey="bookings" fill="#588157" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6 rounded-2xl border border-primary/30"
          style={{
            boxShadow: '0 0 20px rgba(88, 129, 87, 0.3), inset 0 0 15px rgba(88, 129, 87, 0.05)'
          }}
        >
          <h3 className="text-lg text-foreground mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Zap size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl text-foreground">{stats.responseRate}%</p>
                <p className="text-xs text-muted-foreground">Response Rate</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-500/5 to-transparent rounded-xl">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Target size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl text-foreground">{stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500/5 to-transparent rounded-xl">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <Star size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl text-foreground">{stats.rating}</p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Listings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-6 rounded-2xl border border-primary/30"
          style={{
            boxShadow: '0 0 20px rgba(88, 129, 87, 0.3), inset 0 0 15px rgba(88, 129, 87, 0.05)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg text-foreground mb-1">Your Service Listings</h3>
              <p className="text-xs text-muted-foreground">Manage and track your services</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setServiceManagementMode('add'); setIsServiceManagementModalOpen(true) }}
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all text-sm"
              >
                Add New Service
              </button>
              <button
                onClick={() => { setServiceManagementMode('select-edit'); setIsServiceManagementModalOpen(true) }}
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all text-sm"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {listings.slice(0, showAllListings ? listings.length : 3).map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="p-4 bg-gradient-to-r from-sage-100/50 to-transparent dark:from-sage-900/20 rounded-xl border border-sage-200/20 dark:border-sage-700/30 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-foreground">{listing.service}</h4>
                      <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded-full">
                        {listing.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} />
                        {listing.price}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={14} />
                        {listing.bookings} bookings
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {listing.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-500 text-yellow-500" />
                        {listing.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-primary">{listing.revenue}</p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {listings.length > 3 && (
            <button
              onClick={() => setShowAllListings(!showAllListings)}
              className="mt-4 w-full py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              {showAllListings ? 'Show Less' : `Show All (${listings.length})`}
            </button>
          )}
        </motion.div>

        {/* Competitor Pricing Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="glass-card p-6 rounded-2xl border border-primary/30"
          style={{
            boxShadow: '0 0 20px rgba(88, 129, 87, 0.3), inset 0 0 15px rgba(88, 129, 87, 0.05)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg text-foreground mb-1">Market Pricing Insights</h3>
              <p className="text-xs text-muted-foreground">Compare your pricing with competitors</p>
            </div>
            <BarChart3 size={20} className="text-sage-600 dark:text-sage-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sage-200/20 dark:border-sage-700/30">
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Your Price</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Avg Market</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Lowest</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Highest</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Position</th>
                </tr>
              </thead>
              <tbody>
                {competitorData.map((data, index) => (
                  <tr key={index} className="border-b border-sage-200/10 dark:border-sage-700/20 hover:bg-sage-100/30 dark:hover:bg-sage-900/20 transition-colors">
                    <td className="py-4 px-4 text-sm text-foreground">{data.category}</td>
                    <td className="py-4 px-4 text-sm text-primary">{data.yourPrice}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{data.avgMarketPrice}</td>
                    <td className="py-4 px-4 text-sm text-green-600 dark:text-green-400">{data.lowestPrice}</td>
                    <td className="py-4 px-4 text-sm text-red-600 dark:text-red-400">{data.highestPrice}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {data.marketPosition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Activity size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-foreground mb-1">Pricing Recommendation</p>
                <p className="text-xs text-muted-foreground">
                  Your pricing is competitive and well-positioned in the market. Consider offering promotional packages during off-peak hours to increase bookings by up to 20%.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <button 
            onClick={() => setIsQueriesModalOpen(true)}
            className="glass-card p-6 rounded-2xl border border-primary/30 hover:border-primary/50 transition-all text-left group"
            style={{
              boxShadow: '0 0 15px rgba(88, 129, 87, 0.2), inset 0 0 10px rgba(88, 129, 87, 0.05)'
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bell size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-foreground mb-1">View All Queries</p>
                <p className="text-xs text-muted-foreground">{notifications.filter(n => !n.status || n.status === 'pending').length} new requests</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setIsReviewsModalOpen(true)}
            className="glass-card p-6 rounded-2xl border border-primary/30 hover:border-primary/50 transition-all text-left group"
            style={{
              boxShadow: '0 0 15px rgba(88, 129, 87, 0.2), inset 0 0 10px rgba(88, 129, 87, 0.05)'
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sage-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={24} className="text-sage-600 dark:text-sage-400" />
              </div>
              <div>
                <p className="text-foreground mb-1">Customer Reviews</p>
                <p className="text-xs text-muted-foreground">Manage your reputation</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setIsManageServicesModalOpen(true)}
            className="glass-card p-6 rounded-2xl border border-primary/30 hover:border-primary/50 transition-all text-left group"
            style={{
              boxShadow: '0 0 15px rgba(88, 129, 87, 0.2), inset 0 0 10px rgba(88, 129, 87, 0.05)'
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-foreground mb-1">Manage Services</p>
                <p className="text-xs text-muted-foreground">Edit your listings</p>
              </div>
            </div>
          </button>
        </motion.div>
      </motion.div>

      {/* Query Details Modal */}
      <AnimatePresence>
        {isQueryModalOpen && (
          <QueryDetailsModal
            isOpen={isQueryModalOpen}
            onClose={() => setIsQueryModalOpen(false)}
            query={selectedQuery}
          />
        )}
      </AnimatePresence>

      {/* Stats Detail Modal */}
      <AnimatePresence>
        {detailModalType && (
          <StatsDetailModal
            isOpen={!!detailModalType}
            onClose={() => setDetailModalType(null)}
            type={detailModalType}
          />
        )}
      </AnimatePresence>

      {/* View All Queries Modal */}
      <AnimatePresence>
        {isQueriesModalOpen && (
          <ViewAllQueriesModal
            isOpen={isQueriesModalOpen}
            onClose={() => setIsQueriesModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Customer Reviews Modal */}
      <AnimatePresence>
        {isReviewsModalOpen && (
          <CustomerReviewsModal
            isOpen={isReviewsModalOpen}
            onClose={() => setIsReviewsModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Manage Services Modal */}
      <AnimatePresence>
        {isManageServicesModalOpen && (
          <ManageServicesModal
            isOpen={isManageServicesModalOpen}
            onClose={() => setIsManageServicesModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <ServiceManagementModal
        isOpen={isServiceManagementModalOpen}
        initialMode={serviceManagementMode}
        onClose={() => setIsServiceManagementModalOpen(false)}
        onServiceAdded={handleServiceAdded}
        onServiceUpdated={handleServiceUpdated}
      />
    </div>
  )
}
