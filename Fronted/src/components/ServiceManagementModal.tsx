import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  X,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Star,
  Package,
  Save,
  Loader2,
  RefreshCw,
  ChevronLeft,
} from "lucide-react"
import { servicesAPI, Service } from "../services/services"
import { categoriesAPI, Category } from "../services/categories"

// ─── Types ───────────────────────────────────────────────────────────────────

// initialMode controls which screen opens first:
//   'add'         → opened via "Add New Service" button on listings card
//   'select-edit' → opened via "Edit" button on listings card
//   'idle'        → opened via "Manage Services" quick action (full list view)
type Mode = "idle" | "add" | "select-edit" | "edit"

export interface DashboardListing {
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

interface LocalService {
  id: string
  name: string
  price: string
  pricing: number
  description: string
  status: "active" | "inactive"
  bookings: number
  views: number
  rating: number
  categoryName: string
}

interface AddForm {
  title: string
  categoryId: string
  description: string
  pricing: string
  locationPolicy: string
}

interface EditForm {
  description: string
  pricing: string
}

interface ServiceManagementModalProps {
  isOpen: boolean
  initialMode?: Mode
  onClose: () => void
  onServiceAdded?: (service: DashboardListing) => void
  onServiceUpdated?: (service: DashboardListing) => void
}

// ─── Mapper helpers ───────────────────────────────────────────────────────────

const toDashboard = (s: Service): DashboardListing => ({
  id: s._id,
  service: s.title,
  price: `₹${s.pricing}`,
  bookings: 0,
  revenue: "₹0",
  status: s.availability === "unavailable" ? "inactive" : "active",
  views: s.reviews || 0,
  rating: s.rating || 0,
  categoryName: s.categoryName || "",
  pricing: s.pricing,
})

const toLocal = (s: Service): LocalService => ({
  id: s._id,
  name: s.title,
  price: `₹${s.pricing}`,
  pricing: s.pricing,
  description: s.description,
  status: s.isActive ? "active" : "inactive",
  bookings: Number(s.reviews || 0),
  views: 0,
  rating: Number(s.rating || 0),
  categoryName: s.categoryName || "",
})

// ─── Component ────────────────────────────────────────────────────────────────

export const ServiceManagementModal: React.FC<ServiceManagementModalProps> = ({
  isOpen,
  initialMode = "idle",
  onClose,
  onServiceAdded,
  onServiceUpdated,
}) => {
  // ── UI state ──────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>(initialMode)

  // ── Data state ────────────────────────────────────────────────────────────
  const [services, setServices] = useState<LocalService[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedId, setSelectedId] = useState("")

  // ── Loading state ─────────────────────────────────────────────────────────
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Error state ───────────────────────────────────────────────────────────
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // ── Form state ────────────────────────────────────────────────────────────
  const [addForm, setAddForm] = useState<AddForm>({
    title: "",
    categoryId: "",
    description: "",
    pricing: "",
    locationPolicy: "",
  })
  const [addImage, setAddImage] = useState<File | undefined>()

  const [editForm, setEditForm] = useState<EditForm>({
    description: "",
    pricing: "",
  })
  const [editImage, setEditImage] = useState<File | undefined>()

  const selectedService = services.find((s) => s.id === selectedId)

  // ── Sync mode when modal re-opens ─────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setFormError(null)
      setServicesError(null)
      setSelectedId("")
    }
  }, [isOpen, initialMode])

  // ── Load data when modal opens ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    loadServices()
    loadCategories()
  }, [isOpen])

  // ── Loaders ───────────────────────────────────────────────────────────────

  const loadServices = async () => {
    setIsLoadingServices(true)
    setServicesError(null)
    try {
      const res = await servicesAPI.getMyServices()
      setServices((res?.services || []).map(toLocal))
    } catch (e: any) {
      console.error("loadServices error:", e)
      const msg =
        e?.response?.data?.message ||
        "Failed to load your services. Please try again."
      setServicesError(msg)
      setServices([])
    } finally {
      setIsLoadingServices(false)
    }
  }

  const loadCategories = async () => {
    setIsLoadingCategories(true)
    setCategoriesError(null)

    try {
      const res = await categoriesAPI.getCategories()
      const cats: Category[] = res || []
      setCategories(cats)

      if (cats.length === 0) {
        setCategoriesError(
          "No categories found. Please seed categories in the database."
        )
      }
    } catch (e) {
      console.error("loadCategories error:", e)
      setCategoriesError(
        "Could not load categories. Check your categories API endpoint."
      )
    } finally {
      setIsLoadingCategories(false)
    }
  }

  // ── Close & reset ─────────────────────────────────────────────────────────

  const handleClose = () => {
    // Reset all state before closing
    setMode("idle")
    setSelectedId("")
    setAddForm({
      title: "",
      categoryId: "",
      description: "",
      pricing: "",
      locationPolicy: "",
    })
    setAddImage(undefined)
    setEditForm({ description: "", pricing: "" })
    setEditImage(undefined)
    setFormError(null)
    setServicesError(null)
    setIsSubmitting(false)
    onClose()
  }

  const goBack = () => {
    setFormError(null)
    if (mode === "edit") setMode("select-edit")
    else setMode("idle")
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddSubmit = async () => {
    if (
      !addForm.title.trim() ||
      !addForm.categoryId ||
      !addForm.description.trim() ||
      !addForm.pricing ||
      !addForm.locationPolicy.trim()
    ) {
      setFormError("Please fill in all required fields.")
      return
    }
    const price = Number(addForm.pricing)
    if (isNaN(price) || price <= 0) {
      setFormError("Please enter a valid price greater than 0.")
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      const res = await servicesAPI.createService({
        title: addForm.title.trim(),
        categoryId: addForm.categoryId,
        description: addForm.description.trim(),
        pricing: price,
        locationPolicy: addForm.locationPolicy.trim(),
        images: addImage,
      })
      const created = res.service as Service
      setServices((prev) => [toLocal(created), ...prev])
      onServiceAdded?.(toDashboard(created))
      handleClose()
    } catch (e: any) {
      console.error("createService error:", e)
      setFormError(
        e?.response?.data?.message || "Unable to create service. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditFor = (service: LocalService) => {
    setSelectedId(service.id)
    setEditForm({ description: service.description, pricing: String(service.pricing) })
    setEditImage(undefined)
    setFormError(null)
    setMode("edit")
  }

  const handleEditSubmit = async () => {
    if (!selectedId || !editForm.description.trim() || !editForm.pricing) {
      setFormError("Please fill in all required fields.")
      return
    }
    const price = Number(editForm.pricing)
    if (isNaN(price) || price <= 0) {
      setFormError("Please enter a valid price greater than 0.")
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      const res = await servicesAPI.updateService(selectedId, {
        description: editForm.description.trim(),
        pricing: price,
        images: editImage,
      })
      const updated = res.service as Service
      setServices((prev) =>
        prev.map((s) => (s.id === updated._id ? toLocal(updated) : s))
      )
      onServiceUpdated?.(toDashboard(updated))
      handleClose()
    } catch (e: any) {
      console.error("updateService error:", e)
      setFormError(
        e?.response?.data?.message || "Unable to update service. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (
    id: string,
    currentStatus: "active" | "inactive"
  ) => {
    const newIsActive = currentStatus === "inactive"
    setTogglingId(id)
    try {
      await servicesAPI.updateService(id, { isActive: newIsActive })
      setServices((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: newIsActive ? "active" : "inactive" }
            : s
        )
      )
    } catch {
      setServicesError("Failed to update service status.")
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Delete this service permanently? This cannot be undone."))
      return
    setDeletingId(id)
    try {
      await servicesAPI.deleteService(id)
      setServices((prev) => prev.filter((s) => s.id !== id))
    } catch {
      setServicesError("Failed to delete service.")
    } finally {
      setDeletingId(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (!isOpen) return null

  const modalTitle =
    mode === "idle"
      ? "Manage Services"
      : mode === "add"
      ? "Add New Service"
      : mode === "select-edit"
      ? "Select Service to Edit"
      : `Edit: ${selectedService?.name ?? ""}`



  return (
    <AnimatePresence>
      {isOpen && (
        // ── Fixed overlay ────────────────────────────────────────────────────
        // z-[9999] ensures it renders above the bottom navigation bar
        <div className="fixed inset-0 z-[9999]">

          {/* Backdrop — clicking this closes the modal */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* ── Centering wrapper ──────────────────────────────────────────────
              pb-20: ensures the card clears the bottom navigation bar (~64px)
              The card itself is ABOVE the backdrop in DOM order (relative z-10)
              so clicks on the card never reach the backdrop.
          ──────────────────────────────────────────────────────────────────── */}
          <div className="relative z-10 flex items-center justify-center h-full p-4 pb-20">
            <motion.div
              // stopPropagation prevents any click inside the card from
              // bubbling through to the backdrop's onClick={handleClose}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-primary/30 bg-background flex flex-col overflow-hidden"
              style={{
                maxHeight: "80vh",
                boxShadow:
                  "0 0 40px rgba(88, 129, 87, 0.3), inset 0 0 20px rgba(88, 129, 87, 0.05)",
              }}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {/* ── Fixed header ──────────────────────────────────────────── */}
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-primary/20">
                <div className="flex items-center gap-2">
                  {mode !== "idle" && (
                    <button
                      onClick={goBack}
                      className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground transition-colors"
                      aria-label="Go back"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <Package size={18} className="text-primary" />
                    <h3 className="text-base font-semibold text-foreground">
                      {modalTitle}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-muted/40 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ── Scrollable body ───────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

                {/* ════════════════════════════════════════════════════════
                    MODE: IDLE  — Service list + Add/Edit shortcuts
                    ════════════════════════════════════════════════════════ */}
                {mode === "idle" && (
                  <>
                    {/* Quick action buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setFormError(null)
                          setMode("add")
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                      >
                        <Plus size={15} />
                        Add New Service
                      </button>
                      <button
                        onClick={() => {
                          setFormError(null)
                          setMode("select-edit")
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                      >
                        <Edit2 size={15} />
                        Edit a Service
                      </button>
                    </div>

                    {/* Services error */}
                    {servicesError && (
                      <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs text-red-500">{servicesError}</p>
                        <button
                          onClick={loadServices}
                          className="ml-2 p-1 rounded hover:bg-red-500/20 transition-colors"
                          aria-label="Retry"
                        >
                          <RefreshCw size={13} className="text-red-500" />
                        </button>
                      </div>
                    )}

                    {/* Loading */}
                    {isLoadingServices && (
                      <div className="flex items-center justify-center py-8 gap-2">
                        <Loader2 size={18} className="animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Loading your services...
                        </span>
                      </div>
                    )}

                    {/* Empty state */}
                    {!isLoadingServices &&
                      !servicesError &&
                      services.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <Package
                            size={32}
                            className="text-muted-foreground mb-3"
                          />
                          <p className="text-sm text-muted-foreground mb-3">
                            No services yet
                          </p>
                          <button
                            onClick={() => setMode("add")}
                            className="text-sm text-primary underline underline-offset-2"
                          >
                            Add your first service
                          </button>
                        </div>
                      )}

                    {/* Service list */}
                    {!isLoadingServices &&
                      services.map((service) => (
                        <div
                          key={service.id}
                          className="p-4 rounded-xl border border-primary/20 bg-muted/5 hover:border-primary/40 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm font-medium text-foreground truncate">
                                  {service.name}
                                </span>
                                {/* Toggle status button */}
                                <button
                                  onClick={() =>
                                    handleToggleStatus(service.id, service.status)
                                  }
                                  disabled={togglingId === service.id}
                                  className={`px-2 py-0.5 rounded-full text-xs transition-all disabled:opacity-50 cursor-pointer ${
                                    service.status === "active"
                                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {togglingId === service.id
                                    ? "..."
                                    : service.status}
                                </button>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {service.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <DollarSign
                                    size={11}
                                    className="text-primary"
                                  />
                                  {service.price}
                                </span>
                                {service.categoryName && (
                                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px]">
                                    {service.categoryName}
                                  </span>
                                )}
                                {service.rating > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Star
                                      size={11}
                                      className="fill-yellow-500 text-yellow-500"
                                    />
                                    {service.rating}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => openEditFor(service)}
                                className="w-8 h-8 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg flex items-center justify-center transition-all"
                                aria-label="Edit service"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteService(service.id)}
                                disabled={deletingId === service.id}
                                className="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                                aria-label="Delete service"
                              >
                                {deletingId === service.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Trash2 size={13} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </>
                )}

                {/* ════════════════════════════════════════════════════════
                    MODE: ADD — Create a new service
                    ════════════════════════════════════════════════════════ */}
                {mode === "add" && (
                  <>
                    {formError && (
                      <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
                        {formError}
                      </p>
                    )}

                    {/* Service Name */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Service Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full px-3 py-2.5 rounded-xl border border-primary/20 bg-muted/20 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 text-sm transition-colors"
                        placeholder="e.g., AC Deep Cleaning"
                        value={addForm.title}
                        onChange={(e) =>
                          setAddForm((p) => ({ ...p, title: e.target.value }))
                        }
                      />
                    </div>

        
                  {/* Category */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>

                    <select 
                      className="w-full px-3 py-2.5 rounded-xl border border-primary/20 bg-muted/20 text-foreground focus:outline-none focus:border-primary/50 text-sm transition-colors"
                      value={addForm.categoryId}
                      onChange={(e) =>
                        setAddForm((prev) => ({
                          ...prev,
                          categoryId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select a category</option>

                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full px-3 py-2.5 rounded-xl border border-primary/20 bg-muted/20 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 text-sm transition-colors resize-none"
                        rows={3}
                        placeholder="Describe your service in detail (min. 10 characters)..."
                        value={addForm.description}
                        onChange={(e) =>
                          setAddForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2.5 rounded-xl border border-primary/20 bg-muted/20 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 text-sm transition-colors"
                        placeholder="e.g., 799"
                        value={addForm.pricing}
                        onChange={(e) =>
                          setAddForm((p) => ({ ...p, pricing: e.target.value }))
                        }
                      />
                    </div>

                    {/* Location Policy */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Service Area / Location Policy{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full px-3 py-2.5 rounded-xl border border-primary/20 bg-muted/20 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 text-sm transition-colors resize-none"
                        rows={2}
                        placeholder="e.g., We serve within 20km of the city centre (min. 10 characters)"
                        value={addForm.locationPolicy}
                        onChange={(e) =>
                          setAddForm((p) => ({
                            ...p,
                            locationPolicy: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Image */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Service Image (optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-muted/20 text-foreground text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary/10 file:text-primary cursor-pointer"
                        onChange={(e) => setAddImage(e.target.files?.[0])}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleAddSubmit}
                  disabled={
                    isSubmitting ||
                    !addForm.title.trim() ||
                    !addForm.categoryId ||
                    !addForm.description.trim() ||
                    !addForm.pricing ||
                    !addForm.locationPolicy.trim()
                  }
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus size={15} />
                          Create Service
                        </>
                      )}
                    </button>
                  </>
                )}

                {/* ════════════════════════════════════════════════════════
                    MODE: SELECT-EDIT — Pick which service to edit
                    ════════════════════════════════════════════════════════ */}
                {mode === "select-edit" && (
                  <>
                    {servicesError && (
                      <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs text-red-500">{servicesError}</p>
                        <button
                          onClick={loadServices}
                          className="ml-2 p-1 rounded hover:bg-red-500/20"
                        >
                          <RefreshCw size={13} className="text-red-500" />
                        </button>
                      </div>
                    )}

                    {isLoadingServices ? (
                      <div className="flex items-center justify-center py-10 gap-2">
                        <Loader2
                          size={18}
                          className="animate-spin text-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                          Loading your services...
                        </span>
                      </div>
                    ) : services.length === 0 && !servicesError ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Package
                          size={32}
                          className="text-muted-foreground mb-3"
                        />
                        <p className="text-sm text-muted-foreground mb-3">
                          No services to edit yet.
                        </p>
                        <button
                          onClick={() => setMode("add")}
                          className="text-sm text-primary underline underline-offset-2"
                        >
                          Add your first service
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Tap a service to edit it:
                        </p>
                        <div className="space-y-2">
                          {services.map((service) => (
                            <button
                              key={service.id}
                              onClick={() => openEditFor(service)}
                              className="w-full text-left p-4 rounded-xl border border-primary/20 bg-muted/5 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                    {service.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {service.price}
                                    {service.categoryName
                                      ? ` · ${service.categoryName}`
                                      : ""}
                                  </p>
                                </div>
                                <Edit2
                                  size={15}
                                  className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                                />
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* ════════════════════════════════════════════════════════
                    MODE: EDIT — Update selected service
                    ════════════════════════════════════════════════════════ */}
                {mode === "edit" && selectedService && (
                  <>
                    {/* Service info banner */}
                    <div className="px-3 py-2.5 bg-primary/5 rounded-xl border border-primary/20">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                        Editing
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedService.name}
                      </p>
                      {selectedService.categoryName && (
                        <p className="text-xs text-muted-foreground">
                          {selectedService.categoryName}
                        </p>
                      )}
                    </div>

                    {formError && (
                      <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
                        {formError}
                      </p>
                    )}

                    {/* Description */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full px-3 py-2.5 rounded-xl border border-primary/20 bg-muted/20 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 text-sm transition-colors resize-none"
                        rows={4}
                        placeholder="Update the service description..."
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2.5 rounded-xl border border-primary/20 bg-muted/20 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 text-sm transition-colors"
                        value={editForm.pricing}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            pricing: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Image */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Replace Image (optional — leave empty to keep current)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-muted/20 text-foreground text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary/10 file:text-primary cursor-pointer"
                        onChange={(e) => setEditImage(e.target.files?.[0])}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleEditSubmit}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={15} />
                          Update Service
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
              {/* End scrollable body */}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
