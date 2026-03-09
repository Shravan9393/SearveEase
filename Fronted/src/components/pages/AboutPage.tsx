import React from "react";
import { motion } from "motion/react";
import { GlassCard } from "../ui/glass-card";
import { ImageCollage, CollageImage } from "../ImageCollage";
import divya from "../../assets/Images/divya.jpg";
import saurav from "../../assets/Images/saurav.jpg";
import shravan from "../../assets/Images/shravan.jpg";
import shubham from "../../assets/Images/shubham.png";





const teamStackImages: CollageImage[] = [
  { src: divya, alt: "Divya - UI/UX Designer" },
  { src: saurav, alt: "Saurav - Database Designer" },
  { src: shravan, alt: "Shravan - Backend Developer" },
  { src: shubham, alt: "Shubham - Frontend Developer" },
];


const AboutPage: React.FC = () => (
  <div className="pt-12 pb-32 px-4 max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <GlassCard className="p-12 text-center">
        <h1 className="text-3xl font-bold mb-4">
          About ServeEase
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Our mission is to connect local communities with
          trusted service providers, making it easier than ever
          to get the help you need when you need it.
        </p>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <ImageCollage
          images={teamStackImages}
          variant="masonry"
          className="h-80"
        />

        <GlassCard className="p-8">
          <h3 className="text-2xl font-semibold mb-6">
            Our Story
          </h3>
          <div className="space-y-4 text-muted-foreground">
            <p>
              ServeEase started when we noticed how difficult it was for people to find trusted service workers quickly.
At the same time, many skilled workers struggled to reach the right customers.

            </p>
            <p>
             We wanted to bring both sides together on one simple platform.
The idea grew into a system where customers could easily choose services in one place.

            </p>
            <p>
              Service providers were given their own space to manage their work and connect better.
Over time, ServeEase became a single solution handling many needs smoothly.
              Our platform ensures quality, safety, and trust
              through our rigorous vetting process and
              comprehensive insurance coverage.
            </p>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  </div>
);

export { AboutPage };