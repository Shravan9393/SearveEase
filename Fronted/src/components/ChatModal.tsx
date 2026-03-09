import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Send, Phone, Video, MoreHorizontal, Star, MapPin, Clock } from "lucide-react"
import { GlassCard } from "./ui/glass-card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ImageWithFallback } from "./figma/ImageWithFallback"

interface Message {
  id: string
  sender: 'user' | 'provider'
  message: string
  timestamp: Date
  type: 'text' | 'quote' | 'booking'
}

interface ServiceProvider {
  id: string
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
  onBookService?: (providerId: string, price: number) => void
}

const ChatModal: React.FC<ChatModalProps> = ({ 
  isOpen, 
  onClose, 
  provider,
  onBookService 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'provider',
      message: `Hi! I'm ${provider.name}. How can I help you with ${provider.serviceName}?`,
      timestamp: new Date(Date.now() - 300000),
      type: 'text'
    },
    {
      id: '2',
      sender: 'provider',
      message: `I'm available right now and can start within ${provider.responseTime}. Would you like a custom quote?`,
      timestamp: new Date(Date.now() - 240000),
      type: 'text'
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: newMessage,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsTyping(true)

    // Simulate provider response
    setTimeout(() => {
      const responses = [
        "I understand your requirements. Let me prepare a detailed quote for you.",
        "That sounds great! I have availability this week. When would work best for you?",
        "I can definitely help with that. My rate for this service is competitive.",
        "Perfect! I'll bring all necessary equipment. Do you have any specific preferences?",
        "I have 5+ years of experience with this type of work. I guarantee quality results."
      ]

      const providerMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'provider',
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text'
      }

      setMessages(prev => [...prev, providerMessage])
      setIsTyping(false)

      // Sometimes send a quote
      if (Math.random() > 0.6) {
        setTimeout(() => {
          const quoteMessage: Message = {
            id: (Date.now() + 2).toString(),
            sender: 'provider',
            message: `Custom Quote: ₹${provider.basePrice + Math.floor(Math.random() * 200)} (includes materials and labor)`,
            timestamp: new Date(),
            type: 'quote'
          }
          setMessages(prev => [...prev, quoteMessage])
        }, 2000)
      }
    }, 1500 + Math.random() * 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sendQuickReply = (reply: string) => {
    setNewMessage(reply)
    setTimeout(() => sendMessage(), 100)
  }

  const handleBookService = () => {
    const bookingMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: "I'd like to book this service. Can we proceed?",
      timestamp: new Date(),
      type: 'booking'
    }
    setMessages(prev => [...prev, bookingMessage])
    
    setTimeout(() => {
      const confirmMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'provider',
        message: "Great! I'll confirm the booking details and send you the payment link.",
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, confirmMessage])
      
      // Call the booking function if provided
      onBookService?.(provider.id, provider.basePrice)
    }, 1000)
  }

  const quickReplies = [
    "What's your pricing?",
    "When are you available?",
    "Do you provide materials?",
    "How long will it take?"
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Enhanced Backdrop - Much darker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 modal-backdrop"
            onClick={onClose}
          />

          {/* Enhanced Chat Modal - Much darker in dark mode */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg h-[600px] max-h-[80vh] overflow-hidden"
          >
            <div className="modal-glass rounded-3xl h-full flex flex-col shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 dark:border-white/20">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <ImageWithFallback
                      src={provider.image}
                      alt={provider.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/20"
                    />
                    {provider.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{provider.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Star size={12} className="text-yellow-500 fill-current" />
                      <span>{provider.rating}</span>
                      <span>({provider.reviewCount})</span>
                      <span>•</span>
                      <span className={provider.isOnline ? "text-green-500" : "text-muted-foreground"}>
                        {provider.isOnline ? 'Online' : `Responds in ${provider.responseTime}`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="rounded-2xl modal-internal-glass w-10 h-10 hover:bg-white/15 dark:hover:bg-white/20">
                    <Phone size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-2xl modal-internal-glass w-10 h-10 hover:bg-white/15 dark:hover:bg-white/20">
                    <Video size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-2xl modal-internal-glass w-10 h-10 hover:bg-white/15 dark:hover:bg-white/20">
                    <MoreHorizontal size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onClose}
                    className="rounded-2xl modal-internal-glass w-10 h-10 hover:bg-white/15 dark:hover:bg-white/20 ml-2"
                  >
                    <X size={18} />
                  </Button>
                </div>
              </div>

              {/* Service Info */}
              <div className="p-4 bg-gradient-to-r from-primary/10 via-sage-100/10 to-primary/5 dark:from-primary/5 dark:via-sage-100/5 dark:to-primary/3 border-b border-white/10 dark:border-white/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Service:</span>
                  <span className="font-semibold">{provider.serviceName}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground font-medium">Starting from:</span>
                  <span className="text-lg font-bold text-primary">₹{provider.basePrice}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-primary to-sage-700 text-primary-foreground shadow-lg'
                          : message.type === 'quote'
                          ? 'modal-internal-glass bg-gradient-to-r from-orange-100/50 to-yellow-100/50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200/50 dark:border-orange-800/30'
                          : 'modal-internal-glass'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.message}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.type === 'quote' && message.sender === 'provider' && (
                          <Button 
                            size="sm" 
                            onClick={handleBookService}
                            className="h-8 text-xs px-3 bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary rounded-xl"
                          >
                            Book Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="modal-internal-glass p-4 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="px-4 py-3 border-t border-white/10 dark:border-white/20">
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => sendQuickReply(reply)}
                      className="text-xs h-8 rounded-2xl modal-internal-glass border-white/20 dark:border-white/15 hover:bg-white/15 dark:hover:bg-white/20"
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10 dark:border-white/20">
                <div className="flex items-center space-x-3">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 h-12 rounded-2xl modal-internal-glass border-white/20 dark:border-white/15 focus:border-primary/50 dark:focus:border-primary/60 transition-all duration-200"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="rounded-2xl bg-gradient-to-r from-primary to-sage-700 hover:from-sage-700 hover:to-primary w-12 h-12 shadow-lg disabled:opacity-50"
                    size="icon"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export { ChatModal, type ServiceProvider }