// -------------------------------------------------------------------------------------------------------------------------------
// SERVER SETUP //

// Importing required packages
const express = require("express");                                       // Express builds the web server (allows you to create routes, handle requests/responses, server webpages)
const bcrypt = require("bcrypt");                                         // Bcrypt securely hash passwords
const nodemailer = require("nodemailer");                                 // Nodemailer allows you to send emails from your server
const open = (...args) => import("open").then((m) => m.default(...args)); // Open automatically opens the browser when the server starts
const path = require("path");                                             // Node's path module builds file paths accross the os

// Loading environment variables from the .env file
require("dotenv").config();                                            

// Variables
const app = express();                                                    // Creates the express server instance
const PORT = process.env.PORT || 3000;                                    // The port the server runs on

// Configuring middleware
app.use(express.urlencoded({ extended: true }));                          // Allows express to read HTML form data (EX: req.body.username)
app.use(express.static(path.join(__dirname, "public")));                  // Allows express to serve frontend files (html, css, js)
app.use(express.json());                                                  // Allows express to read JSON request bodies (EX: fetching /api/login)

// Sequelize connection
const { sequelize } = require("./models");

sequelize.authenticate()
  .then(() => console.log("Database connected"))
  .catch(err => console.error("Error:", err));

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});



// -------------------------------------------------------------------------------------------------------------------------------
// START SERVER //

app.listen(PORT, async () => {
    const url = `http://localhost:${PORT}`;     // Creating server URL
    console.log(`Server running on ${url}`);    // Confirming when the server starts in to terminal
    
    // Preventing the server to open browser multiple times
    // Opening browser only when environment variables does not exist
    if (!process.env.__BROWSER_OPENED) {
        process.env.__BROWSER_OPENED = "true";
        await open(url);
    }
});