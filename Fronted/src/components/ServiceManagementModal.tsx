import React, { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { X } from "lucide-react"
import { servicesAPI, Service } from "../services/services"
import { categoriesAPI, Category } from "../services/categories"

type Mode = 'idle' | 'add' | 'select-edit' | 'edit'

interface DashboardListing {
  id: string
  service: string
  price: string
  bookings: number
  revenue: string
  status: string
  views: number
  rating: number
  categoryName: string
  pricing: number
}

interface ServiceManagementModalProps {
  isOpen: boolean
  initialMode?: Mode
  onClose: () => void
  onServiceAdded: (service: DashboardListing) => void
  onServiceUpdated: (service: DashboardListing) => void
}

interface AddFormData {
  title: string
  categoryId: string
  description: string
  pricing: string
  locationPolicy: string
  image?: File
}

interface EditFormData {
  serviceId: string
  description: string
  pricing: string
  image?: File
}

const currency = "₹"

const toDashboardListing = (service: Service): DashboardListing => ({
  id: service._id,
  service: service.title,
  price: `${currency}${service.pricing}`,
  bookings: 0,
  revenue: `${currency}0`,
  status: service.availability === 'unavailable' ? 'inactive' : 'active',
  views: service.reviews || 0,
  rating: service.rating || 0,
  categoryName: service.categoryName,
  pricing: service.pricing,
})

export const ServiceManagementModal: React.FC<ServiceManagementModalProps> = ({
  isOpen,
  initialMode = 'idle',
  onClose,
  onServiceAdded,
  onServiceUpdated,
}) => {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)

  const [addForm, setAddForm] = useState<AddFormData>({
    title: '',
    categoryId: '',
    description: '',
    pricing: '',
    locationPolicy: '',
  })

  const [editForm, setEditForm] = useState<EditFormData>({
    serviceId: '',
    description: '',
    pricing: '',
  })

  const selectedService = useMemo(
    () => services.find((service) => service._id === editForm.serviceId),
    [services, editForm.serviceId]
  )


  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
    }
  }, [isOpen, initialMode])
  useEffect(() => {
    if (!isOpen) return

    const loadData = async () => {
      try {
        setError(null)
        const [servicesData, categoriesData] = await Promise.all([
          servicesAPI.getMyServices(),
          categoriesAPI.getCategories(),
        ])
        setServices(servicesData.services || [])
        setCategories(categoriesData.categories || [])
      } catch (loadError) {
        console.error(loadError)
        setError('Failed to load services data')
      }
    }

    loadData()
  }, [isOpen])

  const resetAndClose = () => {
    setMode('idle')
    setIsSubmitting(false)
    setError(null)
    setAddForm({ title: '', categoryId: '', description: '', pricing: '', locationPolicy: '' })
    setEditForm({ serviceId: '', description: '', pricing: '' })
    onClose()
  }

  const handleAddSubmit = async () => {
    if (!addForm.title || !addForm.categoryId || !addForm.description || !addForm.pricing || !addForm.locationPolicy) {
      setError('Please fill all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const result = await servicesAPI.createService({
        title: addForm.title,
        categoryId: addForm.categoryId,
        description: addForm.description,
        pricing: Number(addForm.pricing),
        locationPolicy: addForm.locationPolicy,
        images: addForm.image,
      })

      const createdService = result.service as Service
      onServiceAdded(toDashboardListing(createdService))
      setServices((prev) => [createdService, ...prev])
      resetAndClose()
    } catch (submitError) {
      console.error(submitError)
      setError('Unable to create service. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectService = (serviceId: string) => {
    const service = services.find((item) => item._id === serviceId)
    if (!service) return

    setEditForm({
      serviceId,
      description: service.description,
      pricing: String(service.pricing),
    })
    setMode('edit')
  }

  const handleEditSubmit = async () => {
    if (!editForm.serviceId || !editForm.description || !editForm.pricing) {
      setError('Please fill all required fields for editing')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const result = await servicesAPI.updateService(editForm.serviceId, {
        description: editForm.description,
        pricing: Number(editForm.pricing),
        images: editForm.image,
      })

      const updatedService = result.service as Service
      onServiceUpdated(toDashboardListing(updatedService))
      setServices((prev) => prev.map((service) => (service._id === updatedService._id ? updatedService : service)))
      resetAndClose()
    } catch (submitError) {
      console.error(submitError)
      setError('Unable to update service. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/60" onClick={resetAndClose} />
        <div className="absolute inset-0 p-4 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="w-full max-w-2xl rounded-2xl border border-primary/30 bg-background p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-foreground">Manage Services</h3>
              <button onClick={resetAndClose} className="p-2 rounded-lg hover:bg-muted/40">
                <X size={18} />
              </button>
            </div>

            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

            {mode === 'idle' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => setMode('add')} className="px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20">
                  Add New Service
                </button>
                <button onClick={() => setMode('select-edit')} className="px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20">
                  Edit Existing Service
                </button>
              </div>
            )}

            {mode === 'add' && (
              <div className="space-y-3">
                <input className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-muted/20" placeholder="Service name" value={addForm.title} onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))} />
                <select className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-muted/20" value={addForm.categoryId} onChange={(e) => setAddForm((p) => ({ ...p, categoryId: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
                <textarea className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-muted/20" rows={3} placeholder="Description" value={addForm.description} onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))} />
                <input type="number" className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-muted/20" placeholder="Price" value={addForm.pricing} onChange={(e) => setAddForm((p) => ({ ...p, pricing: e.target.value }))} />
                <textarea className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-muted/20" rows={2} placeholder="Location policy" value={addForm.locationPolicy} onChange={(e) => setAddForm((p) => ({ ...p, locationPolicy: e.target.value }))} />
                <input type="file" accept="image/*" className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-muted/20" onChange={(e) => setAddForm((p) => ({ ...p, image: e.target.files?.[0] }))} />
                <div className="flex gap-2">
                  <button onClick={() => setMode('idle')} className="px-4 py-2 rounded-xl bg-muted/40">Back</button>
                  <button onClick={handleAddSubmit} disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-primary/20 text-primary">{isSubmitting ? 'Saving...' : 'Create Service'}</button>
                </div>
              </div>
            )}

            {mode === 'select-edit' && (
              <div className="space-y-3">
                <select className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-muted/20" value={editForm.serviceId} onChange={(e) => handleSelectService(e.target.value)}>
                  <option value="">Select service to edit</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>{service.title}</option>
                  ))}
                </select>
                <button onClick={() => setMode('idle')} className="px-4 py-2 rounded-xl bg-muted/40">Back</button>
              </div>
            )}

            {mode === 'edit' && selectedService && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Editing: {selectedService.title}</p>
                <textarea className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-muted/20" rows={3} value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} />
                <input type="number" className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-muted/20" value={editForm.pricing} onChange={(e) => setEditForm((p) => ({ ...p, pricing: e.target.value }))} />
                <input type="file" accept="image/*" className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-muted/20" onChange={(e) => setEditForm((p) => ({ ...p, image: e.target.files?.[0] }))} />
                <div className="flex gap-2">
                  <button onClick={() => setMode('select-edit')} className="px-4 py-2 rounded-xl bg-muted/40">Back</button>
                  <button onClick={handleEditSubmit} disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-primary/20 text-primary">{isSubmitting ? 'Updating...' : 'Update Service'}</button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
