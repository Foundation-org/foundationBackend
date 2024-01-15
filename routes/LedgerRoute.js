const express = require("express");
const router = express.Router();
// controller
const LedgerController = require("../controller/LedgerController");
// middleware
const protect = require("../middleware/protect");

router.post("/createLedger", LedgerController.create);

router.get("/getAllLedger", LedgerController.getAll);

router.get("/ledgerById", LedgerController.getById);

router.post("/searchLedger", LedgerController.search);

module.exports = router;
