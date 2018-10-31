const Command = require("../../modules/Base/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Configure captcha settings.`,
      usage: () => [``],
      aliases: [],
      subcommands: {
        "toggle": ["on", "off"],
        "role": ["set"]
      },
      userPermissions: ["administrator"],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  async run(msg) {
    if (!msg.guild.cache.captcha) {
      try {
        await msg.guild.updateDatabase({
          captcha: {
            toggle: false,
            role: null
          }
        });

        const cache = await msg.guild.syncDatabase();

        return { cache };
      } catch (error) {
        msg.error(error);
        return false;
      }
    }

    return { cache: msg.guild.cache };
  }

  toggle(msg, subcommand) {
    this.on = async () => {
      if (!this.shared.cache.captcha.toggle) this.shared.cache.captcha.toggle = true;

      try {
        await msg.guild.updateDatabase(this.shared.cache);
        const notify = !this.shared.cache.captcha.role ? `You **must** run \`${msg.guild.cache.prefix || "m$"}${this.name} role add\` to give a role after verificiation` : msg.guild.roles.has(this.shared.cache.captcha.role) ? `New members will recieve the ${msg.guild.roles.get(this.shared.cache.captcha.role).toString()} role upon passing the verification!` : `You **must** run \`${msg.guild.cache.prefix || "m$"}${this.name} role add\` to give a role after verificiation`;
        return msg.success(`I have successfully enabled captcha verification upon new members that join!`, notify);
      } catch (error) {
        return msg.error(error);
      }
    };

    this.off = async () => {
      if (this.shared.cache.captcha.toggle) this.shared.cache.captcha.toggle = false;

      try {
        await msg.guild.updateDatabase(this.shared.cache);
        return msg.success(`I have disabled captcha verification upon new members that join!`, `Please do not forget to adjust your role settings manually in order to allow members without the role to see and send messages to your channel!`);
      } catch (error) {
        return msg.error(error);
      }
    };

    return this[subcommand]();
  }

  role(msg, subcommand, args) {
    let role;

    if (msg.mentions.roles.first()) {
      role = msg.mentions.roles.first();
    } else if (args[0]) {
      if (msg.guild.roles.has(args[0])) {
        role = msg.guild.roles.get(args[0]);
      } else {
        role = msg.guild.findRole(args.join(" "));

        if (!role || role.id === msg.guild.defaultRole.id) return msg.fail(`${args.join(" ")} is not a valid role!`);
      }
    }

    this.set = async () => {
      this.shared.cache.captcha.role = role.id;

      try {
        await msg.guild.updateDatabase(this.shared.cache);
        return msg.success(`I have set the role given upon passing captcha verification!`, `Any new member that passes the captcha verification will recieve the ${role.toString()} role! Make sure that this role at least has the permissions to allow members to send and see channels!`);
      } catch (error) {
        return msg.error(error);
      }
    };

    return this[subcommand]();
  }
};