const passport = require("passport")

const { OAuth2Client } = require('google-auth-library')

// Github
const githubSuccess = async (req, res) => {
    passport.authenticate("github", { scope: ["user"] })
};

const githubFailure = async (req, res) => {
    passport.authenticate("github", { failureRedirect: "/auth/login/failed" })
};
const githubCallback = async (req, res) => {
    res.redirect(process.env.FRONTEND_ORIGIN)
};
 
// Twitter
const twitterSuccess = async (req, res) => {
    passport.authenticate("twitter", { scope: ["user"] })
};

const twitterFailure = async (req, res) => {
    passport.authenticate("twitter", { failureRedirect: "/auth/login/failed" })
};
const twitterCallback = async (req, res) => {
    res.redirect(process.env.FRONTEND_ORIGIN)
};

// Google
const googleSuccess = async (req, res) => {
    passport.authenticate("google", { scope: ["user"] })
};

const googleFailure = async (req, res) => {
    passport.authenticate("google", { failureRedirect: "/auth/login/failed" })
};
const googleCallback = async (req, res) => {
    res.redirect(process.env.FRONTEND_ORIGIN)
};


const clientId = "233419149658-kvv0vd3go48fp56v22vr0qfoimvkp5tl.apps.googleusercontent.com";

const authClient = new OAuth2Client(clientId)

const googleAuthentication = async(req, res) => {
    const { idToken } = req.body;
    if (idToken) {
        authClient.verifyIdToken({ idToken, audience: clientId })
            .then(response => {
                // console.log(response)
                const { email_verified, email, name, picture } = response.payload
                console.log("🚀 ~ file: PassportController.js:53 ~ googleAuthentication ~ response.payload:", response.payload)
                // if (email_verified) {
                //     User.findOne({ email }).exec((err, user) => {
                //         if(user){
                //             return res.json(user)
                //         }
                //         else{
                //             let password = email + clientId
                //             let newUser = new User({email,name,picture,password});
                //             newUser.save((err,data)=>{
                //                 if(err){
                //                     return res.status.json({error:"mongodb error"})
                //                 }
                //                 res.json(data)
                //             })
                //         }
                //     })
                // }
            })
            .catch(err => { console.log(err) })
    }
}

module.exports = {
    githubSuccess,
    githubFailure,
    githubCallback,
    twitterSuccess,
    twitterFailure,
    twitterCallback,
    googleSuccess,
    googleFailure,
    googleCallback,
    googleAuthentication
}