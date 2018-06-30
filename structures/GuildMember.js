const { Structures } = require("discord.js");
const RethinkDBMethods = require("../db/methods");

Structures.extend("GuildMember", GuildMember => {
  class VoidMember extends GuildMember {
    _patch(data) {
      super._patch(data);
      this.db = new RethinkDBMethods(this.client, "memberData", this.id);
    }
  }

  return VoidMember;
});