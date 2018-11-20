const Monitor = require("../modules/Base/Monitor");

module.exports = class FilterInvites extends Monitor {
  constructor(...args) {
    super(...args);
  }

  run(msg) {
    if (!msg.guild.cache.noInvites) return 1
    return this.test(msg);
  }

  test(msg) {
    const regex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z-A-Z]/gi;
    if (!msg.content.match(regex)) return 1;

    msg.delete().catch(() => { });

    msg.author.send({
      embed: {
        title: `${msg.emojis.fail}Hey, please don't send invite links!`,
        description: `**${msg.guild.name}** doesn't like it when you distribute other server's invite links, therefore your message has been deleted!`,
        color: msg.colors.fail
      }
    }).catch(() => { });

    return 0;
  }
};