const AWS = require("aws-sdk")

module.exports.sendEmailMessage = async(email, subject, message) => {
   
    const SES_CONFIG = {
        region: process.env.AWS_SES_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      };
  
      const sesClient = new AWS.SES(SES_CONFIG);
  
      let params = {
        Source: process.env.AWS_SES_SENDER,
        Destination: {
          ToAddresses: [
            email
          ]
        },
        ReplyToAddresses: [],
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `${message} <br /> <br />
                    This message is from on.foundation.io. <br /> <br />`
                    // Here is the link <a href='${url}>Quest</a> <br /> <br />
                    // Please feel free to engage with the quest`,
            },
            Text: {
              Charset: 'UTF-8',
              Data: 'Verify Account'
            }
          },
  
          Subject: {
            Charset: 'UTF-8',
            Data: `${subject}`,
          }
        },
      }
  
      try {
        return await sesClient.sendEmail(params).promise()
      } catch (error) {
        console.log(error);
      }
}