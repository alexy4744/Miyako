const path = require("path");
const dotenv = require("dotenv");
const Sharder = require("./structures/Sharder");

dotenv.config({ path: path.join(__dirname, "./process.env") });

new Sharder("./Miyako.js");

process.on("uncaughtException", (...args) => console.error(...args));
process.on("unhandledRejection", (...args) => console.error(...args));
