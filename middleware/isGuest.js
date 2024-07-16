const UserModel = require("../models/UserModel");


// This middleware function will be called for every incoming request
const isGuest = async (req, res, next) => {
    try {
        let uuid;
        if(req.cookies.uuid){
            uuid = req.cookies.uuid;
        }
        else if (req.body.uuid){
            uuid = req.body.uuid;
        }
        else {
            uuid = req.body.userUuid;
        }

        const isUserGuest = await UserModel.findOne({
            uuid: uuid,
            isGuestMode: true
        })

        if(isUserGuest){
            return res.status(403).send(
                {
                    message: `Please Create an Account to unlock this feature`,
                }
            );
        }
        
        // Call next() to pass control to the next middleware function
        next();
    } catch (error) {
        // If an error occurs, pass it to the error handling middleware
        return error.message;
    }
};

module.exports = isGuest;
