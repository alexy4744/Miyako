/* eslint no-use-before-define: 0 */
/* eslint no-confusing-arrow: 0 */

module.exports.run = async (client, msg, args) => {
  let member = msg.mentions.members.size > 0 ? msg.mentions.members.first() : args[0] !== undefined ? args[0] : null; // eslint-disable-line
  args = args.filter(arg => (member instanceof Object) ? arg !== member.toString() : arg !== member); // Remove member from array of arguments
  const days = !isNaN(args[0]) ? parseInt(args[0]) : null; // eslint-disable-line
  const reason = days ? args.slice(1).join(" ") : args.join(" "); // If days were specified, remove first 2 elements, else remove 1 and then join the whole array.

  if (!(member instanceof Object)) { // If its not a user mention
    if (msg.guild.members.has(member)) { // If it is a user snowflake
      member = msg.guild.members.get(member);
    } else {
      member = msg.guild.findMember(member);
    }
  }

  if (member.manageable) {
    let role = msg.guild.roles.get("Muted");

    if (!role) {
      role = await msg.guild.roles.create({
        "data": {
          "name": "Muted",
          "mentionable": false,
          "color": 0x6b6b6b
        }
      }).catch(e => ({
        "error": e
      }));

      if (role.error) return msg.error(role.error, `mute ${member.user.tag}!`);
    }

    try {
      await member.roles.add(role);
    } catch (error) {
      return msg.error(error, `mute ${member.user.tag}!`);
    }
  } else {
    msg.fail("I can't mute a moderator!");
  }
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: () => `Mute a member from the entire guild.`,
  usage: msg => [`${msg.client.user.id}`, `${msg.author.username}`],
  aliases: [],
  userPermissions: ["MANAGE_ROLES"],
  botPermissions: ["MANAGE_ROLES"],
  runIn: ["text"]
};