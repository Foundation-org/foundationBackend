var cron = require("node-cron");
const LedgerController = require("../controller/LedgerController");

module.exports = cronIntialize = () => {

  console.log("Cron initialized successfully");
  

  // */1 * * * * *  Run At every 2 second

  // Run every Monday at 12 PM
  cron.schedule("0 10 * * 1", () => {
    LedgerController.getLstActAndEmailForAllUsers()
  });
}

