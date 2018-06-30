/* eslint no-use-before-define: 0 */
/* eslint no-eval: 0 */

module.exports.run = async (client, msg, args) => {
  try {
    let output = true;
    let code = args.join(" ");
    if (code.startsWith("nooutput")) {
      output = false;
      code = args.shift();
      code = args.join(" ");
    }
    if (args[0].toLowerCase() === "async") code = `(async () => {\n${code.slice(6)}\n})();`;
    let evaled = eval(code);

    if (isThenable(evaled)) evaled = await evaled;

    if (typeof evaled !== "string") {
      evaled = require("util").inspect(evaled, {
        depth: 0,
        showHidden: true
      });
    }

    if (output) {
      console.log(evaled);
      const result = clean(evaled).replace(client.token, "SIKE");
      if (result.length > 2048) {
        msg.channel.send("Your output was too long to be sent!", {
          files: [{
            attachment: Buffer.from(result),
            name: "output.txt"
          }]
        }).catch(error => msg.channel.send({
          embed: {
            title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to send this output as a text file!`,
            description: `\`\`\`js\n${error}\n\`\`\``,
            color: msg.colors.fail
          }
        }));
      } else {
        msg.channel.send(`**Input**\n\`\`\`js\n${code}\n\`\`\`\n**Output**\n\`\`\`js\n${result}\n\`\`\``);
      }
    }
  } catch (error) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Error`,
        description: `\`\`\`js\n${clean(error.stack)}\n\`\`\``,
        color: msg.colors.fail
      }
    });
  }

  // https://github.com/dirigeants/klasa/blob/master/src/lib/util/util.js
  const isFunction = input => typeof input === "function";
  const isThenable = input => (input instanceof Promise) || (Boolean(input) && isFunction(input.then) && isFunction(input.catch));

  // https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/examples/making-an-eval-command.md
  const clean = text => {
    if (typeof text === "string") {
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203)); // eslint-disable-line
    } else return text; // eslint-disable-line
  };
};

module.exports.options = {
  enabled: true,
  guarded: true,
  description: "Evaluates JavaScript code",
  nsfw: false,
  aliases: ["ev"],
  botOwnerOnly: true,
  userPermissions: [],
  botPermissions: [],
  runIn: [],
  cooldown: 5
};