import passport from "passport"

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
}