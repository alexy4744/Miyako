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
    const reason = args.join(" ").length > 0 ? args.join(" ") : null; // If days were specified, remove first 2 elements, else remove 1 and then join the whole array.

    if (!member) return msg.fail(`Please mention the member or enter their username/ID in order for me to unmute them!`);

    if (!(member instanceof Object)) { // If its not a user mention
      if (msg.guild.members.has(member)) member = msg.guild.members.get(member);
      else member = msg.guild.findMember(member);
    }

    if (member.manageable) { // If Miyako can assign new roles to this member
      const role = msg.guild.cache.muteRoleId || null;

      if (!role || !msg.guild.roles.has(role) || !member.roles.has(role)) return msg.fail(`${member.user.tag} is already unmuted!`);

      try {
        const clientData = await this.client.db.get();

        if (clientData.mutedMembers instanceof Array) {
          const index = clientData.mutedMembers.findIndex(el => el.memberId === member.id);

          if (index > -1) clientData.mutedMembers.splice(index, 1);

          await this.client.db.update({
            "mutedMembers": clientData.mutedMembers
          });
          await this.client.updateCache("mutedMembers", clientData.mutedMembers);
        }

        await member.roles.remove(role);

        return msg.success(`${member.user.tag} has been succesfully unmuted by ${msg.author.tag}!`, `${reason ? `**Reason**: ${reason}` : ``}`);
      } catch (error) {
        return msg.error(error, `unmute ${member.user.tag}!`);
      }
    } else {
      msg.fail("I can't unmute a member with higher privilege/roles than me!");
    }
  }
};