const Event = require("../modules/Base/Event");

module.exports = class Message extends Event {
  constructor(...args) {
    super(...args);
  }

  async run(msg) {
    this.client.messagesPerSecond++;

    if (msg.guild) {
      if (!msg.guild.me.hasPermission("SEND_MESSAGES")) return;
      await this._updateGuildCache(msg);
    }

    if (!await this._checkMonitors(msg)) return;
    if (msg.author.bot) return;

    const prefix = msg.guild ? msg.guild.cache.prefix || this.client.prefix : this.client.prefix;

    if (!msg.content.toLowerCase().startsWith(prefix)) return;

    const args = msg.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (this.client.commands[cmd]) return this.client.runInhibitors(msg, this.client.commands[cmd], args);
    else if (this.client.aliases[cmd]) return this.client.runInhibitors(msg, this.client.commands[this.client.aliases[cmd]], args);
  }

  async _checkMonitors(msg) {
    let count = 0;

    for (const monitor in this.client.monitors) {
      try {
        if (isNaN(count)) break;
        let res = this.client.monitors[monitor].run(msg);
        if (res instanceof Promise) res = await res;
        count += res;
      } catch (error) {
        count += 0;
      }
    }

    if (count < Object.keys(this.client.monitors).length) return false;

    return true;
  }

  async _updateGuildCache(msg) {
    if (!this.client.caches.guilds.has(msg.guild.id)) { // If the cache does not exist in the Map, then cache it
      let guildCache = await this.client.db.get("guilds", msg.guild.id).catch(error => ({ error }));
      if (guildCache && guildCache.error) return console.error(guildCache.error); // Silently fail if an error occurs

      if (!guildCache) {
        try {
          guildCache = { _id: msg.guild.id };
          await this.client.db.insert("guilds", guildCache);
        } catch (error) {
          return console.error(error); // Silently fail if an error occurs
        }
      }

      this.client.caches.guilds.set(msg.guild.id, guildCache);
    }
  }
};