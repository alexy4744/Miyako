module.exports = class Command {
  constructor(client, options = {}) {
    this.client = client;
    this.name = options.name || null;
    this.category = options.category || null;
    this.enabled = options.enabled || true;
    this.guarded = options.guarded || false;
    this.botOwnerOnly = options.botOwnerOnly || false;
    this.nsfw = options.nsfw || false;
    this.checkVC = options.checkVC || false;
    this.checkDJ = options.checkDJ || false;
    this.cooldown = options.cooldown || 5;
    this.description = options.description || "No description provided";
    this.usage = options.usage || "No usage details provided";
    this.aliases = options.aliases || [];
    this.subcommands = options.subcommands || null;
    this.userPermissions = options.userPermissions || [];
    this.botPermissions = options.botPermissions || [];
    this.runIn = options.runIn || [];
  }

  reload() {
    delete require.cache[require.resolve(`../../commands/${this.category}/${this.name}.js`)];
    delete this.client.commands[this.name];

    for (const alias of this.aliases) delete this.client.aliases[alias];

    const newCmd = new (require(`../../commands/${this.category}/${this.name}`))(this.client);

    newCmd.name = this.name;
    newCmd.category = this.category;

    this.client.commands[newCmd.name] = newCmd;
    for (const alias of newCmd.aliases) this.client.aliases[alias] = newCmd.name;
  }
};