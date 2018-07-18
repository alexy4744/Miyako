const { Structures, Collection } = require("discord.js");

Structures.extend("TextChannel", TextChannel => {
  class MiyakoChannel extends TextChannel {
    // https://github.com/discordjs/discord.js/blob/master/src/structures/interfaces/TextBasedChannel.js#L110
    async send(content, options) {
      const msg = await super.send(content, options).catch(() => {}); // Ignore any errors while sending the message
      if (msg) {
        if (!msg.guild.myMessages) msg.guild.myMessages = new Collection();
        if (!msg.guild.myMessages.has(msg.channel.id)) msg.guild.myMessages.set(msg.channel.id, []);
        const channelMessages = msg.guild.myMessages.get(msg.channel.id);
        if (channelMessages.length > 100) channelMessages.splice(channelMessages.length - 100, channelMessages.length); // Always delete the oldest message from the map
        channelMessages.push(msg.id);
        return msg;
      }
    }
  }

  return MiyakoChannel;
});