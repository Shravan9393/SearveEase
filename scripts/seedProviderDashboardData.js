import fs from "fs";
import path from "path";
import connectDB from "../BACKEND/src/DB/index.js";
import { User } from "../BACKEND/src/MODELS/users.models.js";
import { ProviderProfile } from "../BACKEND/src/MODELS/provider_profiles.models.js";
import { CustomerProfile } from "../BACKEND/src/MODELS/customer_profiles.models.js";
import Category from "../BACKEND/src/MODELS/categories.models.js";
import Service from "../BACKEND/src/MODELS/services.models.js";
import Booking from "../BACKEND/src/MODELS/booking.models.js";
import Review from "../BACKEND/src/MODELS/review.models.js";

const rootEnvPath = path.resolve("./.env");
const backendEnvPath = path.resolve("./BACKEND/.env");
const backendSrcEnvPath = path.resolve("./BACKEND/src/.env");

const envPath = [rootEnvPath, backendEnvPath, backendSrcEnvPath].find((candidate) => fs.existsSync(candidate));
if (envPath) {
  const raw = fs.readFileSync(envPath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) return;
    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^"|"$/g, "");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
}

const providerSeed = {
  userName: "provider_dashboard_demo",
  fullName: "Aarav Electric Works",
  email: "provider.dashboard.demo@serveease.com",
  password: "Password@123",
};

const customerSeeds = [
  { userName: "demo_customer_1", fullName: "Rahul Sharma", email: "rahul.dashboard@serveease.com", password: "Password@123", city: "Bangalore", state: "Karnataka" },
  { userName: "demo_customer_2", fullName: "Priya Mehta", email: "priya.dashboard@serveease.com", password: "Password@123", city: "Bangalore", state: "Karnataka" },
  { userName: "demo_customer_3", fullName: "Amit Kumar", email: "amit.dashboard@serveease.com", password: "Password@123", city: "Bangalore", state: "Karnataka" },
];

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
    category = await Category.create({ name, slug, description, popular: true, isActive: true });
  }
  return category;
};

