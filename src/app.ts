import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import passport from "passport";
import "./passport/googleStrategy.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "60kb" }));
app.use(express.urlencoded({ extended: true, limit: "60kb" }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(passport.initialize());

app.get("/api/v1/checkme", (req, res) => {
  return res.status(201).json({ message: "hello server" });
});

app.use("/api/v1/auth", authRoutes);

export default app;
