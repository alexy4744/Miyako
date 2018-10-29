/* eslint no-undefined: 0 */

const { Structures } = require("discord.js");

Structures.extend("Message", Message => {
  class MiyakoMessage extends Message {
    constructor(...args) {
      super(...args);
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

    fail(action, description, attachment) {
      return this.channel.send({
        embed: {
          title: `${this.emojis.fail}${action}`,
          description: description ? description : null,
          color: this.colors.fail
        },
        files: attachment ? [attachment] : null
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
          description: `\`\`\`js\n${err.stack}\n\`\`\``,
          color: this.colors.fail
        }
      });
    }

    async prompt(id, options = {}) {
      if (options.filter && !this.client.utils.is.function(options.filter)) return Promise.reject(new Error("Filter is not a function"));

      if ((this.guild && this.guild.me.hasPermission("ADD_REACTIONS")) || !this.guild) {
        const yes = options.emojis && options.emojis.yes ? options.emojis.yes : this.emojis.success[0];
        const no = options.emojis && options.emojis.no ? options.emojis.no : this.emojis.fail[0];
        const filter = options.filter ? options.filter : (reaction, user) => (reaction.emoji.name === yes || reaction.emoji.name === no) && user.id === id;

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

        if (collectedEmoji.error) return Promise.reject(collectedEmoji.error);

        if (collectedEmoji.first().emoji.name === yes) return Promise.resolve(true);
        else if (collectedEmoji.first().emoji.name === no) return Promise.resolve(false);
      } else {
        const yes = options.yes ? options.yes : "YES";
        const no = options.no ? options.no : "NO";
        const filter = options.filter ? options.filter : message => (message.content === yes || message.content === no) && message.author.id === id;

        const collectedMessages = await this.channel.awaitMessages(filter, {
          "time": options.time || 15000,
          "max": options.max || 1,
          "errors": options.errors || ["time"]
        }).catch(e => ({
          "error": e
        }));

        await this.delete().catch(() => { });

        if (collectedMessages.error) return Promise.reject(collectedMessages.error);

        if (collectedMessages.first().content === yes) return Promise.resolve(true);
        else if (collectedMessages.first().content === no) return Promise.resolve(false);
      }
    }

    async paginate(pages) {
      if (!pages || !Array.isArray(pages)) return Promise.reject(new Error("No pages provided!"));

      let currPage = 0;
      let prevPage = 0;

      const emojis = {
        "⏮": 0,
        "⬅": currPage < 1 ? 0 : currPage - 1,
        "➡": currPage < pages.length - 2 ? currPage + 1 : pages.length - 1,
        "⏭": pages.length - 1,
        // These buttons should not change the page when clicked.
        "⏹": 0,
        "🔢": 0
      };

      try {
        const message = await this.channel.send(pages[0]);

        for (const emoji in emojis) await message.react(emoji).catch(() => { }); // eslint-disable-line

        const filter = (reaction, user) => reaction.emoji.name in emojis && user.id === this.author.id;
        const collector = message.createReactionCollector(filter, { time: 300000 });

        collector.on("collect", async reaction => {
          if (message.editable) {
            if (reaction.emoji.name === "⏹") return collector.stop();

            if (reaction.emoji.name === "🔢") {
              const ask = await this.channel.send(`${this.author.toString()}, what page would you like to jump to?`);
              const askFilter = msg => msg.author.id === this.author.id && msg.content > 0 && msg.content < pages.length;
              const response = await this.channel.awaitMessages(askFilter, { max: 1, time: 15000, errors: ["time"] }).catch(() => null); // eslint-disable-line
              if (response) {
                currPage = parseInt(response.first().content) - 1;
                if (this.guild.me.hasPermission("MANAGE_MESSAGES")) response.first().delete().catch(() => { });
              }
              ask.delete().catch(() => { });
            } else {
              currPage = emojis[reaction.emoji.name];
            }

            if (this.guild.me.hasPermission("MANAGE_MESSAGES")) reaction.users.remove(this.author);

            if (prevPage === currPage) return;

            prevPage = currPage;

            message.edit(pages[currPage]).catch(() => { });
          }
        });

        collector.on("end", () => {
          if (this.guild.me.hasPermission("MANAGE_MESSAGES")) message.reactions.removeAll();
        });
      } catch (error) {
        // noop
      }
    }
  }

  return MiyakoMessage;
});