module.exports.run = async (client, msg) => {
  console.timeEnd("run time");
  const init = Date.now(); // Get the ms before editing the message.
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
          "name": "Latency \\⏰",
          "value": String(Math.round(Date.now() - init)), // Get the time it took to edit the message.
          "inline": true
        },
        {
          "name": "Heartbeat \\💙",
          "value": String(Math.round(client.ping)),
          "inline": true
        }
      ],
      color: msg.colors.default
    }
  });
};

module.exports.options = {
  enabled: true,
  guarded: false, // If the command can be disabled per guild
  description: "Check the latency between the bot and Discord servers.",
  nsfw: false,
  aliases: ["latency", "pong"],
  botOwnerOnly: false,
  disableCheck: true, // Overrides all other boolean
  userPermissions: [],
  botPermissions: [],
  runIn: [],
  cooldown: 5
};