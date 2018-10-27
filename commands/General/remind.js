const Command = require("../../modules/Base/Command");
const moment = require("moment");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Create a reminder.`,
      subcommands: [],
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  async run(msg, args) {
    const reminder = args.slice(0, -1).join(" ");
    const when = args[args.length - 1] ? this.client.utils.stringToMillis.isValid(args[args.length - 1]) ? Date.now() + this.client.utils.stringToMillis.convert(args[args.length - 1]).ms : null : null;

    if (!reminder || !when) return msg.fail(`You must provided a reminder and also when to remind you!`);

    const clientData = await this.client.db.get("client", this.client.user.id).catch(error => ({ error }));

    if (clientData && clientData.error) return msg.error("set your reminder!", clientData.error);

    if (!clientData.reminders) clientData.reminders = [];

    clientData.reminders.push({
      id: msg.author.id,
      reminder,
      when
    });

    try {
      await this.client.updateDatabase({
        ...this.client.cache,
        reminders: clientData.reminders
      });
      return msg.success("I have successfully set a reminder for you!", `**Reminder**: ${reminder}\n\n**When**: ${moment(when).format("dddd, MMMM Do YYYY, hh:mm:ss A")}`);
    } catch (error) {
      return msg.error("set your reminder!", error);
    }
  }
};