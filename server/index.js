const express = require("express");
const sessionExpress = require('express-session');
const cookieSession = require("cookie-session");
const cookieParser = require('cookie-parser');
const app = express();
const dotenv = require("dotenv");
const colors = require("colors");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const { BASE_PORT, FRONTEND_URL, FRONTEND_URL_1 } = require("../config/env");
const passport = require("passport");
// import passport from "passport"
// import '../service/passport'
require("../service/passport")
// require("../service/test")

dotenv.config();

// app.use(cors());
app.use(cors({
  origin: FRONTEND_URL.split(','),
    // methods: "GET,POST,PUT,DELETE",
    credentials: true,
  }));

app.use(sessionExpress({
  secret: 'somethingsecretgoeshere',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}))
// app.use(
//   cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
// );


// middlewares
// app.use(cors());
// app.use(cors({
//     origin: FRONTEND_URL,
//     methods: "GET,POST,PUT,DELETE",
//     credentials: true,
//   }));
app.use(cookieParser());
  
  // passport
  app.use(passport.initialize())
  // app.use(passport.session()) //important because deserializeUser has to decode the information from the session id

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// All Routes
require("../start/routes")(app)

app.get("/", (req, res) => {
  res.json(`Server is listening on port: ${BASE_PORT}`);
//   res.send(`Foundation Server`);
  // res.json();
});

app.post("/twilio/callback", (req, res, next) => {
  console.log('Status Callback Data:', req.body);
  res.status(200).send('OK');
})


module.exports = app;