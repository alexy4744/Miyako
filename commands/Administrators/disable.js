const Command = require("../../modules/Base/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: msg => `Disable commands in ${msg.guild.name}`,
      usage: () => [`play`],
      aliases: [],
      userPermissions: ["administrator"],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  async run(msg, args) {
    if (!this.client.commands[args[0]] && !this.client.aliases[args[0]]) return msg.fail(`Please enter a valid command to be disabled!`);

    const cmd = this.client.commands[args[0]] || this.client.commands[this.client.aliases[args[0]]];

    if (cmd.options.guarded) return msg.fail(`${msg.author.username}, this command is guarded and cannot be disabled!`);

    const data = await this.client.db.get("guilds", msg.guild.id).catch(e => ({ "error": e }));
    if (data && data.error) return msg.error(data.error, "disable this command");

    if (!data.disabledCommands) data.disabledCommands = [];

    // Both aliases and parent name would be in this array if the command is disabled
    if (data.disabledCommands.includes(args[0])) return msg.fail(`${msg.author.username}, "${args[0]}" is already disabled!`);

    data.disabledCommands.push(cmd.options.name || args[0]);
    cmd.options.aliases.forEach(alias => data.disabledCommands.push(alias));

    try {
      await this.client.db.update("guilds", data);
      return msg.success(`I have successfully disabled "${args[0]}"`);
    } catch (error) {
      return msg.error(error, "disable this command");
    }
  }
};