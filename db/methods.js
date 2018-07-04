/* eslint curly: 0 */

module.exports = class RethinkDB {
  constructor(client, tableName, id) {
    this.client = client;
    this.tableName = tableName;
    this.id = id;
  }

  insert(object) {
    return new Promise(async (resolve, reject) => {
      await this.wait(this.tableName).catch(e => reject(e));
      this.client.rethink.insert(this.tableName, object)
      .then(changes => resolve(changes))
      .catch(e => reject(e));
    });
  }

  update(object) {
    return new Promise((resolve, reject) => {
      this.wait(this.tableName).then(boolean => {
        console.log(boolean)
        if (boolean) {
          this.has().then(has => {
            if (has) {
              this.client.rethink.update(this.tableName, this.id, object)
              .then(changes => resolve(changes))
              .catch(e => reject(e));
            } else {
              this.insert({
                id: this.id
              }).then(() => {
                this.wait(this.tableName).then(bool => {
                  if (bool) {
                    this.client.rethink.update(this.tableName, this.id, object)
                    .then(changes => resolve(changes))
                    .catch(e => reject(e));
                  }
                }).catch(e => reject(e));
              }).catch(e => reject(e));
            }
          }).catch(e => reject(e));
        } else reject(new Error("Not Ready"));
      }).catch(e => reject(e));
    });
  }

  replace(object) {
    return new Promise(async (resolve, reject) => {
      await this.wait(this.tableName).catch(e => reject(e));
      this.has().then(boolean => {
        if (!boolean) reject(new Error(`There is nothing to replace as this ID does not exist in ${this.tableName}!`));
        else {
          this.client.rethink.replace(this.tableName, this.id, object)
          .then(changes => resolve(changes))
          .catch(e => reject(e));
        }
      }).catch(e => reject(e));
    });
  }

  remove() {
    return new Promise(async (resolve, reject) => {
      await this.wait(this.tableName).catch(e => reject(e));
      this.has().then(boolean => {
        if (!boolean) reject(new Error(`${this.id} cannot be removed from ${this.tableName} as it does not exists!`));
        else {
          this.client.rethink.delete(this.tableName, this.id)
          .then(changes => resolve(changes))
          .catch(e => reject(e));
        }
      }).catch(e => reject(e));
    });
  }

  sync() {
    return new Promise(async (resolve, reject) => {
      await this.wait(this.tableName).catch(e => reject(e));
      this.client.rethink.sync(this.tableName)
      .then(results => resolve(results))
      .catch(e => reject(e));
    });
  }

  /* Data Fetching */
  get() {
    return new Promise(async (resolve, reject) => {
      await this.wait(this.tableName).catch(e => reject(e));
      this.client.rethink.get(this.tableName, this.id)
      .then(data => resolve(data))
      .catch(e => reject(e));
    });
  }

  has() {
    return new Promise(async (resolve, reject) => {
      await this.wait(this.tableName).catch(e => reject(e));
      this.client.rethink.has(this.tableName, this.id)
      .then(boolean => resolve(boolean))
      .catch(e => reject(e));
    });
  }

  // Only wait for the whole database if I need to since its hella slow.
  // Waiting for one table is ~300-400 ms faster.
  wait(tableName) {
    return new Promise(async (resolve, reject) => {
      await this._checkTable().catch(e => reject(e));
      this.client.rethink.wait(tableName)
      .then(async results => {
        if (tableName) {
          if (results.ready === 1) resolve(true);
          else resolve(false);
        } else {
          const tables = await this.client.rethink.tableList().catch(error => reject(error));
          if (results.ready === tables.length) resolve(true);
          else resolve(false);
        }
      }).catch(e => reject(e));
    });
  }

  /* Check if the table exists, if not, then create it */
  _checkTable() {
    return new Promise(async (resolve, reject) => {
      const tables = await this.client.rethink.tableList().catch(error => reject(error));

      if (!tables.includes(this.tableName)) {
        this.client.rethink.tableCreate(this.tableName).then(() => {
          this.sync().then(() => resolve()).catch(error => reject(error));
        }).catch(error => reject(error));
      } else resolve();
    });
  }
};