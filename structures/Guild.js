const { Structures } = require("discord.js");
const RethinkDB = require("../db/methods");

Structures.extend("Guild", Guild => {
  class VoidGuild extends Guild {
    _patch(data) {
      super._patch(data);
      this.db = new RethinkDB(this.client, "guildData", this.id);
    }

    async updateCache() {
      this.cache = await this.db.get();
    }
  }

  return VoidGuild;
});