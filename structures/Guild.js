const { Structures } = require("discord.js");

Structures.extend("Guild", Guild => {
  class VoidGuild extends Guild {
    /* Data Manipulation*/
    async insert(object) {
      await this._checkTable();
      return await this.client.db.insert("guildData", object).catch(e => console.error(e)); // eslint-disable-line
    }

    async update(object) {
      await this._checkTable();
      await this.has().then(async boolean => {
        if (boolean === false) {
          await this.insert({
            id: this.id
          }).catch(error => {
            console.error(error);
          });
        }

        return await this.client.db.update("guildData", this.id, object).catch(error => { // eslint-disable-line
          console.error(error);
        });
      }).catch(error => {
        console.error(error);
      });
    }

    async replace(object) {
      if (!await this.has()) throw new Error("There is nothing to replace as this guild ID does not exist in this database!");
      return await this.client.db.replace("guildData", this.id, object).catch(e => console.error(e)); // eslint-disable-line
    }

    async delete() {
      if (!await this.has()) throw new Error("This guild cannot be deleted from guildData as it does not exists!");
      return await this.client.db.delete("guildData", this.id).catch(e => console.error(e)); // eslint-disable-line
    }

    async sync() {
      await this._checkTable();
      return await this.client.db.sync("guildData").catch(e => console.error(e)); // eslint-disable-line
    }

    /* Data Fetching */
    async get() {
      await this._checkTable();
      return await this.client.db.get("guildData", this.id).catch(e => console.error(e)); // eslint-disable-line
    }

    async has() {
      return await this.client.db.has("guildData", this.id).catch(e => console.error(e)); // eslint-disable-line
    }

    /* Create a table if it does not exists for this guild */
    async _checkTable() {
      const tables = await this.client.db.tableList();

      if (!tables.includes("guildData")) {
        await this.client.db.tableCreate("guildData").then(async () => {
          await this.sync().catch(e => console.error(e));
        }).catch(e => console.error(e));
      }
    }
  }

  return VoidGuild;
});