const Miyako = require("./structures/Miyako");
const MongoDB = require("./database/MongoDB");
const path = require("path");

require("dotenv").config({ "path": path.join(__dirname, "process.env") });

(async () => {
  const Database = await MongoDB.create();
  const client = new Miyako({
    "owner": process.env.OWNER,
    "prefix": process.env.PREFIX,
    "clientOptions": {
      "disabledEvents": ["TYPING_START", "RELATIONSHIP_ADD", "RELATIONSHIP_REMOVE", "USER_NOTE_UPDATE"],
      "disableEveryone": true,
      "fetchAllMembers": false
    }
  });

  const clientCache = await Database.get("client", process.env.BOTID).catch(e => ({ "error": e }));
  if (clientCache.error) throw clientCache.error;
  client.cache.client.set(process.env.BOTID, clientCache);

  client.db = Database;
  client.db.on("change", data => client.updateCache(data));

  client.once("ready", () => client.events.ready(client));
  client.on("error", error => client.events.error(error));
  client.on("message", msg => client.events.message(client, msg));

  client.login(process.env.TOKEN).catch(error => { throw error; });
})();

process.on("uncaughtException", error => console.error(error));
process.on("unhandledRejection", (reason, p) => console.error(reason, "Unhandled Rejection at Promise", p));