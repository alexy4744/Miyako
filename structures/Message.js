const { Structures } = require("discord.js");

Structures.extend("Message", Message => {
  class MiyakoMessage extends Message {
    constructor(...args) {
      super(...args);
      this.prefix = this.guild ? this.guild.cache ? this.guild.cache.prefix !== undefined ? this.guild.cache.prefix : this.client.prefix : this.client.prefix : this.client.prefix;

      this.emojis = {
        success: "✅  ｜   ",
        check: "☑  ｜   ",
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

    success(action, description) {
      return this.channel.send({
        embed: {
          title: `${this.emojis.success}${action}`,
          description: description ? description : null,
          color: this.colors.success
        }
      });
    }

    fail(action, description) {
      return this.channel.send({
        embed: {
          title: `${this.emojis.fail}${action}`,
          description: description ? description : null,
          color: this.colors.fail
        }
      });
    }

    cancelledCommand(description) {
      return this.channel.send({
        embed: {
          title: `${this.emojis.check}This command has been cancelled!`,
          description: description ? description : null,
          color: this.colors.default
        }
      });
    }

    error(err, action) {
      return this.channel.send({
        embed: {
          title: `${this.emojis.fail}Sorry ${this.author.username}, I have failed to ${action}`,
          description: `\`\`\`js\n${err}\n\`\`\``,
          color: this.colors.fail
        }
      });
    }

    noArgs(action) {
      return this.channel.send({
        embed: {
          title: `${this.emojis.fail}${this.author.username}, you must ${action} in order to execute this command!`,
          color: this.colors.fail
        }
      });
    }
  }

  return MiyakoMessage;
});