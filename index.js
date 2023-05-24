const express = require("express");
const app = express();
const dotenv = require("dotenv");
const colors = require("colors");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const AuthRoute = require("./routes/AuthRoute");

dotenv.config();

// Connect to database
connectDB();

// middlewares
app.use(cors());
app.options("*", cors());

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api", AuthRoute);

app.get("/", (req, res) => {
  res.json("Server is listening on port");
});

let port = 8800;

app.listen(port, () => {
  console.log("Server is listening on port: ", port);
});
