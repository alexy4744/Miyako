const Event = require("../modules/Base/Event");

module.exports = class GuildMemberAdd extends Event {
  constructor(...args) {
    super(...args);
  }

  async run(member) {
    if (!member.guild.cache || !member.guild.cache.captcha || !member.guild.cache.captcha.toggle || !member.guild.cache.captcha.role) return;

    const msg = await member.user.send(`You must complete this captcha in order to access ${member.guild.name}'s channels!`, {
      files: [{
        name: `captcha.png`
      }]
    }).catch(error => ({ error }));

    if (msg.error) return;
  }
};