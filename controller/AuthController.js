const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
const AWS = require("aws-sdk")
const crypto = require("crypto");
const { createToken } = require("../service/auth");
const { createLedger } = require("../utils/createLedger");
const { isGoogleEmail } = require("../utils/checkGoogleAccount");
const { createTreasury, getTreasury, updateTreasury } = require("../utils/treasuryService");


const changePassword = async (req, res) => {
    try {
      const user = await User.findOne({ uuid: req.body.uuid });
      !user && res.status(404).json("User not Found");
  
      const currentPasswordValid = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!currentPasswordValid) {
         return res.status(400).json({ error: "Current password is incorrect" });
         
      }
  
      const salt = await bcrypt.genSalt(10);
      const newHashedPassword = await bcrypt.hash(req.body.newPassword, salt);
  
      // Update the user's password
      user.password = newHashedPassword;
      await user.save();
      // Create Ledger
      await createLedger(
      {
        uuid : user.uuid,
        txUserAction : "accountPasswordChange",
        txID : crypto.randomBytes(11).toString("hex"),
        txAuth : "User",
        txFrom : user.uuid,
        txTo : "dao",
        txAmount : "0",
        txData : user.uuid,
        // txDescription : "User changes password"
      })
  
      res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: `An error occurred while changePassword Auth: ${error.message}` });
    }
  }

const signUpUser = async (req, res) => {
  try {
    const alreadyUser = await User.findOne({ email: req.body.userEmail });
    if(alreadyUser) throw new Error("Email Already Exists");

    const checkGoogleEmail = await isGoogleEmail(req.body.userEmail)
    if(checkGoogleEmail) throw new Error("Please Signup with Google Account")

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
    if(!users) throw new Error("User not Created");

    // Generate a JWT token
    const token = createToken({ uuid: user.uuid });

    // Create Ledger
    await createLedger(
      {
        uuid : uuid,
        txUserAction : "accountCreated",
        txID : crypto.randomBytes(11).toString("hex"),
        txAuth : "User",
        txFrom : uuid,
        txTo : "dao",
        txAmount : "0",
        txData : uuid,
        // txDescription : "User creates a new account"
      }
    )

    res.status(200).json({ ...user._doc, token });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: `An error occurred while signUpUser Auth: ${error.message}` });
  }
}

const signInUser = async (req, res) => {
try {
    const user = await User.findOne({ email: req.body.email });
    if(!user) throw new Error("User not Found");

    const compPass = await bcrypt.compare(req.body.password, user.password);
    
    if(!compPass) {
      // Create Ledger
      await createLedger(
        {
            uuid : user.uuid,
            txUserAction : "accountLoginFail",
            txID : crypto.randomBytes(11).toString("hex"),
            txAuth : "User",
            txFrom : user.uuid,
            txTo : "dao",
            txAmount : "0",
            txData : user.uuid,
            // txDescription : "User logs in failed"
        })
      return res.status(400).json("Wrong Password")
    };

    // Generate a JWT token
    const token = createToken({ uuid: user.uuid });

    // Create Ledger
    await createLedger(
    {
        uuid : user.uuid,
        txUserAction : "accountLogin",
        txID : crypto.randomBytes(11).toString("hex"),
        txAuth : "User",
        txFrom : user.uuid,
        txTo : "dao",
        txAmount : "0",
        txData : user.uuid,
        // txDescription : "user logs in"
    })

    // res.status(200).json(user);
    res.status(200).json({ ...user._doc, token });
    // res.status(201).send("Signed in Successfully");
} catch (error) {
    console.error(error.message);
      res.status(500).json({ message: `An error occurred while signInUser Auth: ${error.message}` });
}
}

const userInfo = async (req, res) => {
    try {
      const user = await User.findOne({ uuid: req.body.uuid });
  
      res.status(200).json(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: `An error occurred while userInfo Auth: ${error.message}` });
    }
  }
const setUserWallet = async (req, res) => {
    try {
      // Load the document
      const doc = await User.findOne({ uuid: req.body.uuid });
  
      // Update the document using `Document#updateOne()`
      // Equivalent to `CharacterModel.updateOne({ _id: doc._id }, update)`
      const update = { walletAddr: req.body.walletAddr };
      await doc.updateOne(update);
  
      res.status(201).send("Wallet Updated");
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: `An error occurred while setUserWallet Auth: ${error.message}` });
    }
  }
const signedUuid = async (req, res) => {
    try {
      // Load the document
      const doc = await User.findOne({ uuid: req.body.uuid });
  
      // Update the document using `Document#updateOne()`
      // Equivalent to `CharacterModel.updateOne({ _id: doc._id }, update)`
      const update = { signedUuid: req.body.signedUuid, metamaskVerified: true };
      await doc.updateOne(update);
  
      res.status(201).send("Updated");
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: `An error occurred while signedUuid Auth: ${error.message}` });
    }
  }
