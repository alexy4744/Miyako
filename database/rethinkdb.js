/* eslint curly: 0*/
const r = require("rethinkdb");

module.exports = class Database {
  constructor() {
    this.db = this.connect();
  }

  async connect() {
    return await r.connect({ // eslint-disable-line
      db: "test"
    }, err => {
      if (err) throw new Error(err);
    });
  }

  ping() {
    const init = Date.now();
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.now().run(conn, (err, timestamp) => {
        if (err) reject(err);
        else resolve(new Date(timestamp).getTime() - init);
      });
    });
  }

  /* Database Manipulation */

  dbList() {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.dbList().run(conn, (err, dbs) => {
        if (err) reject(err);
        else resolve(dbs);
      });
    });
  }

  dbCreate(dbName) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.dbCreate(dbName).run(conn, (err, changes) => {
        if (err) reject(err);
        else resolve(changes);
      });
    });
  }

  dbDelete(dbName) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.dbDrop(dbName).run(conn, (err, changes) => {
        if (err) reject(err);
        else resolve(changes);
      });
    });
  }

  /* Table Manipulation */

  tableCreate(tableName) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.db("test").tableCreate(tableName).run(conn, (err, changes) => {
        if (err) reject(err);
        else resolve(changes);
      });
    });
  }

  tableDrop(tableName) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.db("test").tableDrop(tableName).run(conn, (err, changes) => {
        if (err) reject(err);
        else resolve(changes);
      });
    });
  }

  tableList() {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.db("test").tableList().run(conn, (err, tables) => {
        if (err) reject(err);
        else resolve(tables);
      });
    });
  }

  /* Data Manipulation */

  insert(tableName, object) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.db("test").table(tableName).insert(object)
        .run(conn, (err, changes) => {
          if (err) reject(err);
          else resolve(changes);
        });
    });
  }

  update(tableName, id, object) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.db("test").table(tableName).get(id)
        .update(object)
        .run(conn, (err, changes) => {
          if (err) reject(err);
          else resolve(changes);
        });
    });
  }

  replace(tableName, id, object) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.db("test").table(tableName).get(id)
        .replace(object)
        .run(conn, (err, changes) => {
          if (err) reject(err);
          else resolve(changes);
        });
    });
  }

  delete(tableName, id) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.db("test").table(tableName).get(id)
        .delete()
        .run(conn, (err, changes) => {
          if (err) reject(err);
          else resolve(changes);
        });
    });
  }

  sync(tableName) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.table(tableName).sync().run(conn, (err, synced) => {
        if (err) reject(err);
        else resolve(synced);
      });
    });
  }

  /* Data Fetching */

  get(tableName, id) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.db("test").table(tableName).get(id)
        .run(conn, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
    });
  }

  // https://stackoverflow.com/questions/43782915/rethinkdb-check-if-record-exists
  has(tableName, id) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.db("test").table(tableName).getAll(id)
        .count()
        .eq(1)
        .run(conn, (err, boolean) => {
          if (err) reject(err);
          else resolve(boolean);
        });
    });
  }

  wait(tableName) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      if (tableName !== null || tableName !== undefined) { // eslint-disable-line
        r.table(tableName).wait().run(conn, (err, status) => {
          if (err) reject(err);
          else resolve(status);
        });
      } else {
        r.db("test").wait().run(conn, (err, status) => {
          if (err) reject(err);
          else resolve(status);
        });
      }
    });
  }
};