import React from "react"
import { motion } from "motion/react"
import { 
  Zap, 
  Car, 
  Wrench, 
  Laptop, 
  Truck, 
  ShirtIcon, 
  Bug, 
  Scissors, 
  Hammer, 
  Droplets, 
  Paintbrush, 
  Package, 
  Filter,
  TreePine,
  Sofa,
  Camera,
  Monitor
} from "lucide-react"
import { GlassCard } from "./ui/glass-card"

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  count?: number
  popular?: boolean
}

interface CategoryChipsProps {
  selectedCategories?: string[]
  onCategorySelect?: (categoryId: string) => void
  showCount?: boolean
}

const CategoryChips: React.FC<CategoryChipsProps> = ({ 
  selectedCategories = [], 
  onCategorySelect,
  showCount = false 
}) => {
  const categories: Category[] = [
    { id: "cleaning", name: "Cleaning", icon: <Droplets size={16} />, count: 245, popular: true },
    { id: "ac-repair", name: "AC Repair", icon: <Zap size={16} />, count: 189 },
    { id: "electrical", name: "Electrical", icon: <Zap size={16} />, count: 156 },
    { id: "electronics", name: "Electronics", icon: <Laptop size={16} />, count: 203 },
    { id: "auto", name: "Auto", icon: <Car size={16} />, count: 167, popular: true },
    { id: "towing", name: "Towing", icon: <Truck size={16} />, count: 89 },
    { id: "laundry", name: "Laundry", icon: <ShirtIcon size={16} />, count: 134 },
    { id: "pest-control", name: "Pest Control", icon: <Bug size={16} />, count: 76 },
    { id: "barber", name: "Barber", icon: <Scissors size={16} />, count: 198, popular: true },
    { id: "carpenter", name: "Carpenter", icon: <Hammer size={16} />, count: 145 },
    { id: "plumber", name: "Plumber", icon: <Wrench size={16} />, count: 223 },
    { id: "painting", name: "Painting", icon: <Paintbrush size={16} />, count: 112 },
    { id: "appliance", name: "Appliance Install", icon: <Package size={16} />, count: 98 },
    { id: "water-purifier", name: "RO/Water Purifier", icon: <Filter size={16} />, count: 87 },
    { id: "movers", name: "Movers", icon: <Truck size={16} />, count: 145 },
    { id: "gardening", name: "Gardening", icon: <TreePine size={16} />, count: 123 },
    { id: "sofa-cleaning", name: "Sofa Cleaning", icon: <Sofa size={16} />, count: 89 },
    { id: "cctv", name: "CCTV", icon: <Camera size={16} />, count: 67 },
    { id: "computer-repair", name: "Computer Repair", icon: <Monitor size={16} />, count: 178 }
  ]

  const isSelected = (categoryId: string) => selectedCategories.includes(categoryId)

  return (
    <div className="w-full">
      <motion.div 
        className="flex flex-wrap gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: index * 0.05,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
          >
            <motion.button
              onClick={() => onCategorySelect?.(category.id)}
              className={`relative group`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GlassCard
                className={`
                  px-4 py-3 transition-all duration-200 cursor-pointer border
                  ${isSelected(category.id)
                    ? "bg-primary/20 border-primary/40 text-primary shadow-lg shadow-primary/20"
                    : "hover:bg-white/20 border-white/20 hover:border-white/40"
                  }
                  ${category.popular ? "ring-2 ring-sage-100/50" : ""}
                `}
              >
                <div className="flex items-center space-x-2">
                  <div className={`
                    transition-colors duration-200
                    ${isSelected(category.id) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}
                  `}>
                    {category.icon}
                  </div>
                  <span className={`
                    text-sm font-medium transition-colors duration-200
                    ${isSelected(category.id) ? "text-primary" : "text-foreground"}
                  `}>
                    {category.name}
                  </span>
                  {showCount && category.count && (
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full transition-colors duration-200
                      ${isSelected(category.id) 
                        ? "bg-primary/20 text-primary" 
                        : "bg-muted text-muted-foreground"
                      }
                    `}>
                      {category.count}
                    </span>
                  )}
                </div>
                
                {category.popular && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                )}
              </GlassCard>
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export { CategoryChips }