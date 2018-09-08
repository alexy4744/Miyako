/* eslint no-undefined: 0 */

const { Structures } = require("discord.js");
const RethinkDB = require("../database/methods");

Structures.extend("GuildMember", GuildMember => {
  class MiyakoMember extends GuildMember {
    constructor(...args) {
      super(...args);
      this.db = new RethinkDB("memberData", this.id);
      this.db.on("updated", () => this.updateCache());
    }

    async updateCache() {
      const data = await this.db.get();

      if (!this.cache) this.cache = {};

      for (const property in data) { // Merge the object
        if (this.cache[property] === undefined) this.cache[property] = data[property];
      }
    }
  }

  return MiyakoMember;
});