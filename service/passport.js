const passport = require("passport");
const gitHubStrategy = require("passport-github2");
const googleStrategy = require("passport-google-oauth20");
const twitterStrategy = require("passport-twitter");
var LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
// var LinkedInStrategy = require('passport-linkedin').Strategy;
var InstagramStrategy = require("passport-instagram").Strategy;
// const localStrategy = require("passport-local");
// const JwtStrategy = require("passport-jwt").Strategy;
ExtractJwt = require("passport-jwt").ExtractJwt;
var opts = {};
const dotenv = require("dotenv");
// const UserModel = require("../models/UserModel")
const bcrypt = require("bcrypt");
const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  LINKEDIN_KEY,
  LINKEDIN_SECRET,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  INSTAGRAM_CLIENT_ID,
  INSTAGRAM_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  BACKEND_URL,
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
} = require("../config/env");

dotenv.config();

const GitHub = gitHubStrategy.Strategy;
const Google = googleStrategy.Strategy;
const Twitter = twitterStrategy.Strategy;
// const Local = localStrategy.Strategy

passport.serializeUser(function (user, done) {
  // done(null, user._id)
  done(null, user);
});

passport.deserializeUser(async function (user, done) {
  done(null, user);
  // UserModel.findById(id, (err, user) => {
  //   if (err) return done(err, null)
  //   return done(null, user)
  // })
});

// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = 'secret';
// // opts.issuer = 'accounts.examplesoft.com';
// // opts.audience = 'yoursite.net';
// passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
//     done(null, jwt_payload)
// }));

// GITHUB
passport.use(
  new GitHub(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/auth/github/callback`,
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
      // UserModel.findOne({ githubId: profile.id }, async (err, user) => {
      //   if (err) return done(err, null)
      //   if (!user) {
      //     let newUser = new UserModel({
      //       displayName: profile.username,
      //       imgUrl: profile.photos[0].value,
      //       githubId: profile.id,
      //     })
      //     newUser = await newUser.save()
      //     return done(null, newUser)
      //   }
      //   return done(null, user)
      // })
    }
  )
);

// LINKEDIN
passport.use(
  new LinkedInStrategy(
    {
      clientID: LINKEDIN_KEY,
      clientSecret: LINKEDIN_SECRET,
      callbackURL: `${BACKEND_URL}/auth/linkedin/callback`,
      scope: ["email", "profile", "openid"],
      state: true,
    },
    function (accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        // To keep the example simple, the user's LinkedIn profile is returned to
        // represent the logged-in user. In a typical application, you would want
        // to associate the LinkedIn account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
      });
    }
  )
);

// passport.use(new LinkedInStrategy({
//   consumerKey: LINKEDIN_KEY,
//   consumerSecret: LINKEDIN_SECRET,
//   callbackURL: "http://localhost:7354/auth/linkedin/callback"
// },
// function(token, tokenSecret, profile, done) {
//   done(null, profile)
//   // User.findOrCreate({ linkedinId: profile.id }, function (err, user) {
//   //   return done(err, user);
//   // });
// }
// ));

// FACEBOOK
passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      // callbackURL: "http://localhost:3000/auth/facebook/callback"
      callbackURL: `${BACKEND_URL}/auth/facebook/callback`,
      profileFields: ["id", "displayName", "photos", "email"],
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
      // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
    }
  )
);

// INSTAGRAM
passport.use(
  new InstagramStrategy(
    {
      clientID: INSTAGRAM_CLIENT_ID,
      clientSecret: INSTAGRAM_CLIENT_SECRET,
      // callbackURL: "http://127.0.0.1:3000/auth/instagram/callback"
      callbackURL: `${BACKEND_URL}/auth/facebook/callback`,
    },
    function (accessToken, refreshToken, profile, done) {
      // User.findOrCreate({ instagramId: profile.id }, function (err, user) {
      return done(err, user);
      // });
    }
  )
);

// TWITTER
passport.use(
  new Twitter(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: `${BACKEND_URL}/auth/twitter/callback`,
      includeEmail: true,
    },
    function (token, tokenSecret, profile, cb) {
      return cb(null, profile);
      // User.findOrCreate({ twitterId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
    }
  )
);

// passport.use(new InstagramStrategy({
//   clientID: INSTAGRAM_CLIENT_ID,
//   clientSecret: INSTAGRAM_CLIENT_SECRET,
//   callbackURL: "http://localhost:7354/auth/twitter/callback"
// },
// function(accessToken, refreshToken, profile, done) {
//   done(null, profile)
//   // User.findOrCreate({ instagramId: profile.id }, function (err, user) {
//   //   return done(err, user);
//   // });
// }
// ));

// GOOGLE
passport.use(
  new Google(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/auth/google/callback`,
    },
    function (accessToken, refreshToken, profile, cb) {
      cb(null, profile);
      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
    }
  )
);

// passport.use(
//   new Google(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//     },
//     function (accessToken, refreshToken, profile, cb) {
//       UserModel.findOne({ googleId: profile.id }, async (err, user) => {
//         if (err) return cb(err, null)
//         if (!user) {
//           let newUser = new UserModel({
//             displayName: profile.displayName,
//             imgUrl: profile.photos[0].value,
//             googleId: profile.id,
//           })
//           newUser = await newUser.save()
//           return cb(null, newUser)
//         }
//         return cb(null, user)
//       })
//     }
//   )
// )

// passport.use(
//   new Twitter(
//     {
//       consumerKey: process.env.TWITTER_CONSUMER_KEY,
//       consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//       callbackURL: "/auth/twitter/callback",
//     },
//     function (token, tokenSecret, profile, cb) {
//       done(null, profile)
//       // UserModel.findOne({ twitterId: profile.id }, async (err, user) => {
//       //   if (err) return cb(err, null)
//       //   if (!user) {
//       //     let newUser = new UserModel({
//       //       displayName: profile.displayName,
//       //       imgUrl: profile.photos[0].value,
//       //       twitterId: profile.id,
//       //     })
//       //     newUser = await newUser.save()
//       //     return cb(null, newUser)
//       //   }
//       //   return cb(null, user)
//       // })
//     }
//   )
// )

// passport.use(
//   new Local({ usernameField: "email" }, function (email, password, done) {
//     UserModel.findOne({ email }, function (err, user) {
//       if (err) return done(err)
//       if (!user || !bcrypt.compareSync(password, user.password))
//         return done(null, false)
//       return done(null, user)
//     })
//   })
// )
