const express = require("express");
const router = express.Router();
const saleController = require("../controllers/saleController");

router.post("/create", saleController.createSale);
router.patch("/edit", saleController.editSale);
router.get("/get-all-sales", saleController.getAllSales);
router.get("/get-sale", saleController.getSaleById);
router.get("/check", saleController.checkTransaction);
router.get("/get-sales-per-month", saleController.getSalesPerMonth);
router.get("/get-product-sales", saleController.getProductSales);
router.get("/get-low-stock-products", saleController.lowStockProducts);

module.exports = router;
