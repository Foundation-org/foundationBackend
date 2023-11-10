const express = require("express");
const app = express();
const dotenv = require("dotenv");
const colors = require("colors");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
// const AuthRoute = require("./routes/AuthRoute");
// const InfoQuestQuestion = require("./routes/InfoQuestQuestion");
// const BookmarkQuest = require("./routes/BookmarkQuestRoute");
const StartQuest = require("./routes/StartQuest");
const SearchRoute = require("./routes/SearchRoute");

dotenv.config();

// Connect to database
connectDB();

// middlewares
app.use(cors());
app.options("*", cors());

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// app.use("/user", AuthRoute);
// app.use("/infoquestions", InfoQuestQuestion);
// app.use("/bookmarkQuest", BookmarkQuest);
app.use("/startQuest", StartQuest);
app.use("/search", SearchRoute);
// All Routes
require("./start/routes")(app)

// let port = 8800;
let port = process.env.BASE_PORT;

app.get("/", (req, res) => {
  // res.json(`Server is listening on port: ${port}`);
  // res.json(`Foundation Server`);
  res.json();
});

app.listen(port, () => {
  console.log("Server is listening on port: ", port);
});
