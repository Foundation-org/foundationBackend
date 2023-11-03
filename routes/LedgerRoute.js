const express = require("express");
const router = express.Router();
// controller
const LedgerController = require("../controller/LedgerController");
// middleware
const protect = require("../middleware/protect");


router.post("/ledger", LedgerController.create);

// router.patch("/ledger/:id", LedgerController.update);

// router.get("/ledger", LedgerController.getAll);

// router.get("/ledger/:id", LedgerController.getById);

router.delete("/ledger/:id", LedgerController.remove);

module.exports = router;
