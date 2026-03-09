import React from "react"
import { GlassCard } from "./ui/glass-card"
import logo from "../assets/Images/logo.png";

interface FooterProps {
  onNavigate: (page: string) => void
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => (
  <footer className="mt-20 py-12 px-4">
    <div className="max-w-7xl mx-auto">
      <GlassCard className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src={logo}
                alt="ServeEase Logo"
                className="w-8 h-8 rounded-lg object-cover shadow-lg"
              />
              <span className="text-xl font-semibold">ServeEase</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Your trusted platform for local services. Connecting communities one service at a time.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Home Cleaning</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Repairs</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Installation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Maintenance</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => onNavigate("about")} className="hover:text-foreground transition-colors">About Us</button></li>
              <li><button onClick={() => onNavigate("contact")} className="hover:text-foreground transition-colors">Contact</button></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 ServeEase. All rights reserved. Built with ❤️ for local communities.
          </p>
        </div>
      </GlassCard>
    </div>
  </footer>
)

export { Footer }