const dotenv = require("dotenv");
const app = require('./server');
const connectDB = require("./config/db");
const { exec } = require('child_process');

dotenv.config();

// Connect to database
connectDB();

let port = process.env.BASE_PORT;

app.listen(port, () => {
  console.log("Server is listening on port: ", port);

  // Open Swagger UI in default browser
  exec(`start http://localhost:${port}/foundation-api-documentation-swagger`, (error, stdout, stderr) => {
    if (error) {
      console.error('Failed to open Swagger UI in browser:', error);
      return;
    }
    console.log('Swagger UI opened in default browser.');
  });
});