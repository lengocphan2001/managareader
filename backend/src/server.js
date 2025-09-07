const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const commentRoutes = require("./routes/comment");
const seriesRoutes = require("./routes/series");
const adminRoutes = require("./routes/admin");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 8000;

// Trust proxy for rate limiting behind Nginx
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from uploads directory
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public", "uploads")),
);

// Health check endpoints
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// MangaDex API proxy route
const { createProxyMiddleware } = require("http-proxy-middleware");

const mangadexProxy = createProxyMiddleware({
  target: "https://api.mangadex.org",
  changeOrigin: true,
  pathRewrite: {
    "^/api/mangadex": "",
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader("User-Agent", "TruyenDex/1.0.0");
    console.log(
      `Proxying MangaDex: ${req.method} ${req.url} -> https://api.mangadex.org${req.url.replace("/api/mangadex", "")}`,
    );
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to the response
    proxyRes.headers["Access-Control-Allow-Origin"] =
      req.headers.origin || "https://ninetails.site";
    proxyRes.headers["Access-Control-Allow-Methods"] =
      "GET, POST, PUT, DELETE, OPTIONS";
    proxyRes.headers["Access-Control-Allow-Headers"] =
      "Content-Type, Authorization, X-Requested-With";
    proxyRes.headers["Access-Control-Allow-Credentials"] = "true";
    proxyRes.headers["Access-Control-Max-Age"] = "86400";
  },
  onError: (err, req, res) => {
    console.error("MangaDex proxy error:", err);
    res.status(500).json({
      error: "MangaDex proxy error occurred",
      details: err.message,
      timestamp: new Date().toISOString(),
    });
  },
});

app.use("/api/mangadex", mangadexProxy);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/series", seriesRoutes);
app.use("/api/admin", adminRoutes);

// CSRF cookie endpoint (for Laravel Sanctum compatibility)
app.get("/api/sanctum/csrf-cookie", (req, res) => {
  res.json({ message: "CSRF cookie set" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TruyenDex Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:3000"}`,
  );
});

module.exports = app;
