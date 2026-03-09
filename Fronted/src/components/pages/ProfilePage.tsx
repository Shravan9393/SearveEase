import React, { useState, useCallback } from "react"
import { motion } from "motion/react"
import { User, Package, Star, MapPin, Phone, Mail, Edit, Camera, Settings, LogOut, Calendar, TrendingUp, Clock, CheckCircle, AlertCircle, Truck, Briefcase, Sparkles } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Calendar as CalendarComponent } from "../ui/calendar"
import { ImageWithFallback } from "../figma/ImageWithFallback"

interface ProfilePageProps {
  user: any
  onLogout: () => void
  isAuthenticated: boolean
  onAuthClick?: () => void
}

interface Order {
  id: string
  serviceName: string
  provider: string
  date: Date
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  amount: number
  address: string
}

interface ServiceBooking {
  id: string
  customerName: string
  serviceName: string
  date: Date
  time: string
  status: 'upcoming' | 'completed' | 'cancelled'
  amount: number
  address: string
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, isAuthenticated, onAuthClick }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState("overview")

  // Mock orders data for customers
  const mockOrders: Order[] = [
    {
      id: '1',
      serviceName: 'House Cleaning',
      provider: 'CleanCo Services',
      date: new Date(2024, 11, 28),
      status: 'completed',
      amount: 1500,
      address: 'MG Road, Bangalore'
    },
    {
      id: '2',
      serviceName: 'AC Repair',
      provider: 'CoolTech Solutions',
      date: new Date(2024, 11, 30),
      status: 'in-progress',
      amount: 800,
      address: 'Koramangala, Bangalore'
    },
    {
      id: '3',
      serviceName: 'Plumbing Service',
      provider: 'FixIt Fast',
      date: new Date(2025, 0, 5),
      status: 'pending',
      amount: 1200,
      address: 'Indiranagar, Bangalore'
    }
  ]

  // Mock bookings data for service providers
  const mockBookings: ServiceBooking[] = [
    {
      id: '1',
      customerName: 'Rahul Sharma',
      serviceName: 'Electrical Repair',
      date: new Date(2024, 11, 29),
      time: '10:00 AM',
      status: 'upcoming',
      amount: 1500,
      address: 'HSR Layout, Bangalore'
    },
    {
      id: '2',
      customerName: 'Priya Patel',
      serviceName: 'Home Painting',
      date: new Date(2024, 11, 31),
      time: '2:00 PM',
      status: 'upcoming',
      amount: 5000,
      address: 'Whitefield, Bangalore'
    },
    {
      id: '3',
      customerName: 'Amit Kumar',
      serviceName: 'Appliance Installation',
      date: new Date(2024, 11, 25),
      time: '11:00 AM',
      status: 'completed',
      amount: 800,
      address: 'Electronic City, Bangalore'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': case 'upcoming': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />
      case 'in-progress': return <Clock size={16} />
      case 'upcoming': return <Calendar size={16} />
      case 'pending': return <AlertCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  const handleTrackOrder = useCallback(() => {
    // Mock tracking functionality
    alert('Order tracking feature coming soon! You will be able to track your service provider in real-time.')
  }, [])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Card className="glass rounded-3xl p-8 text-center max-w-md">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-sage-700 rounded-3xl flex items-center justify-center">
                  <Sparkles size={32} className="text-primary-foreground" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Your Profile</h2>
                <p className="text-muted-foreground">
                  Sign in to access your profile, orders, and personalized dashboard.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={onAuthClick}
                  className="w-full h-12 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Sign In or Create Account
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Join thousands of users who trust ServeEase for their local service needs
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24 rounded-3xl ring-4 ring-primary/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-primary to-sage-700 text-primary-foreground rounded-3xl">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 bg-primary hover:bg-sage-700"
              >
                <Camera size={16} />
              </Button>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground text-lg flex items-center gap-2">
                <Badge variant={user.isProvider ? "default" : "secondary"} className="rounded-full">
                  {user.isProvider ? 'Service Provider' : 'Customer'}
                </Badge>
                {user.isProvider && user.verified && (
                  <Badge variant="outline" className="rounded-full text-green-600 border-green-600">
                    ✓ Verified
                  </Badge>
                )}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} />
                    {user.phone}
                  </span>
                )}
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {user.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!user.isProvider && (
              <Button
                onClick={handleTrackOrder}
                className="bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary h-12 px-6 rounded-2xl shadow-lg flex items-center gap-2"
              >
                <Truck size={20} />
                Track Orders
              </Button>
            )}
            
            <Button variant="outline" className="rounded-2xl glass h-12 px-4">
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            
            <Button variant="outline" className="rounded-2xl glass h-12 px-4">
              <Settings size={16} />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="rounded-2xl glass h-12 px-4 text-destructive hover:text-destructive"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {user.isProvider ? (
            <>
              <Card className="glass rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold">{user.completedJobs || 47}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Rating</p>
                      <p className="text-2xl font-bold flex items-center gap-1">
                        {user.rating || 4.8}
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold">₹15,420</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="glass rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{mockOrders.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                      <p className="text-2xl font-bold">
                        {mockOrders.filter(order => order.status === 'in-progress' || order.status === 'pending').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">
                        {mockOrders.filter(order => order.status === 'completed').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold">
                        ₹{mockOrders.reduce((total, order) => total + order.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 glass rounded-2xl p-1">
              <TabsTrigger value="overview" className="rounded-xl">
                Overview
              </TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-xl">
                Calendar
              </TabsTrigger>
              <TabsTrigger value={user.isProvider ? "bookings" : "orders"} className="rounded-xl">
                {user.isProvider ? 'Bookings' : 'Orders'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="glass rounded-3xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock size={20} />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(user.isProvider ? mockBookings : mockOrders).slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                          <div>
                            <p className="font-medium">
                              {user.isProvider ? (item as ServiceBooking).customerName : (item as Order).serviceName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.date.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="rounded-full capitalize">
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Service Details (for providers) */}
                {user.isProvider && (
                  <Card className="glass rounded-3xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase size={20} />
                        Service Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-medium">{user.businessName}</p>
                        <p className="text-sm text-muted-foreground">{user.serviceCategory}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Experience</p>
                        <p className="text-sm text-muted-foreground">{user.experience}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-muted-foreground">{user.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass rounded-3xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar size={20} />
                      Calendar View
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-2xl"
                    />
                  </CardContent>
                </Card>

                <Card className="glass rounded-3xl">
                  <CardHeader>
                    <CardTitle>
                      {selectedDate.toDateString()} Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(user.isProvider ? mockBookings : mockOrders)
                        .filter(item => 
                          item.date.toDateString() === selectedDate.toDateString()
                        )
                        .map((item) => (
                          <div key={item.id} className="p-4 bg-muted/20 rounded-2xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  {user.isProvider 
                                    ? (item as ServiceBooking).customerName 
                                    : (item as Order).serviceName
                                  }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {user.isProvider 
                                    ? (item as ServiceBooking).time 
                                    : (item as Order).provider
                                  }
                                </p>
                              </div>
                              <Badge variant="outline" className="rounded-full">
                                ₹{item.amount}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      
                      {(user.isProvider ? mockBookings : mockOrders)
                        .filter(item => 
                          item.date.toDateString() === selectedDate.toDateString()
                        ).length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          No {user.isProvider ? 'bookings' : 'orders'} for this date
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value={user.isProvider ? "bookings" : "orders"} className="space-y-6">
              <Card className="glass rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package size={20} />
                    {user.isProvider ? 'All Bookings' : 'Order History'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(user.isProvider ? mockBookings : mockOrders).map((item) => (
                      <div key={item.id} className="p-6 bg-muted/20 rounded-2xl hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10">
                              {getStatusIcon(item.status)}
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {user.isProvider 
                                  ? (item as ServiceBooking).serviceName 
                                  : (item as Order).serviceName
                                }
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {user.isProvider 
                                  ? `Customer: ${(item as ServiceBooking).customerName}` 
                                  : `Provider: ${(item as Order).provider}`
                                }
                              </p>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                                <span>{item.date.toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{item.address}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">₹{item.amount}</p>
                            <Badge 
                              variant="outline" 
                              className={`rounded-full capitalize ${getStatusColor(item.status)} text-white border-none`}
                            >
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export { ProfilePage }