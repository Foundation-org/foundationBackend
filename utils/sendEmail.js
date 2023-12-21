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