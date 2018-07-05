const { Structures } = require("discord.js");
const RethinkDB = require("../database/methods");

Structures.extend("Guild", Guild => {
  class VoidGuild extends Guild {
    _patch(data) {
      super._patch(data);
      this.db = new RethinkDB(this.client, "guildData", this.id);
    }

    updateCache() {
      return new Promise((resolve, reject) => {
        this.db.get().then(data => {
          resolve(this.cache = data);
        }).catch(e => reject(e));
      });
    }
  }

  return VoidGuild;
});