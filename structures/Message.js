/* eslint no-undefined: 0 */

const { Structures } = require("discord.js");

Structures.extend("Message", Message => {
  class MiyakoMessage extends Message {
    constructor(...args) {
      super(...args);
      this.prefix = this.guild ? this.guild.cache ? this.guild.cache.prefix !== undefined ? this.guild.cache.prefix : this.client.prefix : this.client.prefix : this.client.prefix;

      this.emojis = {
        success: "✅  ｜   ",
        default: "☑  ｜   ",
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
          title: `${this.emojis.default}This command has been cancelled!`,
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

    prompt(id, options = {}) {
      if (options.filter && !this.client.utils.is.function(options.filter)) throw new Error("Filter is not a function");

      return new Promise(async (resolve, reject) => {
        if ((this.guild && this.guild.me.hasPermission("ADD_REACTIONS")) || !this.guild) {
          const yes = options.emojis && options.emojis.yes ? options.emojis.yes : this.emojis.success[0];
          const no = options.emojis && options.emojis.no ? options.emojis.no : this.emojis.fail[0];
          const filter = options.filter ? options.filter : (reaction, user) => (reaction.emoji.name === yes || reaction.emoji.name === no) && user.id === id && !user.bot;

          try {
            await this.react(yes);
            await this.react(no);
          } catch (error) {
            await this.delete().catch(() => { });
            return;
          }

          const collectedEmoji = await this.awaitReactions(filter, {
            "time": options.time || 15000,
            "max": options.max || 1,
            "maxEmojis": options.maxEmojis || 1,
            "maxUsers": options.maxUsers || 1,
            "errors": options.error || ["time"]
          }).catch(e => ({
            "error": e
          }));

          await this.delete().catch(() => { });

          if (collectedEmoji.error) return reject(collectedEmoji.error);

          if (collectedEmoji.first().emoji.name === yes) return resolve(true);
          else if (collectedEmoji.first().emoji.name === no) return resolve(false);
        } else {
          const yes = options.yes ? options.yes : "YES";
          const no = options.no ? options.no : "NO";
          const filter = options.filter ? options.filter : message => (message.content === yes || message.content === no) && message.author.id === id && !message.author.bot;

          const collectedMessages = await this.channel.awaitMessages(filter, {
            "time": options.time || 15000,
            "max": options.max || 1,
            "errors": options.errors || ["time"]
          }).catch(e => ({
            "error": e
          }));

          await this.delete().catch(() => { });

          if (collectedMessages.error) return reject(collectedMessages.error);

          if (collectedMessages.first().content === yes) return resolve(true);
          else if (collectedMessages.first().content === no) return resolve(false);
        }
      });
    }
  }

  return MiyakoMessage;
});