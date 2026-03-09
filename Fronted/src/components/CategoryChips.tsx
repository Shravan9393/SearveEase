import React from "react"
import { motion } from "motion/react"
import {
  Droplets,
  Zap,
  Laptop,
  Car,
  Truck,
  ShirtIcon,
  Bug,
  Scissors,
  Hammer,
  Wrench,
  Paintbrush,
  Package,
  Filter,
  TreePine,
  Sofa,
  Camera,
  Monitor,
} from "lucide-react"
import { GlassCard } from "./ui/glass-card"

interface Category {
  id: string
  name: string
  icon: React.ReactNode
}

interface CategoryChipsProps {
  categories: { _id: string; name: string }[]
  selectedCategories?: string[]
  onCategorySelect?: (categoryId: string) => void
}

const iconByName: Record<string, React.ReactNode> = {
  cleaning: <Droplets size={16} />,
  "ac repair": <Zap size={16} />,
  electrical: <Zap size={16} />,
  electronics: <Laptop size={16} />,
  auto: <Car size={16} />,
  towing: <Truck size={16} />,
  laundry: <ShirtIcon size={16} />,
  "pest control": <Bug size={16} />,
  barber: <Scissors size={16} />,
  carpenter: <Hammer size={16} />,
  plumber: <Wrench size={16} />,
  painting: <Paintbrush size={16} />,
  appliance: <Package size={16} />,
  "water purifier": <Filter size={16} />,
  movers: <Truck size={16} />,
  gardening: <TreePine size={16} />,
  sofa: <Sofa size={16} />,
  cctv: <Camera size={16} />,
  computer: <Monitor size={16} />,
}

const CategoryChips: React.FC<CategoryChipsProps> = ({ categories, selectedCategories = [], onCategorySelect }) => {
  const uiCategories: Category[] = categories.map((category) => {
    const key = category.name.toLowerCase()
    const matchedIcon = Object.keys(iconByName).find((k) => key.includes(k))
    return {
      id: category._id,
      name: category.name,
      icon: matchedIcon ? iconByName[matchedIcon] : <Package size={16} />,
    }
  })

  const isSelected = (categoryId: string) => selectedCategories.includes(categoryId)

  return (
    <div className="w-full">
      <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.05 }}>
        {uiCategories.map((category, index) => (
          <motion.div key={category.id} initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}>
            <motion.button onClick={() => onCategorySelect?.(category.id)} className="relative group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <GlassCard className={`px-4 py-3 transition-all duration-200 cursor-pointer border ${isSelected(category.id) ? "bg-primary/20 border-primary/40 text-primary shadow-lg shadow-primary/20" : "hover:bg-white/20 border-white/20 hover:border-white/40"}`}>
                <div className="flex items-center space-x-2">
                  <div className={`${isSelected(category.id) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                    {category.icon}
                  </div>
                  <span className={`text-sm font-medium ${isSelected(category.id) ? "text-primary" : "text-foreground"}`}>{category.name}</span>
                </div>
              </GlassCard>
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export { CategoryChips }
