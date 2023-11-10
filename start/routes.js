const AiValidationRoutes = require("../routes/AiValidationRoutes");
const LedgerRoute = require("../routes/LedgerRoute");
const AuthRoute = require("../routes/AuthRoute");
const BookmarkQuestRoute = require("../routes/BookmarkQuestRoute");
const SearchRoute = require("../routes/SearchRoute");

module.exports = function (app) {
    app.use("/", AiValidationRoutes)
    app.use("/", LedgerRoute)
    app.use("/user", AuthRoute)
    app.use("/bookmarkQuest", BookmarkQuestRoute)
    app.use("/infoquestions", InfoQuestQuestionRoute)
    app.use("/search", SearchRoute)
    // app.use(error);
  };