const { MAINTENANCE, FRONTEND_URL } = require("../config/env");

module.exports = function (req, res, next) {
  if (false) {
    res.status(503); // Service Unavailable
  } else {
    next();
  }
};
