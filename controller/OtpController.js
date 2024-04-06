const Otp = require("../models/Otp");
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    const generatedOtp = generateOTP();
  try {
    // Send OTP via SNS
    // // Create a new PublishCommand with the specified parameters
    // const command = new PublishCommand(params);
    // // Send the SMS message using the SNS client and the created command
    // const message = await sns.send(command);

    // Save OTP to database
    const otp = await new Otp({ phoneNumber, otp:generatedOtp });
    const savedOtp = await otp.save();
    if (!savedOtp) throw new Error("OTP not saved!");

    res.status(200).json({ message: 'OTP sent successfully', data: savedOtp });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while sendOtp: ${error.message}`,
    });
  }
};


const verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;
  try {
    // Check OTP from database
    const savedOTP = await Otp.findOne({ phoneNumber }).sort({ createdAt: -1 }).exec();
    if (!savedOTP || savedOTP.otp !== otp)
        throw new Error("Invalid OTP")

    res.status(200).json({ message: 'OTP verification successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while verifyOtp: ${error.message}`,
    });
  }
};

const resendOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    const generatedOtp = generateOTP();
  try {
   // Check if OTP was sent within the last 60 seconds
   const lastSentTime = await Otp.findOne({ phoneNumber }).sort({ createdAt: -1 }).exec();
   if (lastSentTime && Date.now() - lastSentTime.createdAt.getTime() < 60000)
       throw new Error("You can only request OTP resend once per minute")

    // Send OTP via SNS
    // // Create a new PublishCommand with the specified parameters
    // const command = new PublishCommand(params);
    // // Send the SMS message using the SNS client and the created command
    // const message = await sns.send(command);

    // Save OTP to database
    const otp = await new Otp({ phoneNumber, generatedOtp });
    const savedOtp = await otp.save();
    if (!savedOtp) throw new Error("OTP not saved!");

    res.status(200).json({ message: 'OTP resent successfully', data: savedOtp });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while resendOtp: ${error.message}`,
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  resendOtp,
};
