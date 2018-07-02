const { Structures } = require("discord.js");
const RethinkDB = require("../db/methods");

Structures.extend("User", User => {
  class VoidUser extends User {
    _patch(data) {
      super._patch(data);
      this.db = new RethinkDB(this.client, "userData", this.id);
    }

    async updateCache() {
      this.cache = await this.db.get();
    }
  }

  return VoidUser;
});