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

  run(msg, args) {
    const thingToReload = args[0];

    if (this.client.commands[thingToReload] || this.client.aliases[thingToReload]) {
      try {
        let cmd = this.client.commands[thingToReload] || this.client.commands[this.client.aliases[thingToReload]];
        delete require.cache[require.resolve(`../${cmd.options.category}/${cmd.options.name}`)];
        delete this.client.commands[cmd.options.name];
        for (const alias of cmd.options.aliases) delete this.client.aliases[alias];

        const category = cmd.options.category;
        cmd = new (require(`../${cmd.options.category}/${cmd.options.name}`))(this.client);

        cmd.options.name = thingToReload;
        cmd.options.category = category;

        this.client.commands[cmd.options.name] = cmd;
        for (const alias of cmd.options.aliases) this.client.aliases[alias] = cmd.options.name;
      } catch (error) {
        return msg.error(error, `reload this command!`);
      }
    } else if (this.client.inhibitors[thingToReload]) {
      try {
        delete require.cache[require.resolve(`../../inhibitors/${thingToReload}`)];
        delete this.client.inhibitors[thingToReload];

        this.client.inhibitors[thingToReload] = require(`../../inhibitors/${thingToReload}`);
      } catch (error) {
        return msg.error(error, `reload this inhibitor!`);
      }
    } else if (this.client.utils.hasOwnProperty(thingToReload)) {
      try {
        delete this.client.utils[thingToReload];
        delete require.cache[require.resolve(`../../utils/${thingToReload}`)];

        const util = require(`../../utils/${thingToReload}`);
        this.client.utils[thingToReload] = util;
      } catch (error) {
        return msg.error(error, `reload this utility!`);
      }
    } else {
      return msg.fail(`"${thingToReload}" is not a valid command, inhibitor or a utility!`);
    }

    return msg.success(`"${thingToReload}" has been succesfully reloaded!`);
  }
};