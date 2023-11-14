const dotenv = require("dotenv");
const app = require('./server');
const connectDB = require("./config/db");

dotenv.config();

// Connect to database
connectDB();

let port = process.env.BASE_PORT;

app.listen(port, () => {
  console.log("Server is listening on port: ", port);
});