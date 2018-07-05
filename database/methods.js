/* eslint curly: 0 */
/* eslint no-lonely-if: 0 */
/* eslint no-use-before-define: 0 */

module.exports = class RethinkDB {
  constructor(client, tableName, id) {
    this.client = client;
    this.tableName = tableName;
    this.id = id;
  }

  insert(object, disableRetry) {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) {
          this.client.rethink.insert(this.tableName, object)
            .then(changes => resolve(changes))
            .catch(e => reject(e));
        } else {
          if (!disableRetry) {
            this._retry("insert", 1000, false, object)
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
              this.client.rethink.update(this.tableName, this.id, object)
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

      function retry() {
        let attempts = 0;
        let completed = false;

        if (attempts < this.client.retryAttempts) {
          const interval = setInterval(() => { // eslint-disable-line
            if (attempts >= this.client.retryAttempts) {
              clearInterval(interval); // Stop counting the number of attempts
              // If the amount of attempts exceeds the limit and the database is still not ready, reject for potential errors
              if (!completed) reject(new Error(`Database is still not ready after ${attempts} attempts while updating, please try again later`));
            }

            attempts++; // Increase the number of tried attempts

            this.ready(this.tableName).then(ready => { // Check again if its ready right after it inserts this new entry.
              if (ready) { // If its ready again, then update the database.
                this.has().then(has => { // Don't let this.has() retry itself just in case
                  if (has) {
                    this.client.rethink.update(this.tableName, this.id, object).then(changes => {
                      clearInterval(interval);
                      completed = true;
                      return resolve(changes);
                    }).catch(e => {
                      clearInterval(interval);
                      return reject(e);
                    });
                  } else {
                    object.id = this.id;
                    this.insert(object).then(changes => {
                      clearInterval(interval);
                      completed = true;
                      return resolve(changes);
                    }).catch(e => {
                      clearInterval(interval);
                      return reject(e);
                    });
                  }
                }).catch(e => {
                  clearInterval(interval);
                  return reject(e);
                });
              }
            });
          }, 1000);
        }
      }
    });
  }

  replace(object, disableRetry) { // check has = true third param this._retry()
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) {
          this.has().then(has => {
            if (has) {
              this.client.rethink.replace(this.tableName, this.id, object)
                .then(changes => resolve(changes))
                .catch(e => reject(e));
            } else reject(new Error(`There is nothing to replace as this ID does not exist in ${this.tableName}!`));
          }).catch(e => reject(e));
        } else {
          if (!disableRetry) this._retry("replace", 1000, true).then(changes => resolve(changes)).catch(e => reject(e));
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
              this.client.rethink.delete(this.tableName, this.id)
                .then(changes => resolve(changes))
                .catch(e => reject(e));
            } else reject(new Error(`${this.id} cannot be removed from ${this.tableName} as it does not exists!`));
          }).catch(e => reject(e));
        } else {
          if (!disableRetry) this._retry("delete", 1000, true).then(changes => resolve(changes)).catch(e => reject(e));
          else reject(new Error("Database is not ready and retry is disabled, error occured on method \"<db>#remove()\""));
        }
      }).catch(e => reject(e));
    });
  }

  sync(disableRetry) {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) {
          this.client.rethink.sync(this.tableName)
            .then(result => resolve(result))
            .catch(e => reject(e));
        } else {
          if (!disableRetry) this._retry("sync", 1000, false).then(results => resolve(results)).catch(e => reject(e));
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
          this.client.rethink.get(this.tableName, this.id).then(data => resolve(data)).catch(e => reject(e));
        } else {
          if (!disableRetry) this._retry("get", 1000, false).then(data => resolve(data)).catch(e => reject(e));
          else reject(new Error("Database is not ready and retry is disabled, error occured on method \"<db>#get()\""));
        }
      }).catch(e => reject(e));
    });
  }

  has(disableRetry) {
    return new Promise((resolve, reject) => {
      this.ready(this.tableName).then(ready => {
        if (ready) {
          this.client.rethink.has(this.tableName, this.id).then(boolean => resolve(boolean)).catch(e => reject(e));
        } else {
          if (!disableRetry) this._retry("has", 500, false).then(boolean => resolve(boolean)).catch(e => reject(e));
          else reject(new Error("Database is not ready and retry is disabled, error occured on method \"<db>#has()\""));
        }
      }).catch(e => reject(e));
    });
  }

  // Only wait for the whole database if I need to since its hella slow.
  // Waiting for one table is ~300-400 ms faster.
  ready(tableName) {
    return new Promise(async (resolve, reject) => {
      if (!tableName) return reject(new Error(`The name of the table must be included in the ready method!`));
      await this._checkTable().catch(e => reject(e));
      this.client.rethink.status(tableName).then(object => {
        const objectModel = `{"all_replicas_ready":true,"ready_for_outdated_reads":true,"ready_for_reads":true,"ready_for_writes":true}`;
        if (JSON.stringify(object.status) === objectModel) resolve(true);
        else resolve(false);
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

  /* Retry for x amount of attempts before rejecting with an error */
  _retry(method, interval, checkHas, object) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      let completed = false;
      if (!this.client.retryAttempts) return reject(new Error("<Client>#retryAttempts is undefined or null"));

      if (attempts < this.client.retryAttempts) {
        const retry = setInterval(() => { // eslint-disable-line
          if (attempts >= this.client.retryAttempts) {
            clearInterval(retry); // Stop counting the number of attempts
            // If the amount of attempts exceeds the limit and the database is still not ready, reject
            if (!completed) reject(new Error(`Database is still not ready after ${attempts} attempts while ${method}ing, please contact FreezIn#4565`));
          }

          attempts++; // Increase the number of tried attempts

          this.ready(this.tableName).then(b => { // Check if its ready for each attempt.
            if (b) { // If its ready now, then update the database.
              if (checkHas) {
                this.has().then(has => {
                  if (!has) {
                    this.client.rethink[method](this.tableName, this.id, object || null).then(results => {
                      clearInterval(interval);
                      completed = true;
                      return resolve(results);
                    }).catch(e => {
                      clearInterval(interval);
                      return reject(e);
                    });
                  } else reject(new Error(`${this.id} cannot be ${method}d as it does not exist in ${this.tableName} while retrying!`));
                }).catch(e => reject(e));
              } else {
                this.client.rethink[method](this.tableName, this.id, object || null).then(results => {
                  clearInterval(interval);
                  completed = true;
                  return resolve(results);
                }).catch(e => {
                  clearInterval(interval);
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