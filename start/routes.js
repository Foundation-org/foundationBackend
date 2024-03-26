const AiValidationRoutes = require("../routes/AiValidationRoutes");
const LedgerRoute = require("../routes/LedgerRoute");
const TreasuryRoutes = require("../routes/TreasuryRoutes");
const AuthRoute = require("../routes/AuthRoute");
const BookmarkQuestRoute = require("../routes/BookmarkQuestRoute");
const InfoQuestQuestionRoute = require("../routes/InfoQuestQuestionRoute");
const SearchRoute = require("../routes/SearchRoute");
const QuestTopicRoute=require("../routes/QuestTopicRoute")
const StartQuestRoute = require("../routes/StartQuestRoute");
const BadgesRoutes = require("../routes/BadgesRoutes");
const UserQuestSettingRoute = require("../routes/UserQuestSettingRoute");
const PassportRoutes = require("../routes/PassportRoutes");
const RedeemRoute = require("../routes/RedeemRoute");
const isUnderMaintenance = require("../middleware/maintenance");

module.exports = function (app) {
    app.use("/",isUnderMaintenance, LedgerRoute)
    app.use("/",isUnderMaintenance, AiValidationRoutes)
    app.use("/",isUnderMaintenance, BadgesRoutes)
    app.use("/",isUnderMaintenance, UserQuestSettingRoute)
    app.use("/",isUnderMaintenance, RedeemRoute)
    app.use("/user",isUnderMaintenance, AuthRoute)
    app.use("/bookmarkQuest",isUnderMaintenance, BookmarkQuestRoute)
    app.use("/infoquestions",isUnderMaintenance, InfoQuestQuestionRoute)
    app.use("/search",isUnderMaintenance, SearchRoute)
    app.use("/preferences",isUnderMaintenance, QuestTopicRoute)
    app.use("/startQuest",isUnderMaintenance, StartQuestRoute)
    app.use("/ledger",isUnderMaintenance,LedgerRoute)
    app.use("/treasury",isUnderMaintenance,TreasuryRoutes)
    app.use("/auth",isUnderMaintenance,PassportRoutes)
    // app.use(error);
  };