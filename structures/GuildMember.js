const { Structures } = require("discord.js");
const RethinkDB = require("../database/methods");

Structures.extend("GuildMember", GuildMember => {
  class VoidMember extends GuildMember {
    _patch(data) {
      super._patch(data);
      this.db = new RethinkDB(this.client, "memberData", this.id);
    }

    updateCache(key, value) {
      return new Promise((resolve, reject) => {
        this.db.get().then(data => {
          resolve(this.cache = data);
        }).catch(e => {
          // If what ever reason it fails to get from database,
          // manually update the key with the new value of the cache.
          if (key && value && this.cache) this.cache[key] = value; // eslint-disable-line
          else if (key && value && !this.cache) {
            this.cache = {};
            this.cache[key] = value;
          } else reject(e); // eslint-disable-line
        });
      });
    }
  }

  return VoidMember;
});