const Command = require("../../modules/Command");

module.exports = class Template extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: msg => `Template`,
      subcommands: [],
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  async run(msg, args) {

  }
};