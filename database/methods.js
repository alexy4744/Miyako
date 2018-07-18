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

  insert(object, disableRetry) {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) {
          this.insertDocument(this.tableName, object)
            .then(changes => resolve(changes))
            .catch(e => reject(e));
        } else {
          if (!disableRetry) {
            this._retry("insertDocument", 1000, false, object)
              .then(changes => resolve(changes))
              .catch(e => reject(e));
          } else reject(new Error("Database is not ready and retry is disabled, error occured on method \"<db>#insert()\""));
        }
      }).catch(e => reject(e));
    });
  }

  update(object, disableRetry) {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) { // If it is ready.
          this.has().then(has => { // Check if it has this record.
            if (has) { // If it has, then directly update the datebase.
              this.updateDocument(this.tableName, this.id, object)
                .then(changes => resolve(changes))
                .catch(e => reject(e));
            } else { // If it doesn't have this record,
              object.id = this.id;
              this.insert(object).then(changes => resolve(changes)).catch(e => reject(e));
            }
          }).catch(e => reject(e));
        } else {
          if (!disableRetry) retry();
          else reject(new Error("Database is not ready and retry is disabled, error occured on method \"<db>#update()\""));
        }
      }).catch(e => reject(e));

      function retry() { // Not really worth rewriting this._retry() just for one method so I just made a function
        let attempts = 0;
        let completed = false;

        if (attempts < this.retryAttempts) {
          const retry = setInterval(() => { // eslint-disable-line
            if (attempts >= this.retryAttempts) {
              clearInterval(retry); // Stop counting the number of attempts
              // If the amount of attempts exceeds the limit and the database is still not ready, reject for potential errors
              if (!completed) reject(new Error(`Database is still not ready after ${attempts} attempts while updating, please try again later`));
            }

            attempts++; // Increase the number of tried attempts

            this.ready(this.tableName).then(ready => { // Check again if its ready right after it inserts this new entry.
              if (ready) { // If its ready again, then update the database.
                this.has().then(has => {
                  if (has) {
                    this.updateDocument(this.tableName, this.id, object).then(changes => {
                      clearInterval(retry);
                      completed = true;
                      return resolve(changes);
                    }).catch(e => {
                      clearInterval(retry);
                      return reject(e);
                    });
                  } else {
                    object.id = this.id;
                    this.insert(object).then(changes => {
                      clearInterval(retry);
                      completed = true;
                      return resolve(changes);
                    }).catch(e => {
                      clearInterval(retry);
                      return reject(e);
                    });
                  }
                }).catch(e => {
                  clearInterval(retry);
                  return reject(e);
                });
              }
            });
          }, 1000);
        }
      }
    });
  }

  replace(object, disableRetry) {
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
        } else {
          if (!disableRetry) this._retry("replaceDocument", 1000, true).then(changes => resolve(changes)).catch(e => reject(e));
          else reject(new Error("Database is not ready and retry is disabled, error occured on method \"<db>#replace()\""));
        }
      }).catch(e => reject(e));
    });
  }

  remove(disableRetry) {
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
        } else {
          if (!disableRetry) this._retry("deleteDocument", 1000, true).then(changes => resolve(changes)).catch(e => reject(e));
          else reject(new Error("Database is not ready and retry is disabled, error occured on method \"<db>#remove()\""));
        }
      }).catch(e => reject(e));
    });
  }

  sync(disableRetry) {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) {
          this.syncTable(this.tableName)
            .then(result => resolve(result))
            .catch(e => reject(e));
        } else {
          if (!disableRetry) this._retry("syncTable", 1000, false).then(results => resolve(results)).catch(e => reject(e));
          else reject(new Error("Database is not ready and retry is disabled, error occured on method \"<db>#sync()\""));
        }
      }).catch(e => reject(e));
    });
  }

  /* Data Fetching */
  get(disableRetry) {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) {
          this.getDocument(this.tableName, this.id).then(data => resolve(data)).catch(e => reject(e));
        } else {
          if (!disableRetry) this._retry("getDocument", 1000, false).then(data => resolve(data)).catch(e => reject(e));
          else reject(new Error("Database is not ready and retry is disabled, error occured on method \"<db>#get()\""));
        }
      }).catch(e => reject(e));
    });
  }

  has(disableRetry) {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) {
          this.hasDocument(this.tableName, this.id).then(boolean => resolve(boolean)).catch(e => reject(e));
        } else {
          if (!disableRetry) this._retry("hasDocument", 500, false).then(boolean => resolve(boolean)).catch(e => reject(e));
          else reject(new Error("Database is not ready and retry is disabled, error occured on method \"<db>#has()\""));
        }
      }).catch(e => reject(e));
    });
  }

  // Only wait for the whole database if I need to since its hella slow.
  // Waiting for one table is ~300-400 ms faster.
  ready(tableName) {
    return new Promise((resolve, reject) => {
      if (!tableName) return reject(new Error(`The name of the table must be included in the ready method!`));
      this.status(tableName).then(object => {
        const objectModel = `{"all_replicas_ready":true,"ready_for_outdated_reads":true,"ready_for_reads":true,"ready_for_writes":true}`;
        if (JSON.stringify(object.status) === objectModel) resolve(true);
        else resolve(false);
      }).catch(e => reject(e));
    });
  }

  /* Retry for x amount of attempts before rejecting with an error */
  _retry(method, interval, checkHas, object) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      let completed = false;
      if (!this.retryAttempts || isNaN(this.retryAttempts)) return reject(new Error("Database retry attempts must be a number"));

      if (attempts < this.retryAttempts) {
        const retry = setInterval(() => { // eslint-disable-line
          if (attempts >= this.retryAttempts) {
            clearInterval(retry); // Stop counting the number of attempts
            // If the amount of attempts exceeds the limit and the database is still not ready, reject
            if (!completed) reject(new Error(`${this.tableName} is still not ready after ${attempts} attempts during ${method}, please contact FreezIn#4565`));
          }

          attempts++; // Increase the number of tried attempts

          this.ready(this.tableName).then(boolean => { // Check if its ready for each attempt.
            if (boolean) { // If its ready now, then update the database.
              if (checkHas) {
                this.has().then(has => {
                  if (!has) {
                    this[method](this.tableName, this.id, object ? object : null).then(results => {
                      clearInterval(retry);
                      completed = true;
                      return resolve(results);
                    }).catch(e => {
                      clearInterval(retry);
                      return reject(e);
                    });
                  } else reject(new Error(`${this.id} cannot be ${method}d as it does not exist in ${this.tableName} while retrying!`));
                }).catch(e => reject(e));
              } else {
                this[method](this.tableName, this.id, object ? object : null).then(results => {
                  clearInterval(retry);
                  completed = true;
                  return resolve(results);
                }).catch(e => {
                  clearInterval(retry);
                  return reject(e);
                });
              }
            }
          }).catch(e => reject(e));
        }, interval);
      }
    });
  }
};