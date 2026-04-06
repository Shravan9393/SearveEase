import React, { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Search, MessageCircle, Send } from "lucide-react"
import { queriesAPI, ServiceQuery } from "../services/queries"

interface ViewAllQueriesModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ViewAllQueriesModal: React.FC<ViewAllQueriesModalProps> = ({ isOpen, onClose }) => {
  const [queries, setQueries] = useState<ServiceQuery[]>([])
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const loadQueries = async () => {
    try {
      const response = await queriesAPI.getProviderQueries()
      setQueries(response.queries || [])
      if (!selectedQueryId && response.queries?.length) {
        setSelectedQueryId(response.queries[0]._id)
      }
    } catch (error) {
      console.error("Failed to load provider queries", error)
      setQueries([])
    }
  }

  useEffect(() => {
    if (!isOpen) return
    loadQueries()
  }, [isOpen])

  const filteredQueries = useMemo(() => {
    const keyword = searchTerm.toLowerCase()
    return queries.filter((query) => {
      const customer = query.customerProfileId?.fullName?.toLowerCase() || ""
      const service = query.serviceId?.title?.toLowerCase() || ""
      return customer.includes(keyword) || service.includes(keyword)
    })
  }, [queries, searchTerm])

  const selectedQuery = filteredQueries.find((query) => query._id === selectedQueryId) || null

  const groupedLabel = (query: ServiceQuery) =>
    `${query.serviceId?.title || "Service"} • ${query.customerProfileId?.fullName || "Customer"}`

  const handleReply = async () => {
    if (!selectedQuery || !replyMessage.trim()) return

    try {
      await queriesAPI.replyToQuery(selectedQuery._id, replyMessage.trim())
      setReplyMessage("")
      await loadQueries()
    } catch (error: any) {
      console.error("Failed to reply to query", error)
      alert(error?.response?.data?.message || "Failed to send reply")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div onClick={(e) => e.stopPropagation()} className="modal-glass rounded-3xl w-full max-w-6xl h-[80vh] border border-primary/30 overflow-hidden">
              <div className="p-5 border-b border-primary/20 flex items-center justify-between">
                <div>
                  <h2 className="text-xl text-foreground">All Service Queries</h2>
                  <p className="text-sm text-muted-foreground">{filteredQueries.length} live queries</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(80vh-84px)]">
                <div className="border-r border-primary/20 p-4 space-y-3 overflow-y-auto">
                  <input
                    type="text"
                    placeholder="Search customer/service"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/20 border border-primary/20 rounded-xl text-sm"
                  />

                  {filteredQueries.map((query) => (
                    <button
                      key={query._id}
                      onClick={() => setSelectedQueryId(query._id)}
                      className={`w-full text-left p-3 rounded-xl border ${selectedQueryId === query._id ? "border-primary/50 bg-primary/10" : "border-primary/20"}`}
                    >
                      <p className="text-sm text-foreground">{groupedLabel(query)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(query.lastMessageAt).toLocaleString()}</p>
                    </button>
                  ))}
                </div>

                <div className="lg:col-span-2 flex flex-col">
                  {!selectedQuery && <div className="h-full flex items-center justify-center text-muted-foreground">Select a query to view details.</div>}

                  {selectedQuery && (
                    <>
                      <div className="p-4 border-b border-primary/20">
                        <p className="text-sm text-muted-foreground">{groupedLabel(selectedQuery)}</p>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {selectedQuery.messages.map((item) => (
                          <div key={item._id} className={`flex ${item.senderType === "provider" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${item.senderType === "provider" ? "bg-primary text-primary-foreground" : "bg-muted/30 border border-primary/20"}`}>
                              <p>{item.message}</p>
                              <p className="text-[10px] opacity-70 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 border-t border-primary/20 flex gap-2">
                        <input
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Reply to customer..."
                          className="flex-1 px-3 py-2 bg-muted/20 border border-primary/20 rounded-xl text-sm"
                        />
                        <button onClick={handleReply} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm flex items-center gap-1">
                          <Send size={14} /> Reply
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
