module.exports = class RethinkDBMethods {
    constructor(client, tableName, id) {
      this.client = client;
      this.tableName = tableName;
      this.id = id;
    }

    async insert(object) {
      await this._checkTable();
      return await this.client.db.insert(this.tableName, object).catch(e => console.error(e)); // eslint-disable-line
    }

    async update(object) {
      await this._checkTable();
      const has = await this.has().catch(error => {
        console.error(error);
      });

      if (has === false) {
        await this.insert({
          id: this.id
        }).catch(error => {
          console.error(error);
        });
      }

      return await this.client.db.update(this.tableName, this.id, object).catch(error => { // eslint-disable-line
        console.error(error);
      });
    }

    async replace(object) {
      await this._checkTable();
      if (!await this.has()) throw new Error(`There is nothing to replace as this ID does not exist in ${this.tableName}!`);
      return await this.client.db.replace(this.tableName, this.id, object).catch(e => console.error(e)); // eslint-disable-line
    }

    async remove() {
      await this._checkTable();
      if (!await this.has()) throw new Error(`${this.id} cannot be removed from ${this.tableName} as it does not exists!`);
      return await this.client.db.delete(this.tableName, this.id).catch(e => console.error(e)); // eslint-disable-line
    }

    async sync() {
      await this._checkTable();
      return await this.client.db.sync(this.tableName).catch(e => console.error(e)); // eslint-disable-line
    }

    /* Data Fetching */
    async get() {
      await this._checkTable();
      return await this.client.db.get(this.tableName, this.id).catch(e => console.error(e)); // eslint-disable-line
    }

    async has() {
      await this._checkTable();
      return await this.client.db.has(this.tableName, this.id).catch(e => console.error(e)); // eslint-disable-line
    }

    /* Check if the table exists, if not, then create it */
    async _checkTable() {
      const tables = await this.client.db.tableList();

      if (!tables.includes(this.tableName)) {
        await this.client.db.tableCreate(this.tableName).then(async () => {
          await this.sync().catch(e => console.error(e)); // Sync the database to make sure its saved.
        }).catch(e => console.error(e));
      }
    }
  };