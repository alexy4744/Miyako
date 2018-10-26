const Command = require("../../modules/Base/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 30,
      description: msg => `Delete an x amount of messages sent by ${msg.client.user.toString()} in ${msg.channel.toString()}`,
      aliases: [],
      userPermissions: ["manage_messages"],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  run(msg) {
    if (!msg.guild.myMessages || msg.guild.myMessages.length < 1) return msg.fail(`There are no messages to delete!`);

    const myMessages = msg.guild.myMessages.get(msg.channel.id);
    let counter = 0;

    myMessages.forEach(async message => {
      counter++;
      const fetchedMessage = await msg.channel.messages.fetch(message).catch(() => null);

      if (fetchedMessage === null) return; // eslint-disable-line
      else { // eslint-disable-line
        const isDeleted = await fetchedMessage.delete().catch(() => null);

        if (isDeleted === null) return; // eslint-disable-line
        else msg.guild.myMessages.set(msg.channel.id, myMessages.splice(counter, 1)); // eslint-disable-line
      }
    });

    if (counter >= myMessages.length) return msg.success(`I have successfully deleted my messages!`).then(m => m.delete({ timeout: 10000 }).catch(() => { }));
  }
};