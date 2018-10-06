const EventEmitter = require("events");
const { MongoClient } = require("mongodb");

class MongoDB extends EventEmitter {
  constructor() {
    super();
    this.database = null;
  }

  static async create() {
    const Database = new MongoDB();
    await Database._init();
    return Database;
  }

  async _init() {
    await this._checkDatabase();
    this._watch();
  }

  async _checkDatabase() {
    await this.connect().catch(error => { throw error; });

    const collections = await this.database.collections()
      .then(colls => colls.map(collection => collection.s.name))
      .catch(e => ({ "error": e }));

    if (collections.error) throw collections.error;

    const expectedCollections = ["client", "users", "guilds", "members"];

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

    // Check whether the database has the document for the bot itself under the "client" collection.
    const botDocument = await this.get("client", process.env.CLIENT_ID).catch(e => ({ "error": e }));
    if (botDocument && botDocument.error) throw botDocument.error;

    if (!botDocument) {
      try {
        await this.insert("client", { _id: process.env.CLIENT_ID });
      } catch (error) {
        throw error;
      }
    }
  }

  _watch() {
    this.database.watch().on("change", data => this.emit("change", data));
  }

  async connect() {
    const connection = await MongoClient.connect("mongodb://localhost:27017/", { useNewUrlParser: true }).catch(e => ({ "error": e }));
    if (connection.error) return Promise.reject(connection.error);
    return Promise.resolve(this.database = connection.db("miyako"));
  }

  async ping() {
    const ping = await this.database.admin().ping().catch(e => ({ "error": e }));
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