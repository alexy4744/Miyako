const { Structures } = require("discord.js");

Structures.extend("GuildMember", GuildMember => {
  class VoidMember extends GuildMember {
    /* Data Manipulation*/
    async insert(object) {
      await this._checkTable();
      return await this.client.db.insert("memberData", object).catch(e => console.error(e)); // eslint-disable-line
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

        return await this.client.db.update("memberData", this.id, object).catch(error => { // eslint-disable-line
          console.error(error);
        });
      }).catch(error => {
        console.error(error);
      });
    }

    async replace(object) {
      if (!await this.has()) throw new Error("There is nothing to replace as this member ID does not exist in this database!");
      return await this.client.db.replace("memberData", this.id, object).catch(e => console.error(e)); // eslint-disable-line
    }

    async delete() {
      if (!await this.has()) throw new Error("This member cannot be deleted from memberData as it does not exists!");
      return await this.client.db.delete("memberData", this.id).catch(e => console.error(e)); // eslint-disable-line
    }

    async sync() {
      await this._checkTable();
      return await this.client.db.sync("memberData").catch(e => console.error(e)); // eslint-disable-line
    }

    /* Data Fetching */
    async get() {
      await this._checkTable();
      return await this.client.db.get("memberData", this.id).catch(e => console.error(e)); // eslint-disable-line
    }

    async has() {
      return await this.client.db.has("memberData", this.id).catch(e => console.error(e)); // eslint-disable-line
    }

    /* Create a table if it does not exists for this guild */
    async _checkTable() {
      const tables = await this.client.db.tableList();

      if (!tables.includes("memberData")) {
        await this.client.db.tableCreate("memberData").then(async () => {
          await this.sync().catch(e => console.error(e));
        }).catch(e => console.error(e));
      }
    }
  }

  return VoidMember;
});