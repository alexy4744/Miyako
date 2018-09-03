const Command = require("../../modules/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: true,
      nsfw: false,
      cooldown: 5,
      description: () => `Enable a globally disabled command`,
      usage: () => [`pong`],
      aliases: ["genable"],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  async run(msg, args) {
    if (!this.client.commands[args[0]] && !this.client.aliases[args[0]]) return msg.fail(`"${args[0]}" is not a valid command!`);

    const cmd = this.client.commands[args[0]] || this.client.commands[this.client.aliases[args[0]]];

    const data = await this.client.db.get().catch(e => ({
      "error": e
    }));

    if (data.error) return msg.error(data.error, "globally enable this command!");

    if (!data.globallyDisabled) data.globallyDisabled = [];

    if (!data.globallyDisabled.includes(cmd.options.name)) return msg.fail(`"${cmd.options.name}" is already globally enabled!`);

    data.globallyDisabled = data.globallyDisabled.filter(command => !cmd.options.aliases.includes(command) && command !== args[0] && command !== cmd.options.name);

    return this.client.db.update({
      "globallyDisabled": data.globallyDisabled
    }).then(() => msg.success(`"${cmd.options.name}" is now globally enabled!`))
      .catch(error => msg.error(error, "globally enable this command!"));
  }
};