const sendVerifyEmail = async (req, res) => {
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
    const url = `https://on.foundation/VerifyCode?${verificationTokenFull}`;
    // console.log("url", url);

    // NODEMAILER 
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });

    // var mailOptions = {
    //   from: process.env.EMAIL_USERNAME,
    //   to: req.body.email,
    //   //   to: "abdullahyaqoob380@gmail.com",
    //   subject: "Verify Account",
    //   html: `Click <a href = '${url}'>here</a> to confirm your email <br /> <br /> <br />
    //       And confirm this code <b>${verificationToken}</b> from the App`,
    //   //   html: `Please Copy the code and Paste in App <b>${verificationToken}</b>`,
    // };

    // await transporter.sendMail(mailOptions, function (error, info) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("email sent: " + info.response);
    //   }
    // });
    const SES_CONFIG = {
      region: process.env.AWS_SES_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    };
    // Create SES service object
    console.log("before sesClient", SES_CONFIG);

    const sesClient = new AWS.SES(SES_CONFIG);

    let params = {
      Source: process.env.AWS_SES_SENDER,
      Destination: {
        ToAddresses: [
          req.body.email
        ]
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `Click <a href = '${url}'>here</a> to confirm your email <br /> <br /> <br />
                   And confirm this code <b>${verificationToken}</b> from the App`,
          },
          Text: {
            Charset: 'UTF-8',
            Data: 'Verify Accountt'
          }
        },

        Subject: {
          Charset: 'UTF-8',
          Data: 'Verify Account',
        }
      },
    }

    try {
      const res = await sesClient.sendEmail(params).promise()
      console.log("Email has been sent!", res);

    } catch (error) {
      console.log(error);
    }

    return res.status(201).send({
      message: `Sent a verification email to ${req.body.email}`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: `An error occurred while sendVerifyEmail Auth: ${error.message}` });
  }
}
const verify = async (req, res) => {
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
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: `An error occurred while verify Auth: ${error.message}` });
    }
  
    try {
      // Step 2 - Find user with matching ID
      const user = await User.findOne({ _id: payload.ID }).exec();
      if (!user) {
        return res.status(404).send({
          message: "User does not  exists",
        });
      }
  
      // Create a Badge
      user.badges.unshift({ accountName: "Email", isVerified: true  })
      // Step 3 - Update user verification status to true
      user.gmailVerified = true;
      await user.save();
      // Create Ledger
      await createLedger(
        {
          uuid : user.uuid,
          txUserAction : "accountBadgeAdded",
          txID : crypto.randomBytes(11).toString("hex"),
          txAuth : "User",
          txFrom : user.uuid,
          txTo : "dao",
          txAmount : "0",
          txData : user.badges[0]._id,
          // txDescription : "User adds a verification badge"
        })
      await createLedger(
        {
          uuid : user.uuid,
          txUserAction : "accountBadgeAdded",
          txID : crypto.randomBytes(11).toString("hex"),
          txAuth : "DAO",
          txFrom : "DAO Treasury",
          txTo : user.uuid,
          txAmount : 0.96,
          // txData : user.badges[0]._id,
          // txDescription : "Incentive for adding badges"
        })
        const getAmount = await getTreasury();
        await updateTreasury({ amount: getAmount - 0.96 })
      return res.status(200).send({
        message: "Gmail Account verified",
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: `An error occurred while signUpUser Auth: ${error.message}` });
    }
  }
const deleteByUUID = async(req, res) => {
    try {
      const { uuid } = req.params;
      const user = await User.deleteOne({uuid});
      // Create Ledger
      await createLedger(
        {
          uuid : uuid,
          txUserAction : "accountDeleted",
          txID : crypto.randomBytes(11).toString("hex"),
          txAuth : "User",
          txFrom : uuid,
          txTo : "dao",
          txAmount : "0",
          txData : uuid,
          // txDescription : "User deletes account"
        }
      )
      res.status(201).send("User has been deleted");
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: `An error occurred while deleteByUUID Auth: ${error.message}` });
    }
  
  }
const logout = async(req, res) => {
    try {
      const { uuid } = req.params;
      const user = await User.findOne({uuid});
      !user && res.status(404).json("User not Found");
      // Create Ledger
      await createLedger(
        {
          uuid : uuid,
          txUserAction : "accountLogout",
          txID : crypto.randomBytes(11).toString("hex"),
          txAuth : "User",
          txFrom : uuid,
          txTo : "dao",
          txAmount : "0",
          txData : uuid,
          // txDescription : "User logs out"
        }
      )
  
      res.status(201).send("User has been deleted");
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: `An error occurred while logout Auth: ${error.message}` });
    }
  
  }
  const deleteBadgeById = async(req, res) => {
    try {
      const { uuid, id } = req.params;
      const user = await User.findOne({uuid});
      !user && res.status(404).json("User not Found");
      const updatedBadges = user.badges.filter(item => item._id === id)
      user.badges = updatedBadges
      await user.save();
      // Create Ledger
      await createLedger(
        {
          uuid : uuid,
          txUserAction : "accountBadgeRemoved",
          txID : crypto.randomBytes(11).toString("hex"),
          txAuth : "User",
          txFrom : uuid,
          txTo : "dao",
          txAmount : "0",
          txData : uuid,
          // txDescription : "User removes a verification badge"
        }
      )
  
      res.status(201).send("User has been deleted");
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: `An error occurred while deleteBadgeById Auth: ${error.message}` });
    }
  
  }
module.exports = {
    changePassword,
    signUpUser,
    signInUser,
    userInfo,
    setUserWallet,
    signedUuid,
    sendVerifyEmail,
    verify,
    deleteByUUID,
    logout,
    deleteBadgeById
}