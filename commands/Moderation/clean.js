const Command = require("../../modules/Base/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 30,
      description: msg => `Delete up to 100 ${msg.client.user.toString()}'s messages`,
      aliases: [],
      userPermissions: ["MANAGE_MESSAGES"],
      botPermissions: ["MANAGE_MESSAGES"],
      runIn: ["text"]
    });
  }

  async run(msg) {
    const myMessages = msg.channel.messages.filter(m => m.author.id === this.client.user.id);
    if (myMessages.size < 1) return msg.fail("There are no messages to delete!");

    try {
      await msg.channel.bulkDelete(myMessages);
      return msg.success(`I have successfully deleted ${myMessages.size} messages!`);
    } catch (error) {
      return msg.error(error);
    }
  }
};