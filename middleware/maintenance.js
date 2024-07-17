const { MAINTENANCE, FRONTEND_URL } = require("../config/env");

module.exports = function (req, res, next) {
  if (false) {
    res.status(503); // Service Unavailable
    res.render('maintenance', { title: 'Site Under Maintenance' });
  } else {
    next();
  }
};
