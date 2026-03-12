import React, { useEffect, useMemo, useState } from "react"
import { motion } from "motion/react"
import { Mail, Phone, MapPin, LogOut, Calendar, CheckCircle, Clock, AlertCircle, Sparkles, Star, Briefcase, Package } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { bookingsAPI, Booking } from "../../services/bookings"

interface ProfilePageProps {
  user: any
  onLogout: () => void
  isAuthenticated: boolean
  onAuthClick?: () => void
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, isAuthenticated, onAuthClick }) => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)

  useEffect(() => {
    const loadBookings = async () => {
      if (!isAuthenticated || !user) return

      setIsLoadingBookings(true)
      try {
        const response = await bookingsAPI.getBookings({ limit: 20 })
        setBookings(response.bookings || [])
      } catch (error) {
        console.error("Failed to load bookings", error)
      } finally {
        setIsLoadingBookings(false)
      }
    }

    loadBookings()
  }, [isAuthenticated, user])

  const completedCount = useMemo(
    () => bookings.filter((booking) => booking.status === "completed").length,
    [bookings]
  )

  const getStatusIcon = (status: Booking["status"]) => {
    if (status === "completed") return <CheckCircle size={14} className="text-green-500" />
    if (status === "confirmed" || status === "in-progress") return <Clock size={14} className="text-blue-500" />
    if (status === "pending") return <AlertCircle size={14} className="text-yellow-500" />
    return <AlertCircle size={14} className="text-red-500" />
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
          <Card className="glass rounded-3xl p-8 text-center max-w-md">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-sage-700 rounded-3xl flex items-center justify-center">
                  <Sparkles size={32} className="text-primary-foreground" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Your Profile</h2>
                <p className="text-muted-foreground">Sign in to access your live profile and bookings.</p>
              </div>
              <Button onClick={onAuthClick} className="w-full h-12 rounded-2xl">Sign In or Create Account</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="glass rounded-3xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 rounded-3xl">
                <AvatarImage src={user.profileImage} alt={user.fullName} />
                <AvatarFallback className="rounded-3xl text-xl">{user.fullName?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{user.displayName || user.fullName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={user.role === "provider" ? "default" : "secondary"}>{user.role === "provider" ? "Service Provider" : "Customer"}</Badge>
                  {user.verified && <Badge variant="outline">Verified</Badge>}
                </div>
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  <p className="flex items-center gap-2"><Mail size={14} /> {user.email}</p>
                  {!!user.phone && <p className="flex items-center gap-2"><Phone size={14} /> {user.phone}</p>}
                  {(user.location?.city || user.location?.state) && (
                    <p className="flex items-center gap-2"><MapPin size={14} /> {[user.location?.city, user.location?.state].filter(Boolean).join(", ")}</p>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} className="rounded-2xl w-fit"><LogOut size={16} className="mr-2" />Logout</Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass rounded-2xl"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Bookings</p><p className="text-2xl font-bold">{bookings.length}</p></CardContent></Card>
          <Card className="glass rounded-2xl"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold">{completedCount}</p></CardContent></Card>
          <Card className="glass rounded-2xl"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Rating</p><p className="text-2xl font-bold flex items-center gap-1">{Number(user.rating || 0).toFixed(1)} <Star className="w-4 h-4 text-yellow-500 fill-current" /></p></CardContent></Card>
        </div>

        <Tabs defaultValue="bookings">
          <TabsList>
            <TabsTrigger value="bookings"><Package size={14} className="mr-1" />Bookings</TabsTrigger>
            {user.role === "provider" && <TabsTrigger value="provider"><Briefcase size={14} className="mr-1" />Provider Details</TabsTrigger>}
          </TabsList>

          <TabsContent value="bookings" className="space-y-3 pt-3">
            {isLoadingBookings && <p className="text-muted-foreground">Loading bookings...</p>}
            {!isLoadingBookings && bookings.length === 0 && <p className="text-muted-foreground">No bookings yet.</p>}
            {bookings.map((booking) => (
              <Card key={booking._id} className="glass rounded-2xl">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-medium">{(booking as any).serviceId?.title || "Service"}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Calendar size={12} /> {new Date(booking.scheduled.date).toLocaleDateString()} • {booking.scheduled.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize flex items-center gap-1">{getStatusIcon(booking.status)} {booking.status}</Badge>
                    <p className="font-semibold">₹{booking.priceSnapshot.totalAmount}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {user.role === "provider" && (
            <TabsContent value="provider" className="space-y-3 pt-3">
              <Card className="glass rounded-2xl"><CardContent className="p-4 space-y-2">
                <p><span className="font-medium">Business:</span> {user.businessName || "Not added"}</p>
                <p><span className="font-medium">Display Name:</span> {user.displayName || user.fullName}</p>
                <p><span className="font-medium">Description:</span> {user.description || "Not added"}</p>
                <p><span className="font-medium">Reviews:</span> {user.reviewCount || 0}</p>
              </CardContent></Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

export { ProfilePage }
