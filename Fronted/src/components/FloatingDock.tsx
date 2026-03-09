import React from "react"
import { motion } from "motion/react"
import { Home, Search, Calendar, MessageCircle, User, Plus } from "lucide-react"
import { GlassCard } from "./ui/glass-card"
import { cn } from "./ui/utils"

interface DockItem {
  icon: React.ReactNode
  label: string
  href: string
  isActive?: boolean
  isPrimary?: boolean
}

interface FloatingDockProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const FloatingDock: React.FC<FloatingDockProps> = ({ activeTab = "home", onTabChange }) => {
  const dockItems: DockItem[] = [
    { icon: <Home size={20} />, label: "Home", href: "home" },
    { icon: <Search size={20} />, label: "Search", href: "search" },
    { icon: <Calendar size={20} />, label: "Bookings", href: "bookings" },
    { icon: <MessageCircle size={20} />, label: "Messages", href: "messages" },
    { icon: <User size={20} />, label: "Profile", href: "profile" },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
      <GlassCard className="px-2 py-3">
        <div className="flex items-center gap-1">
          {dockItems.map((item, index) => (
            <motion.button
              key={item.href}
              onClick={() => onTabChange?.(item.href)}
              className={cn(
                "relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200",
                activeTab === item.href
                  ? "text-primary bg-primary/10 shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/10"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: index * 0.1 }
              }}
            >
              {item.icon}
              {activeTab === item.href && (
                <motion.div
                  className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                  layoutId="dock-indicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
          
          {/* Primary Book Button */}
          <div className="ml-2 pl-2 border-l border-white/20">
            <motion.button
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary to-sage-700 text-primary-foreground rounded-2xl shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <Plus size={16} className="mr-1" />
              <span className="text-sm font-medium">Book</span>
            </motion.button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export { FloatingDock }