const express = require("express");
const router = express.Router();
// controller
const UserQuestSettingController = require("../controller/UserQuestSettingController");
// middleware
const protect = require("../middleware/protect");
const socialProtect = require("../middleware/socialProtect");

router.post("/userQuestSetting/createOrUpdate", UserQuestSettingController.createOrUpdate);

router.post("/userQuestSetting/create", UserQuestSettingController.create);

router.post("/userQuestSetting/update", UserQuestSettingController.update);

router.post("/userQuestSetting/create", UserQuestSettingController.link);


module.exports = router;
