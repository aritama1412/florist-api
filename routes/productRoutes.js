const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Routes for products
router.get("/get-all-products", productController.getAllProducts); // ✅ Get all
router.get("/get-all-products-admin", productController.getAllProductsAdmin); // ✅ Get all
router.get("/get-product", productController.getProductById);
// router.post("/create", productController.createProduct); // ✅ Create a new
router.post(
  "/create",
  productController.upload.array("images", 5),
  productController.createProduct
);

router.post(
  "/edit",
  productController.upload.array("images", 5),
  productController.editProduct
);

module.exports = router;
