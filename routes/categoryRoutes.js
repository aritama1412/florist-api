const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Routes for categories
router.get("/get-all-categories", categoryController.getAllCategories); // ✅ Get all categories
router.get("/get-category/:id", categoryController.getCategoryById);
router.get("/get-category-v2", categoryController.getCategoryByIdV2);
router.post("/create", categoryController.createCategory); // ✅ Create a new category

module.exports = router;
