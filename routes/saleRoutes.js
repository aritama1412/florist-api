const express = require("express");
const router = express.Router();
const saleController = require("../controllers/saleController");

router.post("/create", saleController.createSale);
router.patch("/edit", saleController.editSale);
router.get("/get-all-sales", saleController.getAllSales);
router.get("/get-sale", saleController.getSaleById);
router.get("/check", saleController.checkTransaction);

module.exports = router;
