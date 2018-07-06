const { Structures } = require("discord.js");

Structures.extend("Message", Message => {
  class VoidMessage extends Message {
    _patch(data) {
      super._patch(data);
      this.emojis = {
        success: "✅  ｜   ",
        fail: "❌  ｜   ",
        pending: "⏳  ｜   ",
        bar: "  ｜   "
      };
      this.colors = {
        success: 0x76B354,
        fail: 0xDE2E43,
        pending: 0xFFAC32,
        empty: 0x36393e,
        default: 0x5089DB
      };
    }

    error(err, action) {
      this.channel.sendMessage({
        embed: {
          title: `${this.emojis.fail}Sorry ${this.author.username}, I have failed to ${action}`,
          description: `\`\`\`js\n${err.stack}\n\`\`\``,
          color: this.colors.fail
        }
      }).catch(() => {
        throw new Error(); // Throw an error to prevent rest break itself from sending more than 1 message in runCmd method.
      });
      throw new Error(); // Throw an error to prevent rest break itself from sending more than 1 message in runCmd method.
    }

    noArgs(action) {
      return this.channel.sendMessage({
        embed: {
          title: `${this.emojis.fail}${this.author.username}, you must ${action} in order to execute this command!`,
          color: this.colors.fail
        }
      }).catch(() => {}); // noop
    }
  }

  return VoidMessage;
});