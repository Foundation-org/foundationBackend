const AiValidationRoutes = require("../routes/AiValidationRoutes");

module.exports = function (app) {
    app.use("/", AiValidationRoutes)
  
    // app.use(error);
  };