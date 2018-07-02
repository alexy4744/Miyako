const { Structures } = require("discord.js");
const RethinkDB = require("../db/methods");

Structures.extend("GuildMember", GuildMember => {
  class VoidMember extends GuildMember {
    _patch(data) {
      super._patch(data);
      this.db = new RethinkDB(this.client, "memberData", this.id);
    }

    async updateCache() {
      this.cache = await this.db.get();
    }
  }

  return VoidMember;
});