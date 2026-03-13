import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  X, 
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Eye,
  Star,
  Package,
  CheckCircle2,
  Save
} from "lucide-react"
import { servicesAPI } from "../services/services"

interface Service {
  id: string
  name: string
  price: string
  description: string
  status: 'active' | 'inactive'
  bookings: number
  views: number
  rating: number
}

interface ManageServicesModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ManageServicesModal: React.FC<ManageServicesModalProps> = ({
  isOpen,
  onClose
}) => {
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    if (!isOpen) return

    const loadServices = async () => {
      try {
        const response = await servicesAPI.getServices({ limit: 50 })
        const mapped = (response.services || []).map((service: any) => ({
          id: service._id,
          name: service.title,
          price: `₹${service.pricing}`,
          description: service.description,
          status: service.isActive ? 'active' : 'inactive',
          bookings: Number(service.reviews || 0),
          views: 0,
          rating: Number(service.rating || 0),
        }))
        setServices(mapped)
      } catch (error) {
        setServices([])
      }
    }

    loadServices()
  }, [isOpen])

  const [isAddingService, setIsAddingService] = useState(false)
  const [editingService, setEditingService] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    priceMin: '',
    priceMax: '',
    description: ''
  })

  const handleAddService = () => {
    if (formData.name && formData.priceMin && formData.priceMax && formData.description) {
      const newService: Service = {
        id: Date.now().toString(),
        name: formData.name,
        price: `₹${formData.priceMin}-${formData.priceMax}`,
        description: formData.description,
        status: 'active',
        bookings: 0,
        views: 0,
        rating: 0
      }
      setServices([...services, newService])
      setFormData({ name: '', priceMin: '', priceMax: '', description: '' })
      setIsAddingService(false)
    }
  }

  const handleUpdateService = (id: string) => {
    setServices(services.map(s => 
      s.id === id 
        ? { 
            ...s, 
            name: formData.name, 
            price: `₹${formData.priceMin}-${formData.priceMax}`,
            description: formData.description 
          } 
        : s
    ))
    setEditingService(null)
    setFormData({ name: '', priceMin: '', priceMax: '', description: '' })
  }

  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(s => s.id !== id))
    }
  }

  const handleToggleStatus = (id: string) => {
    setServices(services.map(s => 
      s.id === id 
        ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' } 
        : s
    ))
  }

  const startEdit = (service: Service) => {
    const [min, max] = service.price.replace('₹', '').split('-')
    setFormData({
      name: service.name,
      priceMin: min,
      priceMax: max,
      description: service.description
    })
    setEditingService(service.id)
  }

  const cancelEdit = () => {
    setEditingService(null)
    setIsAddingService(false)
    setFormData({ name: '', priceMin: '', priceMax: '', description: '' })
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
                      <Package size={24} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl text-foreground">Manage Services</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {services.length} active services
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isAddingService && !editingService && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsAddingService(true)}
                        className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-all flex items-center gap-2 border border-primary/30"
                      >
                        <Plus size={18} />
                        Add Service
                      </motion.button>
                    )}
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
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                {/* Add/Edit Form */}
                {(isAddingService || editingService) && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 rounded-2xl border border-primary/30 mb-6"
                    style={{
                      boxShadow: '0 0 20px rgba(88, 129, 87, 0.3), inset 0 0 15px rgba(88, 129, 87, 0.05)'
                    }}
                  >
                    <h3 className="text-lg text-foreground mb-4">
                      {isAddingService ? 'Add New Service' : 'Edit Service'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          Service Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., AC Repair & Maintenance"
                          className="w-full px-4 py-2 bg-muted/20 border border-primary/20 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-muted-foreground mb-2">
                            Minimum Price (₹)
                          </label>
                          <input
                            type="number"
                            value={formData.priceMin}
                            onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                            placeholder="500"
                            className="w-full px-4 py-2 bg-muted/20 border border-primary/20 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-muted-foreground mb-2">
                            Maximum Price (₹)
                          </label>
                          <input
                            type="number"
                            value={formData.priceMax}
                            onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                            placeholder="1500"
                            className="w-full px-4 py-2 bg-muted/20 border border-primary/20 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe your service in detail..."
                          rows={3}
                          className="w-full px-4 py-2 bg-muted/20 border border-primary/20 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => editingService ? handleUpdateService(editingService) : handleAddService()}
                          className="flex-1 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-all flex items-center justify-center gap-2 border border-primary/30"
                        >
                          <Save size={18} />
                          {editingService ? 'Update Service' : 'Add Service'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-muted/20 hover:bg-muted/30 text-muted-foreground rounded-xl transition-all"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Services List */}
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card p-5 rounded-2xl border border-primary/30 hover:border-primary/50 transition-all"
                      style={{
                        boxShadow: '0 0 15px rgba(88, 129, 87, 0.2), inset 0 0 10px rgba(88, 129, 87, 0.05)'
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg text-foreground">{service.name}</h4>
                            <button
                              onClick={() => handleToggleStatus(service.id)}
                              className={`px-2 py-1 rounded-full text-xs transition-all ${
                                service.status === 'active' 
                                  ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
                              }`}
                            >
                              {service.status}
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} className="text-primary" />
                              {service.price}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package size={14} className="text-primary" />
                              {service.bookings} bookings
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye size={14} className="text-primary" />
                              {service.views} views
                            </span>
                            {service.rating > 0 && (
                              <span className="flex items-center gap-1">
                                <Star size={14} className="fill-yellow-500 text-yellow-500" />
                                {service.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => startEdit(service)}
                            className="w-9 h-9 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg flex items-center justify-center transition-all"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteService(service.id)}
                            className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center transition-all"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {services.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                      <Package size={32} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">No services added yet</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsAddingService(true)}
                      className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-all flex items-center gap-2 border border-primary/30"
                    >
                      <Plus size={18} />
                      Add Your First Service
                    </motion.button>
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
