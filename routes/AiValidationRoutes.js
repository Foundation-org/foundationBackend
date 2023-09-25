const express = require("express");
const router = express.Router();
// controller
const AiValidationController = require("../controller/AiValidationController");
// middleware
const protect = require("../middleware/protect");
const cache = require("../middleware/cache");


router.get("/ai-validation/:callType", protect, cache, AiValidationController.validation);

module.exports = router;
