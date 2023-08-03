const route = require("express").Router();

const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// SIGN UP
route.post("/signUpUser", async (req, res) => {
  try {
    // const alreadyUser = await User.findOne({ email: req.body.userEmail });
    // alreadyUser && res.status(404).json("Email Already Exists");

    const uuid = crypto.randomBytes(11).toString("hex");
    console.log(uuid);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.userPassword, salt);
    const user = await new User({
      email: req.body.userEmail,
      password: hashPassword,
      uuid: uuid,
    });
    const users = await user.save();
    !users && res.status(404).send("Not Created 1");

    res.status(200).json(user);


  } catch (err) {
    res.status(500).send("Not Created 2");
  }
});

// SIGN IN
route.post("/signInUser", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("User not Found");

    const compPass = await bcrypt.compare(req.body.password, user.password);
    !compPass && res.status(400).json("Wrong Password");

    res.status(200).json(user);
    // res.status(201).send("Signed in Successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});

route.post("/userInfo", async (req, res) => {
  try {
    const user = await User.findOne({ uuid: req.body.uuid });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

route.put("/setUserWallet", async (req, res) => {
  try {
    // Load the document
    const doc = await User.findOne({ uuid: req.body.uuid });

    // Update the document using `Document#updateOne()`
    // Equivalent to `CharacterModel.updateOne({ _id: doc._id }, update)`
    const update = { walletAddr: req.body.walletAddr };
    await doc.updateOne(update);

    res.status(201).send("Wallet Updated");
  } catch (err) {
    res.status(500).send("Wallet Not Updated");
  }
});

route.put("/signedUuid", async (req, res) => {
  try {
    // Load the document
    const doc = await User.findOne({ uuid: req.body.uuid });

    // Update the document using `Document#updateOne()`
    // Equivalent to `CharacterModel.updateOne({ _id: doc._id }, update)`
    const update = { signedUuid: req.body.signedUuid, metamaskVerified: true };
    await doc.updateOne(update);

    res.status(201).send("Updated");
  } catch (err) {
    res.status(500).send("Not Updated");
  }
});

// send email

route.post("/sendVerifyEmail", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // console.log("user", user);
    !user && res.status(404).json("User not Found");

    const verificationTokenFull = jwt.sign(
      { ID: user._id },
      process.env.USER_VERIFICATION_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const verificationToken = verificationTokenFull.substr(
      verificationTokenFull.length - 6
    );

    // const verificationToken = user.generateVerificationToken();
    console.log("verificationToken", verificationToken);

    // Step 3 - Email the user a unique verification link
    const url = `http://localhost:3000/VerifyCode?${verificationTokenFull}`;
    // console.log("url", url);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: req.body.email,
      //   to: "abdullahyaqoob380@gmail.com",
      subject: "Verify Account",
      html: `Click <a href = '${url}'>here</a> to confirm your email <br /> <br /> <br />
        And confirm this code <b>${verificationToken}</b> from the App`,
      //   html: `Please Copy the code and Paste in App <b>${verificationToken}</b>`,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email sent: " + info.response);
      }
    });

    return res.status(201).send({
      message: `Sent a verification email to ${email}`,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Verify IN
route.post("/verify", async (req, res) => {
  const verificationCode = req.body.verificationCode;
  const token = req._parsedUrl.query;

  if (verificationCode !== token.substr(token.length - 6)) {
    return res.status(422).send({
      message: "Invalid Verification Code",
    });
  }

  // Check we have an id
  if (!token) {
    return res.status(422).send({
      message: "Missing Token",
    });
  }

  // Step 1 -  Verify the token from the URL
  let payload = null;
  try {
    payload = jwt.verify(token, process.env.USER_VERIFICATION_TOKEN_SECRET);
  } catch (err) {
    return res.status(500).send(err);
  }

  try {
    // Step 2 - Find user with matching ID
    const user = await User.findOne({ _id: payload.ID }).exec();
    if (!user) {
      return res.status(404).send({
        message: "User does not  exists",
      });
    }

    // Step 3 - Update user verification status to true
    user.gmailVerified = true;
    await user.save();
    return res.status(200).send({
      message: "Gmail Account verified",
    });
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = route;
