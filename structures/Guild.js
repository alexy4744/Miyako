const { Structures } = require("discord.js");
const RethinkDBMethods = require("../db/methods");

Structures.extend("Guild", Guild => {
  class VoidGuild extends Guild {
    _patch(data) {
      super._patch(data);
      this.db = new RethinkDBMethods(this.client, "guildData", this.id);
    }
  }

  return VoidGuild;
});