/* eslint no-undefined: 0 */

const { Structures, MessageEmbed } = require("discord.js");
const { colors, emojis } = require("./Constants");

Structures.extend("Message", Message => {
  class MiyakoMessage extends Message {
    constructor(...args) {
      super(...args);
    }

    success(title, description) {
      return this.channel.send(
        new MessageEmbed()
          .setTitle(emojis.success + title)
          .setDescription(description || null)
          .setColor(colors.success)
      );
    }

    fail(title, description) {
      return this.channel.send(
        new MessageEmbed()
          .setTitle(emojis.error + title)
          .setDescription(description || null)
          .setColor(colors.error)
      );
    }

    cancelledCommand(description) {
      return this.channel.send(
        new MessageEmbed()
          .setTitle(`${emojis.default}This command has been cancelled!`)
          .setDescription(description || null)
          .setColor(colors.default)
      );
    }

    error(error) {
      return this.channel.send(
        new MessageEmbed()
          .setTitle(`${emojis.error}Sorry ${this.author.username}, an error has occurred!`)
          .setDescription(error)
          .setColor(colors.error)
      );
    }

    prompt(...args) {
      if (!this.guild || (this.guild && this.guild.me.hasPermission("ADD_REACTIONS"))) return this.promptEmojis(...args);
      return this.promptText(...args);
    }

    async promptEmojis(id, options = {}) {
      const yes = options.yes || emojis.success;
      const no = options.no || emojis.error;
      const filter = (reaction, user) => (reaction.emoji.name === yes || reaction.emoji.name === no) && user.id === id;

      try {
        await this.react(yes);
        await this.react(no);

        await this.delete().catch(() => { /* Just catches the error so it doesn't get passed to the catch block */ });

        const collectedEmoji = await this.awaitReactions(filter, {
          "time": options.time || 15000,
          "max": options.max || 1,
          "maxEmojis": options.maxEmojis || 1,
          "maxUsers": options.maxUsers || 1,
          "errors": options.error || ["time"]
        });

        if (collectedEmoji.first().emoji.name === yes) return Promise.resolve(true);
        else if (collectedEmoji.first().emoji.name === no) return Promise.resolve(false);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    async promptText(id, options = {}) {
      const yes = options.yes || "YES";
      const no = options.no || "NO";
      const filter = message => (message.content === yes || message.content === no) && message.author.id === id;

      try {
        const collectedMessages = await this.channel.awaitMessages(filter, {
          time: options.time || 15000,
          max: options.max || 1,
          errors: options.errors || ["time"]
        });

        await this.delete().catch(() => { /* Just catches the error so it doesn't get passed to the catch block */ });

        if (collectedMessages.first().content === yes) return Promise.resolve(true);
        else if (collectedMessages.first().content === no) return Promise.resolve(false);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    async paginate(pages) {
      if (!pages || !Array.isArray(pages)) return Promise.reject(new Error("No pages provided!"));

      let currPage = 0;
      let prevPage = 0;

      const buttons = {
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

        for (const button in buttons) await message.react(button).catch(() => { }); // eslint-disable-line

        const filter = (reaction, user) => reaction.emoji.name in buttons && user.id === this.author.id;
        const collector = message.createReactionCollector(filter, { time: 60000 });

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