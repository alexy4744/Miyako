/* eslint no-undefined: 0 */

const { Structures } = require("discord.js");
const RethinkDB = require("../database/methods");

Structures.extend("GuildMember", GuildMember => {
  class MiyakoMember extends GuildMember {
    constructor(...args) {
      super(...args);
      this.db = new RethinkDB("memberData", this.id);
      this.db.on("updated", () => this.updateCache());
      this.cache = this.client._cache.get(this.id);
    }

    async updateCache() {
      const data = await this.db.get();
      return this.client._cache.set(this.id, data);
    }
  }

  return MiyakoMember;
});