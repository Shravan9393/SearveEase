import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import connectDB from "../src/DB/index.js";
import Category from "../src/MODELS/categories.models.js";
import { User } from "../src/MODELS/users.models.js";
import { ProviderProfile } from "../src/MODELS/provider_profiles.models.js";
import { CustomerProfile } from "../src/MODELS/customer_profiles.models.js";
import Service from "../src/MODELS/services.models.js";
import Booking from "../src/MODELS/booking.models.js";
import Review from "../src/MODELS/review.models.js";

const rootEnvPath = path.resolve("./.env");
const srcEnvPath = path.resolve("./src/.env");
dotenv.config({ path: fs.existsSync(rootEnvPath) ? rootEnvPath : srcEnvPath });

const toSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const run = async () => {
  await connectDB();

  const providerEmail = "dashboard.provider@serveease.com";
  const customerEmails = [
    "dashboard.customer1@serveease.com",
    "dashboard.customer2@serveease.com",
    "dashboard.customer3@serveease.com",
    "dashboard.customer4@serveease.com",
  ];

  const categorySeeds = [
    { name: "AC Repair", description: "AC installation and maintenance", icon: "Wind", popular: true },
    { name: "Electrical", description: "Electrical repair and installations", icon: "Zap", popular: true },
    { name: "Plumbing", description: "Home plumbing services", icon: "Wrench", popular: true },
  ];

  const categories = [];
  for (const seed of categorySeeds) {
    const category = await Category.findOneAndUpdate(
      { slug: toSlug(seed.name) },
      { ...seed, slug: toSlug(seed.name) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categories.push(category);
  }

  await Booking.deleteMany({ notes: { $regex: "Dashboard seed booking" } });
  await Review.deleteMany({ comment: { $regex: "Dashboard seed review" } });
  await Service.deleteMany({ title: { $in: ["Premium AC Tune-Up", "Emergency AC Repair", "Seasonal AC Maintenance Plan"] } });
  await ProviderProfile.deleteMany({ displayName: "Dashboard Provider" });
  await CustomerProfile.deleteMany({ fullName: { $in: ["Dashboard Customer One", "Dashboard Customer Two", "Dashboard Customer Three", "Dashboard Customer Four"] } });
  await User.deleteMany({ email: { $in: [providerEmail, ...customerEmails] } });

  const providerUser = await User.create({
    userName: "dashboard_provider",
    fullName: "Dashboard Provider",
    email: providerEmail,
    password: "Password@123",
    role: "provider",
  });

  const providerProfile = await ProviderProfile.create({
    userId: providerUser._id,
    displayName: "Dashboard Provider",
    businessName: "ServeEase Climate Experts",
    phone: "9000011111",
    description: "Specialized in AC diagnostics, quick fixes and annual maintenance packages.",
    location: { city: "Bangalore", state: "Karnataka" },
    pricing: { starting: 699, currency: "₹" },
    responseTime: "20 mins",
    verified: true,
    availability: "available",
  });

  const customerProfiles = [];
  const customerNames = [
    "Dashboard Customer One",
    "Dashboard Customer Two",
    "Dashboard Customer Three",
    "Dashboard Customer Four",
  ];

  for (let index = 0; index < customerEmails.length; index += 1) {
    const user = await User.create({
      userName: `dashboard_customer_${index + 1}`,
      fullName: customerNames[index],
      email: customerEmails[index],
      password: "Password@123",
      role: "customer",
    });

    const profile = await CustomerProfile.create({
      userId: user._id,
      fullName: customerNames[index],
      phone: `91111000${index + 1}${index + 1}`.slice(0, 10),
      location: { city: "Bangalore", state: "Karnataka" },
    });

    customerProfiles.push(profile);
  }

  const services = await Service.insertMany([
    {
      providerId: providerProfile._id,
      providerName: providerProfile.displayName,
      providerImage: providerProfile.profileImage,
      categoryId: categories[0]._id,
      categoryName: categories[0].name,
      title: "Premium AC Tune-Up",
      description: "Deep cleaning, airflow optimization and gas pressure checks for split and window ACs.",
      pricing: 1199,
      originalPrice: 1499,
      images: "https://images.unsplash.com/photo-1621905252472-943afaa20e39?auto=format&fit=crop&w=800&q=80",
      duration: "2 hours",
      features: ["Deep coil cleaning", "Performance testing", "Service report"],
      distance: "Nearby",
      availability: "available",
      responseTime: "15 mins",
      isOnline: true,
      rating: 4.8,
      reviews: 20,
      locationPolicy: "Technician visits customer location in Bangalore within 15km radius.",
      isActive: true,
    },
    {
      providerId: providerProfile._id,
      providerName: providerProfile.displayName,
      providerImage: providerProfile.profileImage,
      categoryId: categories[0]._id,
      categoryName: categories[0].name,
      title: "Emergency AC Repair",
      description: "Same-day fault diagnosis and repair for cooling, compressor and leakage issues.",
      pricing: 1699,
      images: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80",
      duration: "1.5 hours",
      features: ["Same-day visit", "Emergency support", "30-day workmanship warranty"],
      distance: "Nearby",
      availability: "busy",
      responseTime: "10 mins",
      isOnline: true,
      rating: 4.7,
      reviews: 16,
      locationPolicy: "Emergency visits are available in Bangalore urban limits.",
      isActive: true,
    },
    {
      providerId: providerProfile._id,
      providerName: providerProfile.displayName,
      providerImage: providerProfile.profileImage,
      categoryId: categories[0]._id,
      categoryName: categories[0].name,
      title: "Seasonal AC Maintenance Plan",
      description: "Quarterly maintenance plan for stable cooling performance through all seasons.",
      pricing: 899,
      images: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
      duration: "1 hour",
      features: ["Quarterly checkups", "Priority support", "Filter replacement guidance"],
      distance: "Nearby",
      availability: "available",
      responseTime: "25 mins",
      isOnline: true,
      rating: 4.6,
      reviews: 12,
      locationPolicy: "Plan available for homes within Bangalore and nearby areas.",
      isActive: true,
    },
  ]);

  providerProfile.services = services.map((service) => service._id);
  providerProfile.categories = [categories[0]._id];
  await providerProfile.save();

  const bookingSeed = [
    { monthOffset: 5, day: 4, status: "completed", amount: 1100, serviceIndex: 0, customerIndex: 0, note: "Dashboard seed booking - completed Jan" },
    { monthOffset: 4, day: 8, status: "completed", amount: 1600, serviceIndex: 1, customerIndex: 1, note: "Dashboard seed booking - completed Feb" },
    { monthOffset: 3, day: 12, status: "completed", amount: 900, serviceIndex: 2, customerIndex: 2, note: "Dashboard seed booking - completed Mar" },
    { monthOffset: 2, day: 16, status: "completed", amount: 1400, serviceIndex: 0, customerIndex: 3, note: "Dashboard seed booking - completed Apr" },
    { monthOffset: 1, day: 19, status: "completed", amount: 1250, serviceIndex: 0, customerIndex: 1, note: "Dashboard seed booking - completed May" },
    { monthOffset: 0, day: 4, status: "completed", amount: 1750, serviceIndex: 1, customerIndex: 0, note: "Dashboard seed booking - completed current" },
    { monthOffset: 0, day: 7, status: "confirmed", amount: 1199, serviceIndex: 0, customerIndex: 2, note: "Dashboard seed booking - active one" },
    { monthOffset: 0, day: 9, status: "in-progress", amount: 899, serviceIndex: 2, customerIndex: 3, note: "Dashboard seed booking - active two" },
    { monthOffset: 0, day: 11, status: "pending", amount: 1599, serviceIndex: 1, customerIndex: 1, note: "Dashboard seed booking - pending one" },
    { monthOffset: 0, day: 14, status: "pending", amount: 999, serviceIndex: 2, customerIndex: 0, note: "Dashboard seed booking - pending two" },
  ];

  const now = new Date();
  const bookings = [];

  for (const seed of bookingSeed) {
    const scheduledDate = new Date(now.getFullYear(), now.getMonth() - seed.monthOffset, seed.day);
    const booking = await Booking.create({
      customerProfileId: customerProfiles[seed.customerIndex]._id,
      providerProfileId: providerProfile._id,
      serviceId: services[seed.serviceIndex]._id,
      scheduled: {
        date: scheduledDate,
        time: "11:00 AM",
      },
      address: {
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        zipCode: "560001",
        street: "MG Road",
      },
      priceSnapshot: {
        totalAmount: seed.amount,
      },
      notes: seed.note,
      status: seed.status,
      createdAt: scheduledDate,
      updatedAt: scheduledDate,
    });

    bookings.push(booking);
  }

  const completedBookings = bookings.filter((booking) => booking.status === "completed");
  const reviewSeed = [5, 4, 5, 4, 5, 4];
  for (let index = 0; index < completedBookings.length; index += 1) {
    const booking = completedBookings[index];
    await Review.create({
      bookingId: booking._id,
      providerProfileId: providerProfile._id,
      customerProfileId: booking.customerProfileId,
      rating: reviewSeed[index] || 5,
      comment: `Dashboard seed review ${index + 1}: Great work and timely service.`,
    });
  }

  const allReviews = await Review.find({ providerProfileId: providerProfile._id });
  const average = allReviews.length
    ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
    : 0;

  providerProfile.ratingSummary = { avg: Number(average.toFixed(1)), count: allReviews.length };
  providerProfile.reviewCount = allReviews.length;
  await providerProfile.save();

  console.log(`Dashboard seed complete for provider ${providerProfile.displayName}. Services: ${services.length}, Bookings: ${bookings.length}, Reviews: ${allReviews.length}`);

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Dashboard seeding failed", error);
  await mongoose.connection.close();
  process.exit(1);
});
