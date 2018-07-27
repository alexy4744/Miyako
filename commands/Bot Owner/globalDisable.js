const Command = require("../../modules/Command");

module.exports = class Ping extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: true,
      nsfw: false,
      cooldown: 5,
      description: () => `Globally disable a command across all guilds`,
      usage: () => [`ping`],
      aliases: ["gdisable"],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  async run(msg, args) {
    let cmd = args[0];

    if (!this.client.commands.has(cmd) && !this.client.aliases.has(cmd)) return msg.fail(`"${cmd}" is not a valid command!`);

    cmd = this.client.commands.get(cmd) || this.client.aliases.get(cmd);

    const data = await this.client.db.get().catch(e => ({
      "error": e
    }));

    if (data.error) return msg.error(data.error, "globally disable this command!");

    if (!data.globallyDisabled) data.globallyDisabled = []; // this.client data can't be null, so I don't need to check for !data

    if (data.globallyDisabled.includes(cmd.options.name)) return msg.fail(`"${cmd.options.name}" is already globally disabled!`);

    data.globallyDisabled.push(cmd.options.name);
    for (const alias of cmd.options.aliases) data.globallyDisabled.push(alias);

    return this.client.db.update({
      "globallyDisabled": data.globallyDisabled
    }).then(() => this.client.updateCache("globallyDisabled", data.globallyDisabled)
      .then(() => msg.success(`"${cmd.options.name}" is now globally disabled!`))
      .catch(e => msg.error(e, "globally disable this command!")))
      .catch(error => msg.error(error, "globally enable this command!"));
  }
};