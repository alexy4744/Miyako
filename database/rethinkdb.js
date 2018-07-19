const r = require("rethinkdbdash")();

module.exports = class Database {
  /* Database Manipulation */
  dbList() {
    return new Promise((resolve, reject) => {
      r.dbList().run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  dbCreate(dbName) {
    return new Promise((resolve, reject) => {
      r.dbCreate(dbName).run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  dbDelete(dbName) {
    return new Promise((resolve, reject) => {
      r.dbDrop(dbName).run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  /* Table Manipulation */
  tableCreate(tableName) {
    return new Promise((resolve, reject) => {
      r.db("test").tableCreate(tableName).run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  tableDrop(tableName) {
    return new Promise((resolve, reject) => {
      r.db("test").tableDrop(tableName).run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  tableList() {
    return new Promise((resolve, reject) => {
      r.db("test").tableList().run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  /* Data Manipulation */
  insertDocument(tableName, object) {
    return new Promise((resolve, reject) => {
      r.db("test").table(tableName).insert(object)
        .run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  updateDocument(tableName, id, object) {
    return new Promise((resolve, reject) => {
      r.db("test").table(tableName).get(id)
        .update(object)
        .run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  replaceDocument(tableName, id, object) {
    return new Promise((resolve, reject) => {
      r.db("test").table(tableName).get(id)
        .replace(object)
        .run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  deleteDocument(tableName, id) {
    return new Promise((resolve, reject) => {
      r.db("test").table(tableName).get(id)
        .delete()
        .run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  syncTable(tableName) {
    return new Promise((resolve, reject) => {
      r.table(tableName).sync().run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  /* Data Fetching */
  getDocument(tableName, id) {
    return new Promise((resolve, reject) => {
      r.db("test").table(tableName).get(id)
        .run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  // https://stackoverflow.com/questions/43782915/rethinkdb-check-if-record-exists
  hasDocument(tableName, id) {
    return new Promise((resolve, reject) => {
      r.db("test").table(tableName).getAll(id)
        .count()
        .eq(1)
        .run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  status(tableName) {
    return new Promise((resolve, reject) => {
      r.table(tableName).status().run()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }
};