const express = require("express");
const router = express.Router();
// controller
const RedeemController = require("../controller/RedeemController");
// middleware
const protect = require("../middleware/protect");

router.post("/redeem/create", RedeemController.create);

router.post("/redeem/getById", RedeemController.getById);

module.exports = router;
