/* eslint no-undefined: 0 */

const { Structures } = require("discord.js");
const RethinkDB = require("../database/methods");

Structures.extend("User", User => {
  class MiyakoUser extends User {
    constructor(...args) {
      super(...args);
      this.db = new RethinkDB("userData", this.id);
      this.db.on("updated", () => this.updateCache());
    }

    getAvatar(resolution) {
      const quality = !isNaN(resolution) ? parseInt(resolution) : 2048;

      return this.displayAvatarURL({
        format: this.displayAvatarURL({ size: 16 }).match(/\.gif/gi) ? "gif" : "png",
        size: quality
      });
    }

    async updateCache() {
      const data = await this.db.get();

      if (!this.cache) this.cache = {};

      for (const property in data) { // Merge the object
        if (this.cache[property] === undefined) this.cache[property] = data[property];
      }
    }
  }

  return MiyakoUser;
});