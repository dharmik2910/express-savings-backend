const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const multer = require("multer");

const app = express();

// Render sits behind a proxy; needed so the rate limiter sees the real client IP
app.set("trust proxy", 1);

// Only the pharmacy website may call the API. Override with ALLOWED_ORIGINS (comma-separated).
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  "https://expresssavingspharmacy.com,https://www.expresssavingspharmacy.com,http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "100kb" }));

// 5 form submissions per IP per 10 minutes (override with RATE_LIMIT_MAX for local testing)
const mailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX) || 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again in a few minutes or call us." },
});

app.use("/api/mail", mailLimiter, require("./routes/mail.routes"));

app.get("/", (req, res) => {
  res.send("Backend Running");
});

// Return JSON for bad JSON bodies and upload errors instead of Express's HTML error page
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 10 MB)" : err.message;
    return res.status(400).json({ message });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid request body" });
  }
  if (err.status === 400) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

module.exports = app;
