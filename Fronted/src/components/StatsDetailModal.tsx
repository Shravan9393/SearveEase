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
  TrendingUp,
  Package,
} from "lucide-react"
import type { Booking } from "../services/bookings"

type DetailModalType = "revenue" | "completed" | "bookings"

interface StatsDetailModalProps {
  isOpen: boolean
  onClose: () => void
  type: DetailModalType
  bookings: Booking[]
  currencySymbol?: string
  isUpdatingBooking?: boolean
  bookingActionId?: string | null
  onCompleteBooking?: (bookingId: string) => Promise<void> | void
}

const ACTIVE_BOOKING_STATUSES: Booking["status"][] = ["confirmed", "in-progress"]

const getCustomerName = (booking: Booking) =>
  typeof booking.customerProfileId === "string"
    ? "Customer"
    : booking.customerProfileId?.fullName || "Customer"

const getServiceName = (booking: Booking) =>
  typeof booking.serviceId === "string"
    ? "Service"
    : booking.serviceId?.title || "Service"

const getLocation = (booking: Booking) =>
  [
    booking.address?.addressLine1,
    booking.address?.addressLine2,
    booking.address?.landmark,
    booking.address?.city,
    booking.address?.state,
    booking.address?.pincode || booking.address?.zipCode,
  ]
    .filter(Boolean)
    .join(", ") || "Address not available"

const formatBookingDate = (booking: Booking) => {
  const date = new Date(booking.scheduled?.date)

  if (Number.isNaN(date.getTime())) {
    return "Date not available"
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const getPaymentLabel = (booking: Booking) => {
  if (booking.paymentType === "cod") {
    return booking.paymentStatus === "paid" ? "Cash received" : "Cash on Delivery"
  }

  if (booking.paymentStatus === "paid") {
    return "Paid online"
  }

  if (booking.paymentStatus === "failed") {
    return "Payment failed"
  }

  return "Online payment pending"
}

export const StatsDetailModal: React.FC<StatsDetailModalProps> = ({
  isOpen,
  onClose,
  type,
  bookings,
  currencySymbol = "₹",
  isUpdatingBooking = false,
  bookingActionId = null,
  onCompleteBooking,
}) => {
  const detailedData = React.useMemo(() => {
    switch (type) {
      case "revenue":
        return bookings.filter((booking) => booking.status === "completed")
      case "completed":
        return bookings.filter((booking) => booking.status === "completed")
      case "bookings":
        return bookings.filter((booking) => ACTIVE_BOOKING_STATUSES.includes(booking.status))
      default:
        return []
    }
  }, [bookings, type])

  const getTitle = () => {
    switch (type) {
      case "revenue":
        return "Total Revenue Breakdown"
      case "completed":
        return "Completed Services Details"
      case "bookings":
        return "Active Bookings Details"
      default:
        return ""
    }
  }

  const getIcon = () => {
    switch (type) {
      case "revenue":
        return DollarSign
      case "completed":
        return CheckCircle2
      case "bookings":
        return Calendar
      default:
        return Package
    }
  }

  const emptyMessage =
    type === "revenue"
      ? "No booking revenue details available yet."
      : type === "completed"
        ? "No completed bookings yet."
        : "No active bookings right now."

  const Icon = getIcon()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

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
                boxShadow: "0 0 40px rgba(88, 129, 87, 0.3), inset 0 0 30px rgba(88, 129, 87, 0.05)",
              }}
            >
              <div className="p-6 border-b border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon size={24} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl text-foreground">{getTitle()}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {detailedData.length} {type === "revenue" ? "transactions" : "bookings"}
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

              <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                <div className="space-y-4">
                  {detailedData.length === 0 && (
                    <div className="glass-card p-6 rounded-2xl border border-primary/20 text-sm text-muted-foreground">
                      {emptyMessage}
                    </div>
                  )}

                  {type === "revenue" &&
                    detailedData.map((booking, index) => (
                      <motion.div
                        key={booking._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card p-5 rounded-2xl border border-primary/30 hover:border-primary/50 transition-all"
                        style={{
                          boxShadow: "0 0 15px rgba(88, 129, 87, 0.2), inset 0 0 10px rgba(88, 129, 87, 0.05)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h4 className="text-foreground">{getServiceName(booking)}</h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  booking.paymentStatus === "paid"
                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                    : booking.paymentStatus === "failed"
                                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                      : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                }`}
                              >
                                {booking.paymentStatus}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                {getCustomerName(booking)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatBookingDate(booking)}
                              </span>
                              <span className="flex items-center gap-1 md:col-span-2">
                                <Package size={14} />
                                {getPaymentLabel(booking)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-2xl text-primary">
                              {currencySymbol}
                              {(booking.priceSnapshot?.totalAmount || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">{booking.status}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                  {type !== "revenue" &&
                    detailedData.map((booking, index) => {
                      const isCompleting = bookingActionId === booking._id && isUpdatingBooking
                      const canComplete =
                        type === "bookings" && ACTIVE_BOOKING_STATUSES.includes(booking.status)

                      return (
                        <motion.div
                          key={booking._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="glass-card p-5 rounded-2xl border border-primary/30 hover:border-primary/50 transition-all"
                          style={{
                            boxShadow: "0 0 15px rgba(88, 129, 87, 0.2), inset 0 0 10px rgba(88, 129, 87, 0.05)",
                          }}
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                  <h4 className="text-foreground">{getServiceName(booking)}</h4>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      booking.status === "completed"
                                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                        : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                    }`}
                                  >
                                    {booking.status}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User size={14} />
                                    {getCustomerName(booking)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {getLocation(booking)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {formatBookingDate(booking)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {booking.scheduled?.time || "Time not available"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-left md:text-right shrink-0">
                                <p className="text-lg text-primary">
                                  {currencySymbol}
                                  {(booking.priceSnapshot?.totalAmount || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  Payment: {booking.paymentStatus}
                                </p>
                              </div>
                            </div>

                            {canComplete && onCompleteBooking && (
                              <div className="pt-3 border-t border-primary/10 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => onCompleteBooking(booking._id)}
                                  disabled={isUpdatingBooking}
                                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 disabled:opacity-60 disabled:cursor-not-allowed text-primary rounded-xl transition-all text-sm"
                                >
                                  {isCompleting ? "Completing..." : "Complete Booking"}
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                </div>

                {type === "revenue" && detailedData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-5 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl border border-primary/30"
                    style={{
                      boxShadow: "0 0 20px rgba(88, 129, 87, 0.2)",
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp size={24} className="text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl text-primary">
                            {currencySymbol}
                            {detailedData
                              .reduce(
                                (sum, booking) => sum + (booking.priceSnapshot?.totalAmount || 0),
                                0
                              )
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-muted-foreground">
                          Paid: {detailedData.filter((booking) => booking.paymentStatus === "paid").length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Pending: {detailedData.filter((booking) => booking.paymentStatus === "pending").length}
                        </p>
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
