/* eslint no-eval: 0 */

const Command = require("../../modules/Base/Command");
const snekfetch = require("snekfetch");
const util = require("util");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: true,
      nsfw: false,
      cooldown: 5,
      description: () => `Execute JavaScript code`,
      usage: () => [`[] instanceof Array`],
      aliases: ["ev"],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  async run(msg, args) {
    try {
      let code = args.join(" ");

      if (args[0] === "async") code = `(async () => {\n${code.slice(6)}\n})();`;

      let evaled = eval(code);
      const type = evaled;

      if (this.client.utils.is.thenable(evaled)) evaled = await evaled;

      if (typeof evaled !== "string") {
        evaled = util.inspect(evaled, {
          depth: 0,
          showHidden: true
        });
      }

      evaled = evaled.replace(this.client.token, "SIKE");
      evaled = evaled.replace(process.env.BOT_IDENTIFIER, "SIKE");

      if (evaled.length < 2000) return msg.channel.send(`**Input**\n\`\`\`js\n${code}\n\`\`\`\n**Output**\n\`\`\`js\n${evaled}\n\`\`\`\n**Type**\n\`\`\`js\n${typeof type}\`\`\``);

      const url = await snekfetch.post(`https://hastebin.com/documents`).send(evaled).then(res => res.body.key);

      return msg.channel.send(`Results have been uploaded onto Hastebin as it exceeded 2000 characters!\n**https://hastebin.com/${url}**`, {
        files: [
          {
            name: "output.txt",
            attachment: Buffer.from(evaled)
          }
        ]
      });
    } catch (error) {
      return msg.error(error, "evaluate this snippet!");
    }
  }
};
