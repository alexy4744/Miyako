/* eslint no-use-before-define: 0 */
/* eslint no-confusing-arrow: 0 */

const Command = require("../../modules/Command");
const moment = require("moment");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Mute a member from the entire guild.`,
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
    const days = args[0] ? this.client.utils.stringToMillis.isValid(args[0]) ? this.client.utils.stringToMillis.convert(args[0]).ms : null : null; // eslint-disable-line
    const reason = days ? args.slice(1).join(" ") : args.join(" ").length > 0 ? args.join(" ") : null; // If days were specified, remove first 2 elements, else remove 1 and then join the whole array.

    if (!member) return msg.fail(`Please mention the member or enter their username/ID in order for me to mute them!`);

    if (!(member instanceof Object)) { // If its not a user mention
      if (msg.guild.members.has(member)) member = msg.guild.members.get(member);
      else member = msg.guild.findMember(member);
    }

    if (!member.manageable) return msg.fail("I can't mute a member with higher privilege/roles than me!");

    let role = msg.guild.cache.muteRole || null;

    if (!role || !msg.guild.roles.has(role)) {
      try {
        role = await msg.guild.roles.create({
          "data": {
            "name": "Muted",
            "mentionable": false,
            "color": 0x6b6b6b
          }
        }).then(r => r.id);

        // Update the mute role of this guild with the newly created role.
        try {
          await this.client.db.update("guilds", {
            _id: msg.guild.id,
            "muteRole": role
          });
        } catch (error) {
          return msg.error(error, `mute ${member.user.tag}!`);
        }
      } catch (error) {
        return msg.error(error, `mute ${member.user.tag}`);
      }
    }

    if (member.roles.has(role)) return msg.fail(`${member.user.tag} is already muted!`);

    try {
      if (days) {
        const clientCache = this.client.myCache;
        if (!(clientCache.mutedMembers instanceof Array)) clientCache.mutedMembers = [];

        clientCache.mutedMembers.push({
          "memberId": member.id,
          "guildId": msg.guild.id,
          "muteRole": role,
          "mutedUntil": days ? Date.now() + days : null
        });

        await this.client.db.update("client", clientCache);
      }

      await member.roles.add(role);

      return msg.success(`${member.user.tag} has been succesfully muted by ${msg.author.tag}!`, `${reason ? `**Reason**: ${reason}` : ``}\n\n${days ? `**Muted Until**: ${moment(Date.now() + days).format("dddd, MMMM Do, YYYY, hh:mm:ss A")}` : ``}`);
    } catch (error) {
      return msg.error(error, `mute ${member.user.tag}!`);
    }
  }
};