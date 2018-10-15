const { post } = require("snekfetch");
const childProcess = require("child_process");
const { promisify } = require("util");
const exec = promisify(childProcess.exec);

const Command = require("../../modules/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: true,
      nsfw: false,
      cooldown: 5,
      description: () => `Execute shell commands`,
      usage: () => [`dir`, `tree`],
      aliases: ["exe"],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  async run(msg, args) {
    if (!args[0]) return msg.fail("Must enter a command to execute!");

    const result = await exec(args.join(" ")).catch(error => ({ error }));

    if (result.error) return msg.error("execute this command!", result.error);

    if (result.stdout.length > 2000) {
      post(`https://hastebin.com/documents`)
        .send(result.stdout)
        .then(url => {
          msg.channel.send(`Output has been uploaded onto Hastebin as it exceeded 2000 characters!\n**https://hastebin.com/${url.body.key}**`, {
            files: [
              {
                name: "output.txt",
                attachment: Buffer.from(result.stdout)
              }
            ]
          });
        })
        .catch(e => msg.error(e, "execute this shell command!"));
    } else {
      msg.channel.send(`**Input**\n\`\`\`dos\n${args.join(" ")}\n\`\`\`\n**Output**\n\`\`\`dos\n${result.stdout}\n\`\`\``);
    }
  }
};
