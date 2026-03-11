import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import errorHandler from "./MIDDLEWARES/error.middlewares.js";


// imports all router

import userRouter from './ROUTERS/user.routes.js';
import loginRouter from './ROUTERS/login.routes.js';
import registerRouter from './ROUTERS/register.routes.js';
import categoriesRouter from './ROUTERS/categories.routes.js';
import servicesRouter from './ROUTERS/services.routes.js';
import serviceCategoriesRouter from './ROUTERS/service_categories.routes.js';
import providerProfilesRouter from './ROUTERS/provider_profiles.routes.js';
import customerProfilesRouter from './ROUTERS/customer_profiles.routes.js';
import bookingsRouter from './ROUTERS/booking.routes.js';
import conversationsRouter from './ROUTERS/conversations.routes.js';
import messagesRouter from './ROUTERS/message.routes.js';
import notificationsRouter from './ROUTERS/notification.routes.js';
import paymentsRouter from './ROUTERS/payments.routes.js';
import payoutsRouter from './ROUTERS/payouts.routes.js';
import reviewsRouter from './ROUTERS/review.routes.js';
import availabilitiesRouter from './ROUTERS/availabilities.routes.js';
import providerSchedulesRouter from './ROUTERS/provider_schedules.routes.js';
import complaintsRouter from './ROUTERS/complaints.routes.js';
import adminActionsRouter from './ROUTERS/admin_actions.routes.js';



dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);


// Middlewares

app.use(express.json({limit: '16kb'}));

app.use(express.urlencoded({ extended: true, limit: '16kb' }));    

app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
}));

app.use(helmet());

app.use(cookieParser());

app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
}));

// Routes 


app.use("/api/v1/auth/register", registerRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", loginRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/services", servicesRouter);
app.use("/api/v1/service-categories", serviceCategoriesRouter);
app.use("/api/v1/provider-profiles", providerProfilesRouter);
app.use("/api/v1/customer-profiles", customerProfilesRouter);
app.use("/api/v1/bookings", bookingsRouter);
app.use("/api/v1/conversations", conversationsRouter);
app.use("/api/v1/messages", messagesRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/payouts", payoutsRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/availabilities", availabilitiesRouter);
app.use("/api/v1/provider-schedules", providerSchedulesRouter);
app.use("/api/v1/complaints", complaintsRouter);
app.use("/api/v1/admin", adminActionsRouter);


// health check route

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

export default app;
