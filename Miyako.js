const path = require("path");
const dotenv = require("dotenv");
const Miyako = require("./structures/Client");

dotenv.config({ path: path.join(__dirname, "./process.env") });

Miyako.initalize();

process.on("uncaughtException", (...args) => console.error(...args));
process.on("unhandledRejection", (...args) => console.error(...args));