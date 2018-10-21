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
    if (!args[0]) return msg.fail("You must supply a command/inhibitor/utility to reload!");

    const thingToReload = args[0];

    if (this.client.commands[thingToReload] || this.client.aliases[thingToReload]) {
      try {
        const oldCmd = this.client.commands[thingToReload] || this.client.commands[this.client.aliases[thingToReload]];
        delete require.cache[require.resolve(`../${oldCmd.options.category}/${oldCmd.options.name}`)];
        delete this.client.commands[oldCmd.options.name];
        for (const alias of oldCmd.options.aliases) delete this.client.aliases[alias];

        const newCmd = new (require(`../${oldCmd.options.category}/${oldCmd.options.name}`))(this.client);

        newCmd.options.name = oldCmd.options.name;
        newCmd.options.category = oldCmd.options.category;

        this.client.commands[newCmd.options.name] = newCmd;
        for (const alias of newCmd.options.aliases) this.client.aliases[alias] = newCmd.options.name;
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