const Miyako = require("./structures/Miyako");

Miyako.start({
  "disabledEvents": ["TYPING_START", "RELATIONSHIP_ADD", "RELATIONSHIP_REMOVE", "USER_NOTE_UPDATE"],
  "disableEveryone": true,
  "fetchAllMembers": false
});

process.on("uncaughtException", error => console.error(error));
process.on("unhandledRejection", (reason, p) => console.error(reason, "Unhandled Rejection at Promise", p));