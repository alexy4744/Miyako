const Command = require("../../modules/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Re-assign the prefix of ${this.client.user.toString()}`,
      usage: () => [`v!`],
      aliases: [],
      userPermissions: ["administrator"],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  async run(msg, args) {
    if (!args[0]) return msg.fail(`Please enter the new prefix that you want to re-assign to!`);

    const newPrefix = args.join(" ");

    if (newPrefix.length > 20) return msg.fail(`The length of this prefix is too long!`, `Prefixes can only have a max length of **20** characters!`);

    const data = await this.client.db.get("guilds", msg.guild.id).catch(e => ({ "error": e }));
    if (data && data.error) return msg.error(data.error, "re-assign the prefix");

    // Default prefix is v$, so if there's no entry for this guild, then the prefix must be the default.
    if ((!data.prefix && newPrefix === this.client.prefix) || data.prefix === newPrefix) return msg.fail(`"${newPrefix}" is already the current prefix!`);

    try {
      await this.client.db.update("guilds", { ...data, "prefix": newPrefix });
      return msg.success(`I have succesfully re-assigned the prefix to "${newPrefix}"`);
    } catch (error) {
      return msg.error(error, "re-assign the prefix");
    }
  }
};