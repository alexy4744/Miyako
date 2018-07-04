const { Structures } = require("discord.js");
const RethinkDB = require("../db/methods");

Structures.extend("User", User => {
  class VoidUser extends User {
    _patch(data) {
      super._patch(data);
      this.db = new RethinkDB(this.client, "userData", this.id);
    }

    updateCache() {
      return new Promise((resolve, reject) => {
        this.db.get().then(data => {
          resolve(this.cache = data);
        }).catch(e => reject(e));
      });
    }
  }

  return VoidUser;
});