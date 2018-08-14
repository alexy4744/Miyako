/* eslint no-undefined: 0 */
/* eslint curly: 0 */

const { Structures } = require("discord.js");
const RethinkDB = require("../database/methods");

Structures.extend("Guild", Guild => {
  class MiyakoGuild extends Guild {
    constructor(...args) {
      super(...args);
      this.db = new RethinkDB("guildData", this.id);
    }

    /**
     * Update the guild's cache.
     * @param {String} key The key to manually update the cache by.
     * @param {String} value The value to set the key manually by.
     * @returns {Promise<Object>} The updated key of the guild's cache.
     */
    updateCache(key, value) {
      return new Promise((resolve, reject) => {
        this.db.get().then(data => resolve(this.cache = data)).catch(e => {
          // If what ever reason it fails to get from database, try to manually update the key with the new value for the cache.
          if (key && value) {
            if (!this.cache) this.cache = {};
            return resolve(this.cache[key] = value);
          } else { // eslint-disable-line
            if (this.cache === undefined) reject(e); // eslint-disable-line
            else return this.db.replace(this.cache).then(() => reject(e)).catch(err => reject(err));
          }
        });
      });
    }

    /**
     * Find a member that matches the best to the given query.
     * @param {String} query The query to find by.
     * @param {String} byDisplayName Whether to search by the member's display name instead of their username.
     * @returns {Object} The object of the member that matches closes to the query.
     */
    findMember(query, byDisplayName) {
      const lastMember = Array.from(this.members.values()).pop();
      let outcome = 0;
      let chosenMember = null;
      let currentMember = null;

      for (const member of this.members) {
        const compared = this.client.utils.compareStrings(byDisplayName ? member[1].displayName : member[1].user.username, query).finalOutcome;
        currentMember = member[1]; // Keep track of the current member so that it knows when to return the final member.

        if (!chosenMember || compared > outcome) {
          chosenMember = member[1];
          outcome = compared;
        } else continue;
      }

      if (currentMember === lastMember) return chosenMember;
    }

    /**
     * Find a role that matches the best to the given query.
     * @param {String} query The query to find by.
     * @returns {Object} The object of the role that matches closes to the query.
     */
    findRole(query) {
      const lastRole = Array.from(this.roles.values()).pop();
      let outcome = 0;
      let chosenRole = null;
      let currentRole = null;

      for (const role of this.roles) {
        const compared = this.client.utils.compareStrings(role[1].name, query).finalOutcome;
        currentRole = role[1];

        if (!chosenRole || compared > outcome) {
          chosenRole = role[1];
          outcome = compared;
        } else continue;
      }

      if (currentRole === lastRole) return chosenRole;
    }

    /**
     * Find a channel that matches the best to the given query.
     * @param {String} query The query to find by.
     * @returns {Object} The object of the channel that matches closes to the query.
     */
    findChannel(query) {
      const lastChannel = Array.from(this.channels.values()).pop();
      let outcome = 0;
      let chosenChannel = null;
      let currentChannel = null;

      for (const channel of this.channels) {
        const compared = this.client.utils.compareStrings(channel[1].name, query).finalOutcome;
        currentChannel = channel[1];

        if (!chosenChannel || compared > outcome) {
          chosenChannel = channel[1];
          outcome = compared;
        } else continue;
      }

      if (currentChannel === lastChannel) return chosenChannel;
    }
  }

  return MiyakoGuild;
});