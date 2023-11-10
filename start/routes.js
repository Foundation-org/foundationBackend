const AiValidationRoutes = require("../routes/AiValidationRoutes");
const LedgerRoute = require("../routes/LedgerRoute");
const AuthRoute = require("../routes/AuthRoute");
const BookmarkQuestRoute = require("../routes/BookmarkQuestRoute");
const InfoQuestQuestionRoute = require("../routes/InfoQuestQuestionRoute");
const SearchRoute = require("../routes/SearchRoute");
const StartQuestRoute = require("../routes/StartQuestRoute");

module.exports = function (app) {
    app.use("/", AiValidationRoutes)
    app.use("/", LedgerRoute)
    app.use("/user", AuthRoute)
    app.use("/bookmarkQuest", BookmarkQuestRoute)
    app.use("/infoquestions", InfoQuestQuestionRoute)
    app.use("/search", SearchRoute)
    app.use("/startQuest", StartQuestRoute)
    // app.use(error);
  };