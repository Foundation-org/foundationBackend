const express = require("express");
const router = express.Router();
// controller
const LedgerController = require("../controller/LedgerController");
// middleware
const protect = require("../middleware/protect");


router.post("/createLedger", LedgerController.create);

// router.patch("/updateLedger/:id", LedgerController.update);

router.get("/getAllLedger", LedgerController.getAll);

router.get("/ledgerById", LedgerController.getById);

router.post("/searchLedger",LedgerController.search);

// router.delete("/deleteLedger/:id", LedgerController.remove);

module.exports = router;
