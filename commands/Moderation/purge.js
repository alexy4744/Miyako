const Command = require("../../modules/Command");

module.exports = class Ping extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: msg => `Bulk delete a maximum of 100 messages newer than 2 weeks in ${msg.channel.toString()}`,
      aliases: [],
      userPermissions: ["manage_messages"],
      botPermissions: ["manage_messages"],
      runIn: ["text"]
    });
  }

  run(msg, args) {
    const amount = !isNaN(args[0]) ? parseInt(args[0]) : 100;

    return msg.channel.bulkDelete(amount)
      .then(messages => msg.success(`I have successfully deleted ${messages.size} messages!`))
      .then(m => m.delete({ timeout: 10000 })
      .catch(() => { }))
      .catch(e => msg.error(e, `delete ${amount} message(s) in #${msg.channel.name}`));
  }
};