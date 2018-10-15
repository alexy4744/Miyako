const Command = require("../../modules/Command");

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
      aliases: ["remind"],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  async run(msg, args) {
    const content = args.split("\"\"");
  }
};