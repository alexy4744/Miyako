const Command = require("../../modules/Base/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: true,
      nsfw: false,
      cooldown: 5,
      description: () => `Reload commands, inhibitors and utilities`,
      usage: () => [`ban`, `checkNSFW`, `is`],
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
        delete require.cache[require.resolve(`../${oldCmd.category}/${oldCmd.name}`)];
        delete this.client.commands[oldCmd.name];
        for (const alias of oldCmd.aliases) delete this.client.aliases[alias];

        const newCmd = new (require(`../${oldCmd.category}/${oldCmd.name}`))(this.client);

        newCmd.name = oldCmd.name;
        newCmd.category = oldCmd.category;

        this.client.commands[newCmd.name] = newCmd;
        for (const alias of newCmd.aliases) this.client.aliases[alias] = newCmd.name;
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