const Command = require("../../modules/Command");

module.exports = class Ping extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: msg => `View the database, websocket and Discord API latency of ${msg.client.user.toString()}`,
      subcommands: [],
      aliases: ["latency", "pong"],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  async run(msg) {
    const init = Date.now(); // Get the ms before editing the message.
    const datebasePing = await this.client.db.ping().catch(() => "Failed");
    const message = await msg.channel.send({
      embed: {
        title: `⏱${msg.emojis.bar}Checking my latency!`,
        color: msg.colors.default
      }
    });

    return message.edit({
      embed: {
        title: `🏓${msg.emojis.bar}Pong!`,
        fields: [
          {
            "name": "Round Trip Latency \\⏱",
            "value": `${String(Math.round(Date.now() - init))} ms`, // Get the time it took to edit the message.
            "inline": true
          },
          {
            "name": "Heartbeat \\💙",
            "value": `${String(Math.round(this.client.ping))} ms`,
            "inline": true
          },
          {
            "name": "Database Latency",
            "value": `${String(datebasePing)} ms`,
            "inline": true
          }
        ],
        color: msg.colors.default
      }
    });
  }
};