const Monitor = require("../modules/Base/Monitor");

module.exports = class FilterImage extends Monitor {
  constructor(...args) {
    super(...args);
  }

  async run(msg) {
    if (!msg.guild.cache.filterText || !msg.guild.cache.filterText.words || msg.guild.cache.filterText.words.length < 1) return 1;

    const sensitivity = msg.guild.cache.filterText.sensitivity || null;
    const action = msg.guild.cache.filterText.action || "delete";

    let content = msg.content;

    if (sensitivity === "high") content = msg.content.split(/\s/g).join(""); // Remove all whitespaces
    if (sensitivity === "extreme") content = msg.content.split(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/\s]/g).join(""); // Remove special characteres and whitespace

    content = content.toLowerCase();

    const matched = [];

    for (const word of msg.guild.cache.filterText.words) {
      const pattern = new RegExp(`\\b${word}\\b`, "gi");
      if (pattern.test(content)) matched.push(word);
    }

    if (matched.length > 0) {
      await msg.author.send({
        embed: {
          title: `${msg.emojis.fail}Hey! I have detected you using ${matched.length > 1 ? `${matched.length} banned words` : "1 banned word"}.`,
          description: `Please refrain from using any of these words listed in this attachment!.\n\n**Action Taken**: ${msg.guild.cache.filterText.action.toUpperCase()}\n**Words Detected**: ${matched.join(", ")}`,
          color: msg.colors.fail
        }
      }).catch(() => { });

      msg.author.send({
        files: [{
          attachment: Buffer.from(msg.guild.cache.filterText.words.join("\r\n")),
          name: `${msg.guild.name}'s banned words.txt`
        }]
      }).catch(() => { });

      if (action === "delete") msg.delete().catch(() => { });
      else if (action === "mute") this.client.commands.mute.mute(msg.member, this.client.utils.stringToMillis.convert("5m").ms);
      else if (action === "ban") this.client.commands.ban.ban(msg.member, null, "Use of banned words");

      return 0;
    }

    return 1;
  }
};