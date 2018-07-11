const { exec } = require("child_process");

module.exports.run = (client, msg, args) => {
  exec(args.join(" "), (err, stdout, stderr) => {
    if (err) return msg.error(err, "execute this shell command!");
    return msg.channel.send(`**Input**\n\`\`\`dos\n${args.join(" ")}\n\`\`\`\n**Output**\n\`\`\`dos\n${stdout}\n\`\`\`\n**Error**\n\`\`\`dos\n${stderr}\n\`\`\``);
  });
};

module.exports.options = {
  enabled: true,
  guarded: true,
  botOwnerOnly: true,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: "Execute shell commands",
  aliases: ["exe"],
  userPermissions: [],
  botPermissions: [],
  runIn: []
};
