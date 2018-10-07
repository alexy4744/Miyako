const { Structures } = require("discord.js");

Structures.extend("GuildMember", GuildMember => {
  class MiyakoMember extends GuildMember {
    get cache() {
      return this.client.cache.guilds.get(this.id);
    }
  }

  return MiyakoMember;
});