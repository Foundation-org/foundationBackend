const express = require("express");
const router = express.Router();
// controller
const RedeemController = require("../controller/RedeemController");
// middleware
const protect = require("../middleware/protect");

router.post("/redeem/create", RedeemController.create);

router.post("/redeem/transfer", RedeemController.transfer);

router.get(
  "/redeem/getUnredeemedById/:id/:uuid",
  RedeemController.getUnredeemedById
);

router.get(
  "/redeem/getRedeemHistoryById/:id/:uuid",
  RedeemController.getRedeemHistoryById
);

module.exports = router;
