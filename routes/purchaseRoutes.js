const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");

// Route for creating a purchase
router.post("/create", purchaseController.createPurchase);

module.exports = router;
