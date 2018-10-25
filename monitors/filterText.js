const Monitor = require("../modules/Monitor");

module.exports = class FilterImage extends Monitor {
  constructor(...args) {
    super(...args);
  }

  run(msg) {
    if (!msg.guild.cache.wordFilter || msg.guild.cache.wordFilter.length < 1) return 1;

    const sensitivity = msg.guild.cache.filterText.sensitivity || null;
    const action = msg.guild.cache.filterText.action || "delete";

    let content;

    if (sensitivity === "high") content = msg.content.split(/\s/g).join("");
    if (sensitivity === "extreme") content = msg.content.split(/[-!$%^&*()_+|~=`{}[\]:";'<>?,./\s]/g).join("");

    for (const word of msg.guild.cache.wordFilter) {
      const pattern = new RegExp(`\\b${word}\\b`, "g");

      if (!pattern.test(content)) return 1;

      if (action === "delete") return msg.delete().catch(() => { });
      if (action === "mute") return this.client.runCommand(msg, "mute", ["30m", "Use of a filtered/banned word"]);
    }
  }
};