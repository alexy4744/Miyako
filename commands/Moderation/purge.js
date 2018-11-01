const Command = require("../../modules/Base/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: msg => `Bulk delete a maximum of 100 messages newer than 2 weeks in ${msg.channel.toString()}`,
      aliases: [],
      userPermissions: ["MANAGE_MESSAGES"],
      botPermissions: ["MANAGE_MESSAGES"],
      runIn: ["text"]
    });
  }

  async run(msg, args) {
    const amount = !isNaN(args[0]) || args[0] <= 100 ? parseInt(args[0]) : 100;

    try {
      await msg.channel.bulkDelete(amount);
      return msg.success(`I have successfully deleted ${amount} messages!`);
    } catch (error) {
      return msg.error(error);
    }
  }
};