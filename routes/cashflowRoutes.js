const express = require("express");
const router = express.Router();
const cashflowController = require("../controllers/cashflowController");

router.get("/get-cashflow", cashflowController.getCashflow);

module.exports = router;
