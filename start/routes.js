const AiValidationRoutes = require("../routes/AiValidationRoutes");
const LedgerRoute = require("../routes/LedgerRoute");

module.exports = function (app) {
    app.use("/", AiValidationRoutes)
    app.use("/", LedgerRoute)
  
    // app.use(error);
  };