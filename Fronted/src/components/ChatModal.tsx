import React, { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Send, MessageCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { queriesAPI, ServiceQuery } from "../services/queries"

interface ServiceProvider {
  id: string
  profileId: string
  name: string
  image: string
  rating: number
  reviewCount: number
  responseTime: string
  isOnline: boolean
  serviceName: string
  basePrice: number
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  provider: ServiceProvider
  customerId?: string
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, provider, customerId }) => {
  const [queries, setQueries] = useState<ServiceQuery[]>([])
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const loadQueries = async () => {
    try {
      const data = await queriesAPI.getCustomerQueries()
      const filtered = (data.queries || []).filter(
        (query) => query.serviceId?._id === provider.id && query.providerProfileId?._id === provider.profileId
      )
      setQueries(filtered)
    } catch (error) {
      console.error("Failed to fetch customer queries", error)
      setQueries([])
    }
  }

  useEffect(() => {
    if (!isOpen) return
    loadQueries()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const intervalId = window.setInterval(loadQueries, 8000)
    return () => window.clearInterval(intervalId)
  }, [isOpen, provider.id, provider.profileId])

  const allMessages = useMemo(
    () =>
      queries
        .flatMap((query) =>
          (query.messages || []).map((item) => ({ ...item, queryId: query._id, status: query.status }))
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [queries]
  )

  const handleSendQuery = async () => {
    if (!message.trim()) return
    if (!customerId) {
      alert("Please log in as a customer to send a query.")
      return
    }

    setIsSending(true)
    try {
      const existingQuery = queries.find((query) => query.status !== "closed")

      if (existingQuery) {
        await queriesAPI.replyToCustomerQuery(existingQuery._id, message.trim())
      } else {
        await queriesAPI.createQuery({
          serviceId: provider.id,
          providerId: provider.profileId,
          customerId,
          message: message.trim(),
        })
      }
      setMessage("")
      await loadQueries()
    } catch (error: any) {
      console.error("Failed to send query", error)
      alert(error?.response?.data?.message || "Failed to send query")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 modal-backdrop"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl h-[600px] max-h-[85vh] overflow-hidden"
          >
            <div className="modal-glass rounded-3xl h-full flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/15">
                <div>
                  <h3 className="text-lg font-semibold">Query {provider.name}</h3>
                  <p className="text-sm text-muted-foreground">{provider.serviceName}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                  <X size={18} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {allMessages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    <div className="text-center">
                      <MessageCircle className="mx-auto mb-2" size={24} />
                      No queries yet. Start by sending a message.
                    </div>
                  </div>
                )}

                {allMessages.map((item) => (
                  <div key={item._id} className={`flex ${item.senderType === "customer" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        item.senderType === "customer"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/30 border border-primary/20"
                      }`}
                    >
                      <p>{item.message}</p>
                      <p className="text-[10px] opacity-70 mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/15 flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your query message..."
                  className="h-11"
                />
                <Button onClick={handleSendQuery} disabled={isSending || !message.trim()} className="h-11">
                  <Send size={16} className="mr-1" />
                  {isSending ? "Sending" : "Send"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export { ChatModal, type ServiceProvider }
