module.exports = class RethinkDB {
  constructor(client, tableName, id) {
    this.client = client;
    this.tableName = tableName;
    this.id = id;
  }

  async insert(object) {
    await this._checkTable();
    return await this.client.rethink.insert(this.tableName, object).catch(e => console.error(e)); // eslint-disable-line
  }

  async update(object) {
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

    return await this.client.rethink.update(this.tableName, this.id, object).catch(error => { // eslint-disable-line
      console.error(error);
    });
  }

  async replace(object) {
    await this._checkTable();
    if (!await this.has()) console.error(`There is nothing to replace as this ID does not exist in ${this.tableName}!`);
    return await this.client.rethink.replace(this.tableName, this.id, object).catch(e => console.error(e)); // eslint-disable-line
  }

  async remove() {
    await this._checkTable();
    if (!await this.has()) console.error(`${this.id} cannot be removed from ${this.tableName} as it does not exists!`);
    return await this.client.rethink.delete(this.tableName, this.id).catch(e => console.error(e)); // eslint-disable-line
  }

  async sync() {
    await this._checkTable();
    return await this.client.rethink.sync(this.tableName).catch(e => console.error(e)); // eslint-disable-line
  }

  /* Data Fetching */
  async get() {
    await this._checkTable();
    return await this.client.rethink.get(this.tableName, this.id).catch(e => console.error(e)); // eslint-disable-line
  }

  async has() {
    await this._checkTable();
    return await this.client.rethink.has(this.tableName, this.id).catch(e => console.error(e)); // eslint-disable-line
  }

  /* Check if the table exists, if not, then create it */
  async _checkTable() {
    const tables = await this.client.rethink.tableList();

    if (!tables.includes(this.tableName)) {
      await this.client.rethink.tableCreate(this.tableName).then(async () => {
        await this.sync().catch(e => console.error(e)); // Sync the database to make sure its saved.
      }).catch(e => console.error(e));
    }
  }
};