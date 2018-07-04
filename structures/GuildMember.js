const { Structures } = require("discord.js");
const RethinkDB = require("../db/methods");

Structures.extend("GuildMember", GuildMember => {
  class VoidMember extends GuildMember {
    _patch(data) {
      super._patch(data);
      this.db = new RethinkDB(this.client, "memberData", this.id);
    }

    updateCache() {
      return new Promise((resolve, reject) => {
        this.db.get().then(data => {
          resolve(this.cache = data);
        }).catch(e => reject(e));
      });
    }
  }

  return VoidMember;
});