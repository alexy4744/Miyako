const { Structures } = require("discord.js");

Structures.extend("User", User => {
  class MiyakoUser extends User {
    get cache() {
      return this.client.caches.guilds.get(this.id);
    }

    getAvatar(resolution) {
      return this.displayAvatarURL({
        format: this.displayAvatarURL({ size: 16 }).match(/\.gif/gi) ? "gif" : "png",
        size: isNaN(resolution) ? Number(resolution) : 2048
      });
    }
  }

  return MiyakoUser;
});