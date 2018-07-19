/* eslint curly: 0 */
/* eslint no-lonely-if: 0 */
/* eslint no-use-before-define: 0 */

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
        if (ready) {
          this.insertDocument(this.tableName, object)
            .then(changes => resolve(changes))
            .catch(e => reject(e));
        }
      }).catch(e => reject(e));
    });
  }

  update(object) {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) { // If it is ready.
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
        }
      }).catch(e => reject(e));
    });
  }

  replace(object) {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) {
          this.has().then(has => {
            if (has) {
              this.replaceDocument(this.tableName, this.id, object)
                .then(changes => resolve(changes))
                .catch(e => reject(e));
            } else reject(new Error(`There is nothing to replace as this ID does not exist in ${this.tableName}!`));
          }).catch(e => reject(e));
        }
      }).catch(e => reject(e));
    });
  }

  remove() {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) {
          this.has().then(has => {
            if (has) {
              this.deleteDocument(this.tableName, this.id)
                .then(changes => resolve(changes))
                .catch(e => reject(e));
            } else reject(new Error(`${this.id} cannot be removed from ${this.tableName} as it does not exists!`));
          }).catch(e => reject(e));
        }
      }).catch(e => reject(e));
    });
  }

  sync() {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) {
          this.syncTable(this.tableName)
            .then(result => resolve(result))
            .catch(e => reject(e));
        }
      }).catch(e => reject(e));
    });
  }

  /* Data Fetching */
  get() {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) this.getDocument(this.tableName, this.id).then(data => resolve(data)).catch(e => reject(e));
      }).catch(e => reject(e));
    });
  }

  has() {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) this.hasDocument(this.tableName, this.id).then(boolean => resolve(boolean)).catch(e => reject(e));
      }).catch(e => reject(e));
    });
  }

  // Only wait for the whole database if I need to since its hella slow.
  // Waiting for one table is ~300-400 ms faster.
  ready() {
    return new Promise((resolve, reject) => {
      this.status(this.tableName).then(object => {
        // Object model is the ideal object this query should return if the table is ready, so therefore, if I turn the objects into strings and then compare, I can get a result.
        const objectModel = `{"all_replicas_ready":true,"ready_for_outdated_reads":true,"ready_for_reads":true,"ready_for_writes":true}`;
        if (JSON.stringify(object.status) === objectModel) resolve(true);
        else resolve(false);
      }).catch(e => reject(e));
    });
  }
};