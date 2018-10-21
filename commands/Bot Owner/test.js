const Command = require("../../modules/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: true,
      nsfw: false,
      cooldown: 5,
      description: () => `Reload commands, inhibitors and utilities`,
      usage: () => [`checkNSFW`, `ban`],
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  run() {
    console.log(3);
  }
};