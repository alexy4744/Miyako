const os = require("os-utils");

module.exports = client => {
  client.setInterval(async () => client.wss.send(JSON.stringify({
    ...await os.allStats(),
    "op": "stats",
    "commands": Object.keys(client.commands).length.toLocaleString(),
    // "commandsRan": client.cache.get(client.user.id).commandsRan ? client.cache.get(client.user.id).commandsRan.toLocaleString() : "Still retrieving...",
    "commandsPerSecond": client.commandsPerSecond.toLocaleString(),
    "messagesPerSecond": client.messagesPerSecond.toLocaleString(),
    "memoryUsed": process.memoryUsage().heapUsed / 1024 / 1024,
    "guilds": client.guilds.size.toLocaleString(),
    "channels": client.channels.size.toLocaleString(),
    "users": client.users.size.toLocaleString(),
    "uptime": client.uptime
  })), 1000);
};