const { exec } = require("child_process");
const { post } = require("snekfetch");

module.exports.run = (client, msg, args) => {
  exec(args.join(" "), (err, stdout, stderr) => {
    if (err) return msg.error(err, "execute this shell command!");
    const output = `**Input**\n\`\`\`dos\n${args.join(" ")}\n\`\`\`\n**Output**\n\`\`\`dos\n${stdout}\n\`\`\`\n**Error**\n\`\`\`dos\n${stderr}\n\`\`\``;
    if (output.length > 2000) {
      post(`https://hastebin.com/documents`).send(`${stdout}\n${"-".repeat(100)}\n${stderr}`).then(url => { // eslint-disable-line
      return msg.channel.send(`Output has been uploaded onto Hastebin as it exceeded 2000 characters!\n**https://hastebin.com/${url.body.key}**`, {
        files: [
          {
            name: "output.txt",
            attachment: Buffer.from(output)
          }
        ]
      });
    }).catch(e => msg.error(e, "execute this shell command!")); // eslint-disable-line
    } else msg.channel.send(output); // eslint-disable-line
  });
};

module.exports.options = {
  enabled: true,
  guarded: true,
  botOwnerOnly: true,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: () => `Execute shell commands`,
  usage: () => [`dir`, `tree`],
  aliases: ["exe"],
  userPermissions: [],
  botPermissions: [],
  runIn: []
};
