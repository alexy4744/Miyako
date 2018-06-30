const { Structures } = require("discord.js");
const RethinkDBMethods = require("../db/methods");

Structures.extend("User", User => {
  class VoidUser extends User {
    _patch(data) {
      super._patch(data);
      this.db = new RethinkDBMethods(this.client, "userData", this.id);
    }
  }

  return VoidUser;
});