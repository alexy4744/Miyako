const Command = require("../../modules/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: true,
      nsfw: false,
      cooldown: 5,
      description: () => `Globally enable/disable a command`,
      usage: () => [`enable pong`, `disable pong`],
      aliases: [],
      subcommands: ["enable", "disable"],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  async run(msg, args) {
    if (!this.client.commands[args[1]] && !this.client.aliases[args[1]]) return msg.fail(`"${args[1]}" is not a valid command!`);

    const cmd = this.client.commands[args[1]] || this.client.commands[this.client.aliases[args[1]]];

    if (!cmd) {
      msg.fail("Command not found!");
      return false;
    }

    if (!this.client.myCache.global || (this.client.utils.is.object(this.client.myCache.global) && !this.client.utils.is.array(!this.client.myCache.global.disabledCommands))) {
      await this.client.db.update("client", {
        _id: this.client.user.id,
        global: {
          disabledCommands: []
        }
      });
    }

    await this.client.syncDatabase();

    return { cmd };
  }

  enable(msg) {
    const data = this.client.myCache;

    if (!data.global.disabledCommands.includes(this.shared.cmd.options.name)) return msg.fail(`"${this.shared.cmd.options.name}" is already globally enabled!`);

    data.global.disabledCommands = data.global.disabledCommands.filter(command => !this.shared.cmd.options.aliases.includes(command) && command !== this.shared.cmd.options.name);

    return this.updateDatabase(msg, "enable", data);
  }

  disable(msg) {
    const data = this.client.myCache;

    if (data.global.disabledCommands.includes(this.shared.cmd.options.name)) return msg.fail(`"${this.shared.cmd.options.name}" is already globally disabled!`);

    data.global.disabledCommands.push(this.shared.cmd.options.name);

    for (const alias of this.shared.cmd.options.aliases) data.global.disabledCommands.push(alias);

    return this.updateDatabase(msg, "disable", data);
  }

  async updateDatabase(msg, action, data) {
    try {
      await this.client.db.update("client", data);
      return msg.success(`"${this.shared.cmd.options.name}" is now globally ${action}d!`);
    } catch (error) {
      return msg.error(error, `globally ${action} this command!`);
    }
  }
};