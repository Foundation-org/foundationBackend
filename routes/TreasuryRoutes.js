const express = require("express");
const router = express.Router();
// controller
const TreasuryController = require("../controller/TreasuryController");
// middleware
const protect = require("../middleware/protect");

router.post("/create", TreasuryController.create);

router.patch("/update", TreasuryController.update);

router.get("/get", TreasuryController.get);

module.exports = router;
