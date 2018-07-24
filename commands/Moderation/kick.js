/* eslint no-use-before-define: 0 */
/* eslint no-confusing-arrow: 0 */

module.exports.run = async (client, msg, args) => {
  let member = msg.mentions.members.size > 0 ? msg.mentions.members.first() : args[0] !== undefined ? args[0] : null; // eslint-disable-line
  args = args.filter(arg => (member instanceof Object) ? arg !== member.toString() : arg !== member); // Remove member from array of arguments
  const reason = args.join(" ").length > 0 ? args.join(" ") : null; // If days were specified, remove first 2 elements, else remove 1 and then join the whole array.

  if (!member) return msg.fail(`Please mention the member or enter their username/ID in order for me to kick them!`);

  if (!(member instanceof Object)) { // If its not a user mention
    if (msg.guild.members.has(member)) member = msg.guild.members.get(member);
    else member = msg.guild.findMember(member);
  }

  if (member.kickable) {
    try {
      await member.kick(reason);

      return msg.success(`${member.user.tag} has been succesfully kicked by ${msg.author.tag}!`, `${reason ? `**Reason**: ${reason}` : ``}`);
    } catch (error) {
      return msg.error(error, `kick ${member.user.tag}!`);
    }
  } else {
    msg.fail("I can't kick a member with higher privilege/roles than me!");
  }
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: () => `Kick a member.`,
  usage: msg => [`${msg.client.user.id}`, `${msg.author.username}`],
  aliases: [],
  userPermissions: ["KICK_MEMBERS"],
  botPermissions: ["KICK_MEMBERS"],
  runIn: ["text"]
};