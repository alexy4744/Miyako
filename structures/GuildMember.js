const { Structures } = require("discord.js");
const RethinkDB = require("../database/methods");

Structures.extend("GuildMember", GuildMember => {
  class VoidMember extends GuildMember {
    _patch(data) {
      super._patch(data);
      this.db = new RethinkDB(this.client, "memberData", this.id);
    }

    updateCache(key, value, previousDB) {
      return new Promise((resolve, reject) => {
        this.db.get().then(data => {
          resolve(this.cache = data);
        }).catch(e => {
          // If what ever reason it fails to get from database, try to manually update the key with the new value of the cache.
          if (key && value) {
            try {
              if (!this.cache) this.cache = {};
              return resolve(this.cache[key] = value);
            } catch (error) {
              // Try to restore the database to it's previous state. Not failsafe since it would make sense
              // that if it fails to get from database, replacing should also be a problem...
              if (!previousDB) reject(error);
              else this.db.replace(previousDB).then(() => reject(error)).catch(err => reject(err));
            }
          } else reject(e); // eslint-disable-line
        });
      });
    }
  }

  return VoidMember;
});