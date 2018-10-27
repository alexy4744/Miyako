module.exports = class Command {
  constructor(client, options = {}) {
    this.client = client;
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

  async fetchMember(msg, id) {
    const member = await msg.guild.members.fetch(id).catch(error => ({
      "error": error
    }));

    if (member.error) return Promise.reject(member.error);

    return Promise.resolve(member);
  }

  async fetchUser(id) {
    const user = await this.client.users.fetch(id).catch(error => ({
      "error": error
    }));

    if (user.error) return Promise.reject(user.error);

    return Promise.resolve(user);
  }

  reload() {
    console.log(this)
  }
};