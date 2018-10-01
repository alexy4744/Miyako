const { MongoClient } = require("mongodb");

class MongoDB {
  constructor() {
    this.database = null;
  }

  static async create() {
    const Database = new MongoDB();
    await Database._init();
    return Database;
  }

  async _init() {
    await this._checkDatabase();
  }

  async _checkDatabase() {
    await this.connect().catch(error => { throw error; });

    const collections = await this.database.collections()
      .then(cols => cols.map(collection => collection.s.name))
      .catch(e => ({ "error": e }));

    if (collections.error) throw collections.error;

    const expectedCollections = ["client", "users", "guilds", "members", "sessions"];

    /* Create the collection if it does not currently exists */
    for (const collection of expectedCollections) {
      if (!collections.includes(collection)) {
        try {
          await this.database.createCollection(collection);
        } catch (error) {
          throw error;
        }
      }
    }
  }

  async connect() {
    const connection = await MongoClient.connect("mongodb://localhost:27017/").catch(e => ({ "error": e }));
    if (connection.error) return Promise.reject(connection.error);
    return Promise.resolve(this.database = connection.db("miyako"));
  }

  getCollection(where) {
    return new Promise((resolve, reject) => {
      if (!where) return reject(new Error("'where' needs to be specified as a string!"));

      this.database.collection(where, { strict: true }, (error, col) => {
        if (error) return reject(error);
        return resolve(col);
      });
    });
  }

  async insert(where, what) {
    if (!what || !(what instanceof Object) || !what._id) {
      return Promise.reject(new Error("The 'what' needs to be an object with the '_id' property!"));
    }

    const collection = await this.getCollection(where).catch(e => ({ "error": e }));
    if (collection.error) return Promise.reject(collection.error);

    try {
      const result = await collection.insertOne(what);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async get(where, _id) {
    if (!_id) return Promise.reject(new Error("You need to include an ID!"));

    const collection = await this.getCollection(where).catch(e => ({ "error": e }));
    if (collection.error) return Promise.reject(collection.error);

    try {
      const result = await collection.findOne({ _id });
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async replace(where, what) {
    if (!what || !(what instanceof Object) || !what._id) {
      return Promise.reject(new Error("The 'what' needs to be an object with the '_id' property!"));
    }

    const collection = await this.getCollection(where).catch(e => ({ "error": e }));
    if (collection.error) return Promise.reject(collection.error);

    try {
      const result = await collection.replaceOne({ _id: what._id }, what);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async update(where, what, upsert) {
    if (!what || !(what instanceof Object) || !what._id) {
      return Promise.reject(new Error("The 'what' needs to be an object with the '_id' property!"));
    }

    const collection = await this.getCollection(where).catch(e => ({ "error": e }));
    if (collection.error) return Promise.reject(collection.error);

    try {
      const result = await collection.updateOne({ _id: what._id }, { $set: what }, {
        upsert: upsert ? upsert : true // Insert as new document with the 'what' if this document doesn't exist
      });
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async delete(where, _id) {
    const collection = await this.getCollection(where).catch(e => ({ "error": e }));
    if (collection.error) return Promise.reject(collection.error);

    try {
      const result = await collection.deleteOne({ _id });
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

module.exports = MongoDB;