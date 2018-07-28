module.exports = class Command {
  constructor(client, options = {}) {
    this.client = client;
    this.options = options;
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
};