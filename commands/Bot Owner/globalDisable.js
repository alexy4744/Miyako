const Command = require("../../modules/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: true,
      nsfw: false,
      cooldown: 5,
      description: msg => `Globally disable a command across all(${msg.client.guilds.size}) guilds`,
      usage: () => [`ping`],
      aliases: ["gdisable"],
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

    if (data.error) return msg.error(data.error, "globally disable this command!");

    if (!data.globallyDisabled) data.globallyDisabled = []; // this.client data can't be null, so I don't need to check for !data

    if (data.globallyDisabled.includes(cmd.options.name)) return msg.fail(`"${cmd.options.name}" is already globally disabled!`);

    data.globallyDisabled.push(cmd.options.name);
    for (const alias of cmd.options.aliases) data.globallyDisabled.push(alias);

    try {
      await this.client.db.update({ "globallyDisabled": data.globallyDisabled });
      return msg.success(`"${cmd.options.name}" is now globally disabled!`);
    } catch (error) {
      return msg.error(error, "globally enable this command!");
    }
  }
};