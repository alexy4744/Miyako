const EventEmitter = require("events");
const { MongoClient } = require("mongodb");

class MongoDB extends EventEmitter {
  constructor() {
    super();
    this.database = null;
    this.cache = {
      client: new Map(),
      guilds: new Map(),
      members: new Map(),
      users: new Map()
    };
  }

  static async initalize() {
    const Database = new MongoDB();
    await Database._init();
    return Database;
  }

  async _init() {
    await this._checkDatabase();
    // this.database.watch().on("change", this._updateCache.bind(this));
  }

  async _checkDatabase() {
    try {
      await this.connect();

      const collections = await this.database.collections().then(colls => colls.map(collection => collection.s.name));

      /* Create the collection if it does not currently exists */
      const expectedCollections = ["client", "users", "guilds", "members"];
      const createdCollections = [];

      for (const collection of expectedCollections) {
        if (collections.includes(collection)) continue;
        else createdCollections.push(this.database.createCollection(collection));
      }

      await Promise.all(createdCollections);

      /* Check whether the database has the document for the bot itself under the "client" collection. */
      const botDocument = await this.get("client", process.env.CLIENT_ID);
      if (!botDocument) await this.insert("client", { _id: process.env.CLIENT_ID });
    } catch (error) {
      throw error;
    }
  }

  _updateCache(data) {
    if (!this.cache[data.ns.coll] || (this.cache[data.ns.coll] && !this.cache[data.ns.coll].has(data.documentKey._id))) return;
    if (data.operationType === "delete" && data.documentKey._id !== process.env.CLIENT_ID) return this.cache[data.ns.coll].delete(data.documentKey._id); // Don't let it delete itself from cache
    if (data.operationType === "insert" || data.operationType === "replace") return this.cache[data.ns.coll].set(data.documentKey._id, data.fullDocument);
    if (data.operationType === "update") {
      const updated = data.updateDescription.updatedFields; // Object with newly added properties
      const removed = data.updateDescription.removedFields; // Array of removed property names
      const cache = this.cache[data.ns.coll].get(data.documentKey._id);

      if (Object.keys(removed).length > 0) {
        for (const prop of removed) {
          if (cache[prop] === process.env.CLIENT_ID) continue; // Don't allow it to delete database reference of itself
          else if (cache[prop]) delete cache[prop]; // If it has this property, then delete it.
        }
      }

      this.cache[data.ns.coll].set(data.documentKey._id, {
        ...cache,
        ...updated
      });
    }
  }

  async connect() {
    const connection = await MongoClient
      .connect("mongodb://localhost:27017/", { useNewUrlParser: true })
      .catch(error => ({ error }));
    if (connection.error) return Promise.reject(connection.error);
    return Promise.resolve(this.database = connection.db("miyako"));
  }

  async ping() {
    const ping = await this.database.admin().ping().catch(error => ({ error }));
    if (ping.error) return Promise.reject(ping.error);
    return Promise.resolve(ping);
  }

  getCollection(where) {
    return new Promise((resolve, reject) => {
      if (!where) return reject(new Error("'where' needs to be specified as a string!"));

      this.database.collection(where, { strict: true }, (error, coll) => {
        if (error) return reject(error);
        return resolve(coll);
      });
    });
  }

  async insert(where, what) {
    if (!what || !(what instanceof Object) || !what._id) {
      return Promise.reject(new Error("The 'what' needs to be an object with the '_id' property!"));
    }

    try {
      const collection = await this.getCollection(where);
      const result = await collection.insertOne(what);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async get(where, _id) {
    if (!_id) return Promise.reject(new Error("You need to include an ID!"));

    try {
      const collection = await this.getCollection(where);
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

    try {
      const collection = await this.getCollection(where);
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

    try {
      const collection = await this.getCollection(where);
      const result = await collection.updateOne({ _id: what._id }, { $set: what }, {
        upsert: upsert ? upsert : true // Insert as new document with the 'what' if this document doesn't exist
      });
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async delete(where, _id) {
    try {
      const collection = await this.getCollection(where);
      const result = await collection.deleteOne({ _id });
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

module.exports = MongoDB;