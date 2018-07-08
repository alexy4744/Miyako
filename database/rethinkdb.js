/* eslint curly: 0*/

const r = require("rethinkdb");

module.exports = class Database {
  constructor() {
    this.connection = this.connect().catch(error => error);
  }

  connect() {
    return new Promise((resolve, reject) => {
      r.connect({
        db: "test"
      }, (err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });
  }

  ping() {
    return new Promise((resolve, reject) => {
      const init = Date.now();
      this.connect().then(() => {
        resolve(Date.now() - init);
      }).catch(e => reject(e));
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

  insertDocument(tableName, object) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.db("test").table(tableName).insert(object)
        .run(conn, (err, changes) => {
          if (err) reject(err);
          else resolve(changes);
        });
    });
  }

  updateDocument(tableName, id, object) {
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

  replaceDocument(tableName, id, object) {
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

  deleteDocument(tableName, id) {
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

  syncTable(tableName) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.table(tableName).sync().run(conn, (err, synced) => {
        if (err) reject(err);
        else resolve(synced);
      });
    });
  }

  /* Data Fetching */

  getDocument(tableName, id) {
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
  hasDocument(tableName, id) {
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

  status(tableName) {
    return new Promise(async (resolve, reject) => {
      const conn = await this.connect().catch(e => reject(e));
      r.table(tableName).status().run(conn, (err, status) => {
        if (err) reject(err);
        else resolve(status);
      });
    });
  }
};