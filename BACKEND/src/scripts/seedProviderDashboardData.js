import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "../DB/index.js";
import { User } from "../MODELS/users.models.js";
import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
import { CustomerProfile } from "../MODELS/customer_profiles.models.js";
import Category from "../MODELS/categories.models.js";
import Service from "../MODELS/services.models.js";
import Booking from "../MODELS/booking.models.js";
import Review from "../MODELS/review.models.js";

/* ----------------------------------
   Load .env properly
---------------------------------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This points to BACKEND/src/.env
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

/* ----------------------------------
   Seed data
---------------------------------- */

const providerSeed = {
  userName: "provider_dashboard_demo",
  fullName: "Aarav Electric Works",
  email: "provider.dashboard.demo@serveease.com",
  password: "Password@123",
};

const customerSeeds = [
  {
    userName: "demo_customer_1",
    fullName: "Rahul Sharma",
    email: "rahul.dashboard@serveease.com",
    password: "Password@123",
    city: "Bangalore",
    state: "Karnataka",
  },
  {
    userName: "demo_customer_2",
    fullName: "Priya Mehta",
    email: "priya.dashboard@serveease.com",
    password: "Password@123",
    city: "Bangalore",
    state: "Karnataka",
  },
  {
    userName: "demo_customer_3",
    fullName: "Amit Kumar",
    email: "amit.dashboard@serveease.com",
    password: "Password@123",
    city: "Bangalore",
    state: "Karnataka",
  },
];

/* ----------------------------------
   Helpers
---------------------------------- */

const buildSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getOrCreateCategory = async (name, description) => {
  const slug = buildSlug(name);

  let category = await Category.findOne({ slug });

  if (!category) {
    category = await Category.create({
      name,
      slug,
      description,
      popular: true,
      isActive: true,
    });
  }

  return category;
};

/* ----------------------------------
   Seed Runner
---------------------------------- */

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  await connectDB();

  const electricCategory = await getOrCreateCategory(
    "Electrical",
    "Electrical maintenance and repair services"
  );

  /* ---------- Provider ---------- */

  let providerUser = await User.findOne({ email: providerSeed.email });

  if (!providerUser) {
    providerUser = await User.create({
      userName: providerSeed.userName,
      fullName: providerSeed.fullName,
      email: providerSeed.email,
      password: providerSeed.password,
      role: "provider",
    });
  }

  let providerProfile = await ProviderProfile.findOne({
    userId: providerUser._id,
  });

  if (!providerProfile) {
    providerProfile = await ProviderProfile.create({
      userId: providerUser._id,
      businessName: "Aarav Electric Works",
      displayName: "Aarav Electric Works",
      phone: "9876501111",
      description:
        "Certified electrician for residential and office maintenance.",
      location: { city: "Bangalore", state: "Karnataka" },
      pricing: { starting: 499, currency: "₹" },
      yearsOfExperience: 6,
      availability: "available",
      responseTime: "20 mins",
      verified: true,
      categories: [electricCategory._id],
    });
  }

  /* ---------- Services ---------- */

  const servicePayload = [
    {
      providerId: providerProfile._id,
      providerName: providerProfile.displayName,
      categoryName: "Electrical",
      categoryId: electricCategory._id,
      title: "Home Electrical Repair",
      description:
        "Switchboard, wiring and light fixture repairs at your location.",
      pricing: 699,
      duration: "1-2 hours",
      rating: 4.8,
      reviews: 142,
      isOnline: true,
      isActive: true,
    },
    {
      providerId: providerProfile._id,
      providerName: providerProfile.displayName,
      categoryName: "Electrical",
      categoryId: electricCategory._id,
      title: "Emergency Power Fix",
      description: "Urgent troubleshooting for outages and tripping breakers.",
      pricing: 999,
      duration: "45-90 mins",
      rating: 4.6,
      reviews: 88,
      isOnline: true,
      isActive: true,
    },
  ];

  const services = [];

  for (const payload of servicePayload) {
    let existing = await Service.findOne({
      providerId: providerProfile._id,
      title: payload.title,
    });

    if (!existing) {
      existing = await Service.create(payload);
    }

    services.push(existing);
  }

  providerProfile.services = services.map((s) => s._id);
  await providerProfile.save();

  /* ---------- Customers ---------- */

  const customerProfiles = [];

  for (const customer of customerSeeds) {
    let user = await User.findOne({ email: customer.email });

    if (!user) {
      user = await User.create({
        userName: customer.userName,
        fullName: customer.fullName,
        email: customer.email,
        password: customer.password,
        role: "customer",
      });
    }

    let profile = await CustomerProfile.findOne({ userId: user._id });

    if (!profile) {
      profile = await CustomerProfile.create({
        userId: user._id,
        fullName: customer.fullName,
        phone: "9876502222",
        location: {
          city: customer.city,
          state: customer.state,
        },
      });
    }

    customerProfiles.push(profile);
  }

  /* ---------- Bookings ---------- */

  await Booking.deleteMany({ providerProfileId: providerProfile._id });

  const now = new Date();

  const booking = await Booking.create({
    customerProfileId: customerProfiles[0]._id,
    providerProfileId: providerProfile._id,
    serviceId: services[0]._id,
    scheduled: { date: now, time: "10:30" },
    address: {
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      zipCode: "560001",
      street: "MG Road",
    },
    priceSnapshot: { totalAmount: 699 },
    status: "completed",
  });

  /* ---------- Reviews ---------- */

  await Review.create({
    bookingId: booking._id,
    providerProfileId: providerProfile._id,
    customerProfileId: customerProfiles[0]._id,
    rating: 5,
    comment: "Very professional and fast service.",
  });

  console.log("Provider dashboard seed completed");
  console.log(`Provider login email: ${providerSeed.email}`);
  console.log(`Provider login password: ${providerSeed.password}`);

  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});