/* eslint no-use-before-define: 0 */
/* eslint no-confusing-arrow: 0 */

const Command = require("../../modules/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Unmute a member that is currently muted.`,
      usage: msg => [`${msg.this.client.user.id}`, `${msg.author.username}`],
      aliases: [],
      userPermissions: ["MANAGE_ROLES"],
      botPermissions: ["MANAGE_ROLES"],
      runIn: ["text"]
    });
  }

  async run(msg, args) {
    let member = msg.mentions.members.size > 0 ? msg.mentions.members.first() : args[0] !== undefined ? args[0] : null; // eslint-disable-line
    args = args.filter(arg => (member instanceof Object) ? arg !== member.toString() : arg !== member); // Remove member from array of arguments

    if (!member) return msg.fail(`Please mention the member or enter their username/ID in order for me to unmute them!`);

    if (!(member instanceof Object)) { // If its not a user mention
      if (msg.guild.members.has(member)) member = msg.guild.members.get(member);
      else member = msg.guild.findMember(member);
    }

    if (!member.manageable) return msg.fail("I can't unmute a member with higher privilege/roles than me!");

    const role = msg.guild.cache.muteRole || null;
    if (!role || !msg.guild.roles.has(role) || !member.roles.has(role)) return msg.fail(`${member.user.tag} is already unmuted!`);

    try {
      const clientCache = this.client.myCache;

      if (clientCache.mutedMembers instanceof Array) {
        const index = clientCache.mutedMembers.findIndex(el => el.memberId === member.id);
        if (index > -1) clientCache.mutedMembers.splice(index, 1);

        await this.client.db.update("client", clientCache);
      }

      await member.roles.remove(role);

      return msg.success(`${member.user.tag} has been succesfully unmuted by ${msg.author.tag}!`);
    } catch (error) {
      return msg.error(error, `unmute ${member.user.tag}!`);
    }
  }
};