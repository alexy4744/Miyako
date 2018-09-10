require("dotenv").config({ "path": `${__dirname}${process.platform === "linux" ? "/" : "\\"}process.env` });

const Miyako = require("./structures/Miyako");
const client = new Miyako({
  "owner": process.env.OWNER,
  "prefix": process.env.PREFIX,
  "clientOptions": {
    "disabledEvents": ["TYPING_START", "RELATIONSHIP_ADD", "RELATIONSHIP_REMOVE", "USER_NOTE_UPDATE"],
    "disableEveryone": true,
    "fetchAllMembers": false
  }
});

client.once("ready", () => client.events.ready(client));
client.on("error", error => client.events.error(error));
client.on("guildCreate", guild => client.events.guildCreate(guild));
client.on("message", msg => client.events.message(client, msg));

client.login(process.env.TOKEN).catch(error => { throw error; });

process.on("uncaughtException", error => console.error(error));
process.on("unhandledRejection", (reason, p) => console.error(reason, "Unhandled Rejection at Promise", p));