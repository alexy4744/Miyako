const Monitor = require("../modules/Base/Monitor");

module.exports = class FilterImage extends Monitor {
  constructor(...args) {
    super(...args);
  }

  run(msg) {
    if (!msg.guild.cache.filterText || !msg.guild.cache.filterText.words || msg.guild.cache.filterText.words.length < 1) return 1;

    const content = this.sanitizeContent(msg);
    const matched = this.test(msg, content);
    if (matched.length < 1) return 1;

    this.takeAction(msg, matched);

    return 0;
  }

  sanitizeContent(msg) {
    const sensitivity = msg.guild.cache.filterText.sensitivity || null;
    let content = msg.content;

    if (sensitivity === "high") content = content.split(/\s/g).join(" "); // Remove all whitespaces join space see
    if (sensitivity === "extreme") content = content.split(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/\s]/g).join(" "); // Remove special characteres and whitespace

    return content;
  }

  test(msg, content) {
    const matched = [];

    for (const word of msg.guild.cache.filterText.words) {
      const pattern = new RegExp(`\\b${word}\\b`, "gi");
      if (pattern.test(content)) matched.push(word);
    }

    return matched;
  }

  async takeAction(msg, matched) {
    const action = msg.guild.cache.filterText.action || "delete";

    if (action === "delete") msg.delete().catch(() => { });
    else if (action === "mute") this.client.commands.mute.mute(msg.member, this.client.utils.stringToMillis.convert("5m").ms);
    else if (action === "ban") this.client.commands.ban.ban(msg.member, null, "Use of banned words");

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
  }
};