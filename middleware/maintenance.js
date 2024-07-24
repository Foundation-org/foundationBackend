const { MAINTENANCE, FRONTEND_URL } = require("../config/env");

module.exports = function (req, res, next) {
  if (true) {
    res.status(503); // Service Unavailable
  } else {
    next();
  }
};
