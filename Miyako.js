const { token, owner, prefix } = require("./config.json");
const Miyako = require("./structures/Client");
const client = new Miyako({
  owner: owner,
  prefix: prefix,
  id: "415313696102023169",
  disabledEvents: ["TYPING_START", "RELATIONSHIP_ADD", "RELATIONSHIP_REMOVE", "USER_NOTE_UPDATE"],
  disableEveryone: true
});

client.once("ready", () => client.events.get("ready")(client));
client.on("error", error => client.events.get("error")(error));
client.on("guildCreate", guild => client.events.get("guildCreate")(guild));
client.on("message", msg => client.events.get("message")(client, msg));

client.login(token).catch(error => {
  throw new Error(error);
});

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
});

process.on("uncaughtException", error => {
  throw new Error(error.stack);
});