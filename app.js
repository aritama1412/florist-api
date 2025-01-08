require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Import cors
const sequelize = require("./config/database");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const userRoutes = require("./routes/userRoutes");
const saleRoutes = require("./routes/saleRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const authRoutes = require("./routes/authRoutes");
const verifyTokenMiddleware = require("./middleware/verifyToken");

const app = express();
// Enable CORS for all routes and all origins
app.use(cors()); // Allow all origins (not recommended for production)
app.use(express.json());
const PORT = process.env.PORT || 4000;

// Function to serve all static files
// inside public directory.
// app.use(express.static("public/uploads"));
app.use("/uploads", express.static("uploads"));

app.get("/test", (req, res) => {
  res.json({ message: "CORS is working for all origins!" });
});

// Use the routes for categories
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/suppliers", supplierRoutes);
app.use("/users", userRoutes);
app.use("/sales", saleRoutes);
app.use("/purchases", purchaseRoutes);
app.use("/auth", authRoutes);

// Sync the database and start the server
sequelize.sync({ force: false }).then(() => {
  console.log("Database connected and models synchronized.");

  app.listen(PORT, () => {
    console.log("Server is running on http://localhost:4000");
  });
});
