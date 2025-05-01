const Category = require("../models/Category");

// ✅ Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    // insert id_category=0, name=Semua Kategori, status=1 
    categories.unshift({ id_category: 0, name: "Semua Kategori", status: "1" });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCategoryByIdV2 = async (req, res) => {
  try {
    const { id } = req.query; // Get ID from query parameters
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Create a new category
const createCategory = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Check if 'name' is provided and is not empty
    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ status: "error", message: "Category name is required" });
    }

    // Check if 'status' is valid (either '0' or '1')
    if (status && !["0", "1"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status value. Use '0' or '1'",
      });
    }

    // Create the new category
    const category = await Category.create({
      name,
      status: status || "1", // Default to '1' if no status is provided
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Export the controller functions
module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryByIdV2,
  createCategory,
};
