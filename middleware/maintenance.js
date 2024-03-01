const { MAINTENANCE, FRONTEND_URL } = require("../config/env");

module.exports = function (req, res, next) {
  if (false) {
    res.redirect(`${FRONTEND_URL}/maintenance`);
  } else {
    next();
  }
};
