const Command = require("../../modules/Base/Command");
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
    const time = args[0] ? this.client.utils.stringToMillis.isValid(args[0]) ? this.client.utils.stringToMillis.convert(args[0]).ms : null : null; // eslint-disable-line
    const reason = time ? args.slice(1).join(" ") : args.join(" ").length > 0 ? args.join(" ") : null; // If time were specified, remove first 2 elements, else remove 1 and then join the whole array.

    if (!member) return msg.fail(`Please mention the member or enter their username/ID in order for me to mute them!`);

    if (!(member instanceof Object)) { // If its not a user mention
      if (msg.guild.members.has(member)) member = msg.guild.members.get(member);
      else member = msg.guild.findMember(member);
    }

    if (!member.manageable) return msg.fail("I can't mute a member with higher privilege/roles than me!");

    try {
      await this.mute(msg, member, time);
      return msg.success(
        `${member.user.tag} has been succesfully muted by ${msg.author.tag}!`,
        `${reason ? `**Reason**: ${reason}` : ``}\n\n${time ? `**Muted Until**: ${moment(Date.now() + time).format("dddd, MMMM Do, YYYY, hh:mm:ss A")}` : ``}`
      );
    } catch (error) {
      return msg.error(error, `mute ${member.user.tag}!`);
    }
  }

  async mute(msg, member, time) {
    try {
      let role = msg.guild.cache.muteRole || null;

      if (!role) {
        role = await msg.guild.roles.create({
          "data": {
            "name": "Muted",
            "mentionable": false,
            "color": 0x6b6b6b
          }
        });

        const permissions = role.permissions.toArray();
        const index = permissions.findIndex(p => p === "SEND_MESSAGES");

        if (index > -1) permissions.splice(index, 1); // Disallow anyone in the role to send messages

        await role.setPermissions(permissions);
        await msg.guild.updateDatabase({ "muteRole": role.id });

        if (member.roles.has(role.id)) return Promise.reject(new Error(`${member.user.tag} is already muted!`));
      }

      if (time) {
        const clientCache = this.client.cache;
        if (!(clientCache.mutedMembers instanceof Array)) clientCache.mutedMembers = [];

        clientCache.mutedMembers.push({
          "memberId": member.id,
          "guildId": msg.guild.id,
          "muteRole": role.id,
          "mutedUntil": Date.now() + time
        });

        await this.client.db.update("client", clientCache);
      }

      await member.roles.add(role.id);

      return Promise.resolve(member.roles);
    } catch (error) {
      return Promise.reject(error);
    }
  }
};