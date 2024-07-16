const UserModel = require("../models/UserModel");


// This middleware function will be called for every incoming request
const isGuest = async (req, res, next) => {
    try {
        let uuid;
        if(req.cookie.uuid){
            uuid = req.cookie.uuid;
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
                    message: "Unfortuanatly you are using guest account, Guest is not allowed to perform such actions. Please Join Foundation.",
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
