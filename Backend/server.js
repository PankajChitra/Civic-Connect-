const express  = require("express");
const cors     = require("cors");
const dotenv   = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

// Start escalation cron AFTER DB connects
const { startEscalationCron } = require("./services/escalationService");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://civic-connect-4w0n.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.options('*', cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api/auth",   require("./routes/authRoutes"));
app.use("/api/issues", require("./routes/issueRoutes"));

app.get("/", (_, res) => res.json({ message: "CivicConnect API v2 ✅" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
  startEscalationCron();
});