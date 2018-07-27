const Command = require("../../modules/Command");

module.exports = class Ping extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: true,
      nsfw: false,
      cooldown: 5,
      description: () => `Activate developer mode to prevent anyone else to execute commands except the bot owner`,
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  async run(msg, args) {
    const data = await this.client.db.get().catch(e => ({
      "error": e
    }));

    if (data.error) return msg.error(data.error, "activate/deactivate developer mode!");

    if (!data.devMode) data.devMode = true;
    else data.devMode = false;

    return this.client.db.update({
      "devMode": data.devMode
    }).then(() => this.client.updateCache("devMode", data.devMode)
      .then(() => msg.channel.send({
        embed: {
          title: `⚙${msg.emojis.bar}Developer Mode has been ${data.devMode === true ? `activated` : `deactivated`}!`,
          description: data.devMode ? `Commands will not respond to anyone except the bot owner, ${this.client.users.get(this.client.owner).toString()}.` : null,
          color: msg.colors.default
        }
      }))
      .catch(e => msg.error(e, "activate/deactivate developer mode!")))
      .catch(error => msg.error(error, "activate/deactivate developer mode!"));
  }
};