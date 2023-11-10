const AiValidationRoutes = require("../routes/AiValidationRoutes");
const LedgerRoute = require("../routes/LedgerRoute");
const AuthRoute = require("../routes/AuthRoute");

module.exports = function (app) {
    app.use("/", AiValidationRoutes)
    app.use("/", LedgerRoute)
    app.use("/user", AuthRoute)
    // app.use("/user", AuthRoute)
    
    // app.use(error);
  };