const express = require("express");
const app = express();
const dotenv = require("dotenv");
const colors = require("colors");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config();



// middlewares
app.use(cors());
app.options("*", cors());

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// All Routes
require("../start/routes")(app)

app.get("/", (req, res) => {
  // res.json(`Server is listening on port: ${port}`);
//   res.send(`Foundation Server`);
  res.json();
});

module.exports = app;