import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import connectDB from "../DB/index.js";
import Category from "../MODELS/categories.models.js";
import { User } from "../MODELS/users.models.js";
import { CustomerProfile } from "../MODELS/customer_profiles.models.js";
import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
import Service from "../MODELS/services.models.js";

const rootEnvPath = path.resolve("./.env");
const srcEnvPath = path.resolve("./src/.env");

dotenv.config({ path: fs.existsSync(rootEnvPath) ? rootEnvPath : srcEnvPath });

const categoriesSeed = [
  { name: "House Cleaning", description: "Deep cleaning and home maintenance services", icon: "Sparkles", popular: true },
  { name: "AC Repair", description: "AC installation, repair and servicing", icon: "Wind", popular: true },
  { name: "Plumbing", description: "Pipe fitting, leakage and bathroom repairs", icon: "Wrench", popular: true },
  { name: "Electrical", description: "Electrical maintenance and appliance wiring", icon: "Zap" },
  { name: "Painting", description: "Interior and exterior painting services", icon: "Paintbrush" },
];

const providerSeed = [
  {
    userName: "cleanco_pro",
    fullName: "CleanCo Services",
    email: "cleanco@example.com",
    password: "Password@123",
    businessName: "",
    displayName: "CleanCo Services",
    phone: "9876500001",
    description: "Trusted home cleaning specialists.",
    location: { city: "Bangalore", state: "Karnataka" },
    pricing: { starting: 499 },
    ratingSummary: { avg: 4.7, count: 142 },
    verified: true,
  },
  {
    userName: "cooltech",
    fullName: "CoolTech Solutions",
    email: "cooltech@example.com",
    password: "Password@123",
    businessName: "CoolTech HVAC",
    displayName: "CoolTech Solutions",
    phone: "9876500002",
    description: "Fast AC repair and preventive maintenance.",
    location: { city: "Bangalore", state: "Karnataka" },
    pricing: { starting: 799 },
    ratingSummary: { avg: 4.5, count: 96 },
    verified: true,
  },
];

const customerSeed = [
  {
    userName: "rahul_customer",
    fullName: "Rahul Sharma",
    email: "rahul@example.com",
    password: "Password@123",
    phone: "9988776655",
    location: { city: "Bangalore", state: "Karnataka" },
  },
  {
    userName: "priya_customer",
    fullName: "Priya Patel",
    email: "priya@example.com",
    password: "Password@123",
    phone: "9988776644",
    location: { city: "Bhubaneswar", state: "Odisha" },
  },
];

const buildSlug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const run = async () => {
  await connectDB();

  await Promise.all([
    Service.deleteMany({}),
    ProviderProfile.deleteMany({}),
    CustomerProfile.deleteMany({}),
    User.deleteMany({ email: { $in: [...providerSeed.map((v) => v.email), ...customerSeed.map((v) => v.email)] } }),
    Category.deleteMany({ name: { $in: categoriesSeed.map((v) => v.name) } }),
  ]);

  const categories = await Category.insertMany(
    categoriesSeed.map((cat) => ({ ...cat, slug: buildSlug(cat.name) }))
  );

  const categoryMap = new Map(categories.map((cat) => [cat.name, cat]));

  const providers = [];
  for (const seedProvider of providerSeed) {
    const user = await User.create({
      userName: seedProvider.userName,
      fullName: seedProvider.fullName,
      email: seedProvider.email,
      password: seedProvider.password,
      role: "provider",
    });

    const profile = await ProviderProfile.create({
      userId: user._id,
      businessName: seedProvider.businessName,
      displayName: seedProvider.displayName,
      phone: seedProvider.phone,
      description: seedProvider.description,
      pricing: seedProvider.pricing,
      location: seedProvider.location,
      ratingSummary: seedProvider.ratingSummary,
      verified: seedProvider.verified,
      availability: "available",
      responseTime: "15 mins",
      isOnline: true,
    });

    providers.push({ user, profile });
  }

  for (const customer of customerSeed) {
    const user = await User.create({
      userName: customer.userName,
      fullName: customer.fullName,
      email: customer.email,
      password: customer.password,
      role: "customer",
    });

    await CustomerProfile.create({
      userId: user._id,
      fullName: customer.fullName,
      phone: customer.phone,
      location: customer.location,
    });
  }

  const services = await Service.insertMany([
    {
      providerId: providers[0].profile._id,
      providerName: providers[0].profile.displayName,
      providerImage: providers[0].profile.profileImage,
      categoryId: categoryMap.get("House Cleaning")._id,
      categoryName: "House Cleaning",
      title: "Premium Deep Home Cleaning",
      description: "Complete deep cleaning for kitchen, bathrooms, bedrooms and living area.",
      pricing: 1499,
      originalPrice: 1799,
      duration: "3-4 hours",
      features: ["Eco-safe products", "Trained cleaners", "Same day booking"],
      distance: "3 km away",
      availability: "available",
      responseTime: "10 mins",
      isOnline: true,
      rating: 4.8,
      reviews: 210,
      locationPolicy: "Provider travels to customer location within 10km radius",
      images: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      providerId: providers[1].profile._id,
      providerName: providers[1].profile.displayName,
      providerImage: providers[1].profile.profileImage,
      categoryId: categoryMap.get("AC Repair")._id,
      categoryName: "AC Repair",
      title: "Split AC Repair and Service",
      description: "Gas refill, cooling issue diagnostics and AC maintenance for all major brands.",
      pricing: 899,
      duration: "1-2 hours",
      features: ["30-day service warranty", "Original spare support", "Quick response"],
      distance: "5 km away",
      availability: "busy",
      responseTime: "20 mins",
      isOnline: true,
      rating: 4.6,
      reviews: 124,
      locationPolicy: "On-site service available within Bangalore city limits",
      images: "https://images.unsplash.com/photo-1621905252472-943afaa20e39?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
  ]);

  providers[0].profile.services = [services[0]._id];
  providers[0].profile.categories = [categoryMap.get("House Cleaning")._id];
  await providers[0].profile.save();

  providers[1].profile.services = [services[1]._id];
  providers[1].profile.categories = [categoryMap.get("AC Repair")._id];
  await providers[1].profile.save();

  console.log(`Seeded ${categories.length} categories, ${services.length} services, ${providers.length} providers and ${customerSeed.length} customers.`);
  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Seeding failed", error);
  await mongoose.connection.close();
  process.exit(1);
});
