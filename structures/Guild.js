/* eslint curly: 0 */

const { Structures } = require("discord.js");

Structures.extend("Guild", Guild => {
  class MiyakoGuild extends Guild {
    constructor(...args) {
      super(...args);
      this.userCooldowns = new Set();
    }

    get cache() {
      return this.client.caches.guilds.get(this.id);
    }

    async syncDatabase() {
      const data = await this.client.db.get("guilds", this.id).catch(error => ({ error }));
      if (data.error) return Promise.reject(data.error);

      this.client.caches.guilds.set(this.id, data);

      return Promise.resolve(this.cache);
    }

    async updateDatabase(data) {
      try {
        if (!data._id) data._id = this.id;
        await this.client.db.update("guilds", data);
        return Promise.resolve(this.cache);
      } catch (error) {
        return Promise.reject(error);
      }
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