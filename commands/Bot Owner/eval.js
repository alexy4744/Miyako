/* eslint no-eval: 0 */
const util = require("util");

module.exports.run = async (client, msg, args) => {
  // https://github.com/dirigeants/klasa/blob/master/src/lib/util/util.js
  const isFunction = input => typeof input === "function";
  const isThenable = input => (input instanceof Promise) || (Boolean(input) && isFunction(input.then) && isFunction(input.catch));

  // https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/examples/making-an-eval-command.md
  const clean = text => {
    if (typeof text === "string") {
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203)); // eslint-disable-line
    } else return text; // eslint-disable-line
  };

  try {
    let output = true;
    let code = args.join(" ");
    let rawOutput;
    let consoleOutput;
    if (code.startsWith("nooutput")) {
      output = false;
      code = args.shift();
      code = args.join(" ");
    }
    if (args[0].toLowerCase() === "async") code = `(async () => {\n  ${code.slice(6)}\n})();`;
    let evaled = eval(code);

    if (isThenable(evaled)) evaled = await evaled;

    if (typeof evaled !== "string") {
      rawOutput = util.inspect(evaled, {
        depth: 0,
        showHidden: true
      });

      consoleOutput = util.inspect(evaled, {
        depth: 0,
        showHidden: true,
        colors: true
      });
    }

    if (output) {
      console.log(consoleOutput);
      const result = clean(rawOutput).replace(client.token, "SIKE");
      if (result.length > 2048) {
        msg.channel.send("Your output was too long to be sent!", {
          files: [{
            attachment: Buffer.from(result),
            name: "output.txt"
          }]
        }).catch(error => msg.error(error, "send this output as a text file!"));
      } else {
        msg.channel.send(`**Input**\n\`\`\`js\n${code}\n\`\`\`\n**Output**\n\`\`\`js\n${result}\n\`\`\``);
      }
    }
  } catch (error) {
    return msg.error(error, "evaluate this snippet!");
  }
};

module.exports.options = {
  enabled: true,
  guarded: true,
  botOwnerOnly: true,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: "Execute JavaScript code.",
  aliases: ["ev"],
  userPermissions: [],
  botPermissions: [],
  runIn: []
};