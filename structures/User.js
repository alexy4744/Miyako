/* eslint no-undefined: 0 */

const { Structures } = require("discord.js");
const RethinkDB = require("../database/methods");

Structures.extend("User", User => {
  class MiyakoUser extends User {
    _patch(data) {
      super._patch(data);
      this.db = new RethinkDB("userData", this.id);
    }

    /**
     * Update the user's cache.
     * @param {String} key The key to manually update the cache by.
     * @param {String} value The value to set the key manually by.
     * @returns {Promise<Object>} The updated key of the user's cache.
     */
    updateCache(key, value) {
      return new Promise((resolve, reject) => {
        this.db.get().then(data => {
          resolve(this.cache = data);
        }).catch(e => {
          // If what ever reason it fails to get from database, try to manually update the key with the new value of the cache.
          if (key && value) {
            if (!this.cache) this.cache = {};
            else resolve(this.cache[key] = value);
          } else {
            if (this.cache === undefined) reject(e); // eslint-disable-line
            else this.db.replace(this.cache).then(() => reject(e)).catch(err => reject(err));
          }
        });
      });
    }
  }

  return MiyakoUser;
});