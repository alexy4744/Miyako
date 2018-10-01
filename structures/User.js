/* eslint no-undefined: 0 */

const { Structures } = require("discord.js");

Structures.extend("User", User => {
  class MiyakoUser extends User {
    getAvatar(resolution) {
      const quality = !isNaN(resolution) ? parseInt(resolution) : 2048;

      return this.displayAvatarURL({
        format: this.displayAvatarURL({ size: 16 }).match(/\.gif/gi) ? "gif" : "png",
        size: quality
      });
    }
  }

  return MiyakoUser;
});