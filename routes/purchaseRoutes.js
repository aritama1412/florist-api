const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");

// Route for creating a purchase
router.post("/create", purchaseController.createPurchase);
router.patch("/edit", purchaseController.editPurchase);
router.get("/get-all-purchases", purchaseController.getAllPurchases);
router.get("/get-purchase", purchaseController.getPurchaseById);
// router.get("/check", purchaseController.checkTransaction);

module.exports = router;
