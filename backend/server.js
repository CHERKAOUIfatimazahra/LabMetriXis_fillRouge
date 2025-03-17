const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const path = require("path");
const authRoutes = require("./routes/auth/authRoutes");
const projectRoutes = require("./routes/project/projectRoutes");
const statisticsRoutes = require("./routes/project/statisticsRoutes");
const contactusRoutes = require("./routes/contactRoute");
const samplesRoutes = require("./routes/samples/samplesRoutes");
const notificationRoute = require("./routes/notificationRoutes")
const cors = require("cors");

const app = express();
dotenv.config();
connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Middleware pour traiter les requêtes JSON
app.use(express.json());

// Middleware pour servir les fichiers du dossier 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/project", projectRoutes);
app.use("/statistic", statisticsRoutes);
app.use("/contactus", contactusRoutes);
app.use("/samples", samplesRoutes);
app.use("/notification", notificationRoute)


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});