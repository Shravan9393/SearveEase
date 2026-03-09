import React from "react"
import { motion } from "motion/react"
import { GlassCard } from "../ui/glass-card"

const ContactPage: React.FC = () => (
  <div className="pt-12 pb-32 px-4 max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <GlassCard className="p-12">
        <h1 className="text-3xl font-bold mb-4">Contact ServeEase</h1>
        <p className="text-muted-foreground mb-8">
          Have questions? We're here to help! Reach out to our support team anytime.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-primary">📧</span>
            </div>
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground">help@serveease.com</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-primary">📞</span>
            </div>
            <h3 className="font-semibold mb-2">Phone Support</h3>
            <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-primary">💬</span>
            </div>
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground">Available 24/7</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  </div>
)

export { ContactPage }