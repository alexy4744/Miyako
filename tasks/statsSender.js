const os = require("os-utils");
const Task = require("../modules/Base/Task");

module.exports = class StatsSender extends Task {
  constructor(...args) {
    super(...args, {
      interval: 1000
    });
  }

  async run() {
    if (!this.client.wss) return;

    this.client.wss.send(JSON.stringify({
      ...await os.allStats(),
      "op": "stats",
      "commands": Object.keys(this.client.commands).length.toLocaleString(),
      "commandsPerSecond": this.client.commandsPerSecond.toLocaleString(),
      "messagesPerSecond": this.client.messagesPerSecond.toLocaleString(),
      "memoryUsed": process.memoryUsage().heapUsed / 1024 / 1024,
      "guilds": this.client.guilds.size.toLocaleString(),
      "channels": this.client.channels.size.toLocaleString(),
      "users": this.client.users.size.toLocaleString(),
      "uptime": this.client.uptime
    }), () => null); // Ignore all errors
  }
};