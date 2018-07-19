/* eslint curly: 0 */

const Database = require("./rethinkdb");

module.exports = class RethinkDB extends Database {
  constructor(tableName, id) {
    super();
    this.retryAttempts = 5;
    this.tableName = tableName;
    this.id = id;
  }

  insert(object) {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready === true) {
          this.insertDocument(this.tableName, object)
            .then(changes => resolve(changes))
            .catch(e => reject(e));
        } else reject(new Error(`${this.tableName} is still not ready after 5 attempts while inserting objects into this table.`));
      }).catch(e => reject(e));
    });
  }

  update(object) {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready === true) { // If it is ready.
          this.has().then(has => { // Check if it has this record.
            if (has) { // If it has, then directly update the datebase.
              this.updateDocument(this.tableName, this.id, object)
                .then(changes => resolve(changes))
                .catch(e => reject(e));
            } else { // If it doesn't have this record,
              object.id = this.id; // Make a new property that corresponds to this id inside of the provided object, then insert it into the database.
              this.insert(object).then(changes => resolve(changes)).catch(e => reject(e));
            }
          }).catch(e => reject(e));
        } else reject(new Error(`${this.tableName} is still not ready after 5 attempts while updating ${this.id}.`));
      }).catch(e => reject(e));
    });
  }

  replace(object) {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready === true) {
          this.has().then(has => {
            if (has) {
              this.replaceDocument(this.tableName, this.id, object)
                .then(changes => resolve(changes))
                .catch(e => reject(e));
            } else reject(new Error(`There is nothing to replace as this ID does not exist in ${this.tableName}!`));
          }).catch(e => reject(e));
        } else reject(new Error(`${this.tableName} is still not ready after 5 attempts while replacing ${this.id}.`));
      }).catch(e => reject(e));
    });
  }

  remove() {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready === true) {
          this.has().then(has => {
            if (has) {
              this.deleteDocument(this.tableName, this.id)
                .then(changes => resolve(changes))
                .catch(e => reject(e));
            } else reject(new Error(`${this.id} cannot be removed from ${this.tableName} as it does not exists!`));
          }).catch(e => reject(e));
        } else reject(new Error(`${this.tableName} is still not ready after 5 attempts while removing ${this.id}.`));
      }).catch(e => reject(e));
    });
  }

  sync() {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready === true) {
          this.syncTable(this.tableName)
            .then(result => resolve(result))
            .catch(e => reject(e));
        } else {
          reject(new Error(`${this.tableName} is still not ready after 5 attempts while syncing this table.`));
        }
      }).catch(e => reject(e));
    });
  }

  /* Data Fetching */
  get() {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready === true) this.getDocument(this.tableName, this.id).then(data => resolve(data)).catch(e => reject(e));
        else reject(new Error(`${this.tableName} is still not ready after 5 attempts while getting from table.`));
      }).catch(e => reject(e));
    });
  }

  has() {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready === true) this.hasDocument(this.tableName, this.id).then(boolean => resolve(boolean)).catch(e => reject(e));
        else reject(new Error(`${this.tableName} is still not ready after 5 attempts while checking if ${this.id} exists in this table.`));
      }).catch(e => reject(e));
    });
  }

  ready() {
    return new Promise((resolve, reject) => {
      this.status(this.tableName).then(object => {
        // Object model is the ideal object this query should return if the table is ready, so therefore, if I turn the objects into strings and then compare, I can get a result.
        const objectModel = `{"all_replicas_ready":true,"ready_for_outdated_reads":true,"ready_for_reads":true,"ready_for_writes":true}`;

        if (JSON.stringify(object.status) === objectModel) resolve(true);
        else {
          let attempts = 0;
          let isReady = false;

          const retry = setInterval(() => {
            if (attempts >= this.retryAttempts) {
              clearInterval(retry);
              if (isReady) resolve(true);
              else resolve(false);
              return null; // Returning null gives me lower memory usages.
            }

            if (attempts < this.retryAttempts) {
              attempts++;

              this.status(this.tableName).then(obj => {
                if (JSON.stringify(obj.status) === objectModel) {
                  clearInterval(retry);
                  isReady = true;
                  resolve(true);
                  return null;
                }
              }).catch(e => {
                clearInterval(retry);
                reject(e);
                return null;
              });
            }
          }, 1000);
        }
      }).catch(e => reject(e));
    });
  }
};