const run = async () => {
  await connectDB();

  const electricCategory = await getOrCreateCategory("Electrical", "Electrical maintenance and repair services");

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

  let providerProfile = await ProviderProfile.findOne({ userId: providerUser._id });
  if (!providerProfile) {
    providerProfile = await ProviderProfile.create({
      userId: providerUser._id,
      businessName: "Aarav Electric Works",
      displayName: "Aarav Electric Works",
      phone: "9876501111",
      description: "Certified electrician for residential and office maintenance.",
      location: { city: "Bangalore", state: "Karnataka" },
      pricing: { starting: 499, currency: "₹" },
      yearsOfExperience: 6,
      availability: "available",
      responseTime: "20 mins",
      verified: true,
      categories: [electricCategory._id],
    });
  }

  const servicePayload = [
    {
      providerId: providerProfile._id,
      providerName: providerProfile.displayName,
      providerImage: providerProfile.profileImage,
      categoryName: "Electrical",
      categoryId: electricCategory._id,
      title: "Home Electrical Repair",
      description: "Switchboard, wiring and light fixture repairs at your location.",
      pricing: 699,
      duration: "1-2 hours",
      features: ["Same-day visit", "Safety inspection", "Warranty on workmanship"],
      rating: 4.8,
      reviews: 142,
      locationPolicy: "On-site service within Bangalore city limits",
      availability: "available",
      responseTime: "20 mins",
      isOnline: true,
      isActive: true,
    },
    {
      providerId: providerProfile._id,
      providerName: providerProfile.displayName,
      providerImage: providerProfile.profileImage,
      categoryName: "Electrical",
      categoryId: electricCategory._id,
      title: "Emergency Power Fix",
      description: "Urgent troubleshooting for outages and tripping breakers.",
      pricing: 999,
      duration: "45-90 mins",
      features: ["Priority response", "Spare part support", "24x7 availability"],
      rating: 4.6,
      reviews: 88,
      locationPolicy: "Emergency service in Bangalore within 12km radius",
      availability: "busy",
      responseTime: "10 mins",
      isOnline: true,
      isActive: true,
    },
  ];

  const existingServices = await Service.find({ providerId: providerProfile._id, title: { $in: servicePayload.map((s) => s.title) } });
  const existingTitleMap = new Map(existingServices.map((s) => [s.title, s]));

  const services = [];
  for (const payload of servicePayload) {
    if (existingTitleMap.has(payload.title)) {
      services.push(existingTitleMap.get(payload.title));
      continue;
    }
    const created = await Service.create(payload);
    services.push(created);
  }

  providerProfile.services = services.map((service) => service._id);
  providerProfile.reviewCount = 0;
  await providerProfile.save();

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
        location: { city: customer.city, state: customer.state },
      });
    }
    customerProfiles.push(profile);
  }

  await Booking.deleteMany({ providerProfileId: providerProfile._id });
  await Review.deleteMany({ providerProfileId: providerProfile._id });

  const now = new Date();
  const bookingPayload = [
    { customerProfileId: customerProfiles[0]._id, serviceId: services[0]._id, status: "completed", amount: 699, offsetDays: 2 },
    { customerProfileId: customerProfiles[1]._id, serviceId: services[0]._id, status: "completed", amount: 799, offsetDays: 8 },
    { customerProfileId: customerProfiles[2]._id, serviceId: services[1]._id, status: "completed", amount: 1099, offsetDays: 17 },
    { customerProfileId: customerProfiles[0]._id, serviceId: services[1]._id, status: "confirmed", amount: 999, offsetDays: 0 },
    { customerProfileId: customerProfiles[1]._id, serviceId: services[0]._id, status: "in-progress", amount: 699, offsetDays: 1 },
    { customerProfileId: customerProfiles[2]._id, serviceId: services[0]._id, status: "pending", amount: 699, offsetDays: 0 },
    { customerProfileId: customerProfiles[0]._id, serviceId: services[1]._id, status: "pending", amount: 999, offsetDays: 0 },
  ];

  const bookings = [];
  for (const payload of bookingPayload) {
    const date = new Date(now);
    date.setDate(date.getDate() - payload.offsetDays);
    const booking = await Booking.create({
      customerProfileId: payload.customerProfileId,
      providerProfileId: providerProfile._id,
      serviceId: payload.serviceId,
      scheduled: { date, time: "10:30" },
      address: { city: "Bangalore", state: "Karnataka", country: "India", zipCode: "560001", street: "MG Road" },
      priceSnapshot: { totalAmount: payload.amount },
      notes: "Seeded booking for provider dashboard",
      status: payload.status,
    });
    bookings.push(booking);
  }

  await Review.insertMany([
    {
      bookingId: bookings[0]._id,
      providerProfileId: providerProfile._id,
      customerProfileId: customerProfiles[0]._id,
      rating: 5,
      comment: "Very professional and fast service.",
    },
    {
      bookingId: bookings[1]._id,
      providerProfileId: providerProfile._id,
      customerProfileId: customerProfiles[1]._id,
      rating: 4,
      comment: "Good service quality and polite behavior.",
    },
    {
      bookingId: bookings[2]._id,
      providerProfileId: providerProfile._id,
      customerProfileId: customerProfiles[2]._id,
      rating: 5,
      comment: "Excellent emergency support.",
    },
  ]);

  providerProfile.reviewCount = 3;
  providerProfile.ratingSummary = { avg: 4.7, count: 3 };
  await providerProfile.save();

  console.log("Provider dashboard seed completed.");
  console.log(`Provider login email: ${providerSeed.email}`);
  console.log(`Provider login password: ${providerSeed.password}`);

  process.exit(0);
};

run().catch(async (error) => {
  console.error("Failed to seed provider dashboard data", error);
  process.exit(1);
});
