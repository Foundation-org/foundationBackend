const express = require("express");
const router = express.Router();
// controller
const DirectMessageController = require("../controller/DirectMessageController");
// middleware
const protect = require("../middleware/protect");

router.post("/directMessage/send", DirectMessageController.send);

router.get("/directMessage/getAllSend/:uuid", DirectMessageController.getAllSend);

router.get("/directMessage/getAllReceive/:uuid", DirectMessageController.getAllReceive);

router.post("/directMessage/view", DirectMessageController.view);

router.delete("/directMessage/delete", DirectMessageController.deleteMessage);

router.post("/directMessage/trash", DirectMessageController.trashMessage);

router.post("/directMessage/restore", DirectMessageController.restoreMessage);

router.get("/directMessage/getAllDeletedMessage/:uuid", DirectMessageController.getAllDeletedMessage);


module.exports = router;
