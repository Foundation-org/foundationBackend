const AiValidationRoutes = require("../routes/AiValidationRoutes");
const LedgerRoute = require("../routes/LedgerRoute");
const TreasuryRoutes = require("../routes/TreasuryRoutes");
const AuthRoute = require("../routes/AuthRoute");
const BookmarkQuestRoute = require("../routes/BookmarkQuestRoute");
const InfoQuestQuestionRoute = require("../routes/InfoQuestQuestionRoute");
const SearchRoute = require("../routes/SearchRoute");
const StartQuestRoute = require("../routes/StartQuestRoute");
const BadgesRoutes = require("../routes/BadgesRoutes");

module.exports = function (app) {
    app.use("/", LedgerRoute)
    app.use("/", AiValidationRoutes)
    app.use("/", BadgesRoutes)
    app.use("/user", AuthRoute)
    app.use("/bookmarkQuest", BookmarkQuestRoute)
    app.use("/infoquestions", InfoQuestQuestionRoute)
    app.use("/search", SearchRoute)
    app.use("/startQuest", StartQuestRoute)
    app.use("/ledger",LedgerRoute)
    app.use("/treasury",TreasuryRoutes)
    // app.use(error);
  };