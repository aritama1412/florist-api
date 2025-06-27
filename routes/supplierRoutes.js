const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");

router.get("/get-all-suppliers", supplierController.getAllSupplier); // ✅ Get all
router.get("/get-supplier", supplierController.getSupplierById);
router.post("/create", supplierController.createSupplier); // ✅ Create a new
router.patch("/edit", supplierController.editSupplier); // ✅ Create a new
router.post("/delete", supplierController.deleteSupplier);

module.exports = router;
