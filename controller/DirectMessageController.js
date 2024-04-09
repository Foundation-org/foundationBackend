const SendMessage = require("../models/SendMessage");
const ReceiveMessage = require("../models/ReceiveMessage");
const UserModel = require("../models/UserModel");
const { createLedger } = require("../utils/createLedger");
const {
  updateUserBalance,
  getUserBalance,
} = require("../utils/userServices");
const crypto = require("crypto");

const send = async (req, res) => {
  try {
    const { from, to, subject, message } = req.body;

    // check user exist Sender
    const senderUser = await UserModel.findOne({ email: from });
    if (!senderUser) throw new Error("No such User!");

    // check user exist Receiver
    const receiverUser = await UserModel.findOne({ email: to });
    if (!receiverUser) throw new Error("No such User!");

    // check user balance
    // const userBalance = await getUserBalance(req.body.uuid);
    // if (userBalance <= amount)
    //   throw new Error("Your balance is insufficient to create this redemption");
    // // Create Ledger
    // await createLedger({
    //   uuid: req.body.uuid,
    //   txUserAction: "redemptionCreated",
    //   txID: crypto.randomBytes(11).toString("hex"),
    //   txAuth: "DAO",
    //   txFrom: req.body.uuid,
    //   txTo: req.body.uuid,
    //   txAmount: amount,
    //   // txDescription : "User create redemption code"
    //   type: "redemption",
    // });
    // // Decrement the UserBalance
    // await updateUserBalance({
    //   uuid: req.body.uuid,
    //   amount: amount,
    //   dec: true,
    // });

    const sendMessage = await new SendMessage({ ...req.body });
    const savedSendMessage = await sendMessage.save();
    if (!savedSendMessage) throw new Error("Message Not Send Successfully!");

    const receiveMessage = await new ReceiveMessage({ sender: senderUser.uuid, receiver: receiverUser.uuid, shortMessage: message, subject, senderMessageId: savedSendMessage._id });
    const savedReceiveMessage = await receiveMessage.save();
    if (!savedReceiveMessage) throw new Error("Message Not Receive Successfully!");

     // update the sender Message
     savedSendMessage.unView = savedSendMessage.unView + 1;
     await savedSendMessage.save();

    res.status(201).json({ data: savedSendMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while send DirectMessage: ${error.message}`,
    });
  }
};

const getAllSend = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const uuid = req.params.uuid;

    const user = await UserModel.findOne({ uuid });

    const sendMessage = await SendMessage.find({ from: user.email }).sort({ _id: -1 });

    res.status(200).json({
      data: sendMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while getAllSend DirectMessage: ${error.message}`,
    });
  }
};

const getAllReceive = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const uuid = req.params.uuid;

    const user = await UserModel.findOne({ uuid });

    const receiveMessage = await ReceiveMessage.find({ receiver: uuid }).sort({ _id: -1 });

    res.status(200).json({
      data: receiveMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while getAllReceive DirectMessage: ${error.message}`,
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { receiver, _id } = req.body;
    // check receiver account exist
    const User = await UserModel.findOne({ uuid: receiver });
    if (!User) throw new Error("No such User!");

    //   Fetch the redeem data
    const receiveMessage = await ReceiveMessage.findOneAndDelete({ _id });
    if (!receiveMessage) throw new Error("Deletion failed!");

    res.status(200).json({ data: "", msg: "Successfully deleted!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while deleteMessage DirectMessage: ${error.message}`,
    });
  }
};


const view = async (req, res) => {
  try {
    const { sender, receiver, _id } = req.body;
    // check user exist Sender
    const senderUser = await UserModel.findOne({ uuid: sender });
    if (!senderUser) throw new Error("No such User!");

    // check user exist Receiver
    const receiverUser = await UserModel.findOne({ uuid: receiver });
    if (!receiverUser) throw new Error("No such User!");

    //   Fetch the receiveMessage data
    const receiveMessage = await ReceiveMessage.findOne({ _id });
    if (!receiveMessage) throw new Error("Message Not Found!");

    // check user balance
    // const userBalance = await getUserBalance(req.body.uuid);
    // if (userBalance <= amount)
    //   throw new Error("Your balance is insufficient to create this redemption");
    // // Create Ledger
    // await createLedger({
    //   uuid: req.body.uuid,
    //   txUserAction: "redemptionCreated",
    //   txID: crypto.randomBytes(11).toString("hex"),
    //   txAuth: "DAO",
    //   txFrom: req.body.uuid,
    //   txTo: req.body.uuid,
    //   txAmount: amount,
    //   // txDescription : "User create redemption code"
    //   type: "redemption",
    // });
    // // Decrement the UserBalance
    // await updateUserBalance({
    //   uuid: req.body.uuid,
    //   amount: amount,
    //   dec: true,
    // });

    // update the send Message
    const updatedSendMessage = await SendMessage.findOneAndUpdate({_id: receiveMessage.senderMessageId}, { $inc: { view: 1, unView: -1 }});
    if (!updatedSendMessage) throw new Error("Message Not Updated Successfully!");

    // update the receive Message
    receiveMessage.viewed = true;
    await receiveMessage.save();

    // const receiveMessage = await new ReceiveMessage({ sender: senderUser.uuid, receiver: receiverUser.uuid, shortMessage: message  });
    // const savedReceiveMessage = await receiveMessage.save();
    // if (!savedReceiveMessage) throw new Error("Message Not Receive Successfully!");

    res.status(201).json({ data: receiveMessage });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while view DirectMessage: ${error.message}`,
    });
  }
};

module.exports = {
    send,
    getAllSend,
    getAllReceive,
    view,
    deleteMessage
};
