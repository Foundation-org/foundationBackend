const express = require("express");
const router = express.Router();
// controller
const AiValidationController = require("../controller/AiValidationController");
// middleware
const protect = require("../middleware/protect");
const cache = require("../middleware/cache");
const aiValidationModerator = require("../middleware/aiValidationModerator");

router.get(
  "/ai-validation/:callType",
  cache,
  // aiValidationModerator,
  AiValidationController.validation
);

module.exports = router;
