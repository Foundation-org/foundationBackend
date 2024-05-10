const InfoQuestQuestions = require("../models/InfoQuestQuestions");


// This middleware function will be called for every incoming request
const isUrlSharedPostValidToInteract = async (req, res, next) => {
    try {
        // Check if questForeignKey exists in any of req.params, req.query, or req.body
        const { params, query, body } = req;
        const keys = ['questForeignKey'];

        let questForeignKeyValue = null;

        keys.some(key => {
            if (params && params.hasOwnProperty(key)) {
                questForeignKeyValue = params[key];
                return true;
            }
            if (query && query.hasOwnProperty(key)) {
                questForeignKeyValue = query[key];
                return true;
            }
            if (body && body.hasOwnProperty(key)) {
                questForeignKeyValue = body[key];
                return true;
            }
            return false;
        });

        if (!questForeignKeyValue) {
            // If questForeignKey is not found in any of the objects, throw an error
            throw new Error('questForeignKey not found in params, query, or body');
        }

        const infoQuestQuestion = await InfoQuestQuestions.findOne(
            {
                _id: questForeignKeyValue
            }
        )

        if(infoQuestQuestion.isActive === false){
            return res.status(403).send(
                {
                    message: "Post is not Valid anymore, Can't interact :|"
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

module.exports = isUrlSharedPostValidToInteract;