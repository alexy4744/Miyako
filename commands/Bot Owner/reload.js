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

    if (this.client.commands.has(thingToReload) || this.client.aliases.has(thingToReload)) {
      try {
        let cmd = this.client.commands.get(thingToReload) || this.client.aliases.get(thingToReload);
        delete require.cache[require.resolve(`../${cmd.options.category}/${cmd.options.name}`)];
        this.client.commands.delete(cmd.options.name);
        for (const alias of cmd.options.aliases) this.client.aliases.delete(alias);

        const category = cmd.options.category;
        cmd = require(`../${cmd.options.category}/${cmd.options.name}`);

        cmd.options.name = thingToReload;
        cmd.options.category = category;

        this.client.commands.set(cmd.options.name, cmd);
        for (const alias of cmd.options.aliases) this.client.aliases.set(alias, cmd);
      } catch (error) {
        return msg.error(error, `reload this command!`);
      }
    } else if (this.client.inhibitors.has(thingToReload)) {
      try {
        delete require.cache[require.resolve(`../../inhibitors/${thingToReload}`)];
        this.client.inhibitors.delete(thingToReload);

        this.client.inhibitors.set(thingToReload, require(`../../inhibitors/${thingToReload}`));
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