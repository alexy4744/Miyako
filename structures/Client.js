const { Client } = require("discord.js");

const Console = require("./Console");
const MongoDB = require("../database/MongoDB");
const Stopwatch = require("./Stopwatch");

class MiyakoClient extends Client {
  constructor(options = {}) {
    super(options.clientOptions || {});
    this.owner = process.env.OWNER || options.owner || null;
    if (!this.owner) throw new Error(`The bot owner must be specified either as a environment variable or through the options object of the Client constructor!`);

    this.token = process.env.TOKEN || options.token || null;
    this.prefix = process.env.PREFIX || options.prefix || "m$";

    this.console = new Console();
  }

  static async initalize(options = {}) {
    try {
      const startupTime = new Stopwatch();
      const miyako = new MiyakoClient(options);

      miyako.db = await MongoDB.initalize();

      miyako.startupTime = startupTime.duration;

      await miyako.login(miyako.token);

      return miyako;
    } catch (error) {
      throw error;
    }
  }

  get cache() {
    return this.db.cache.client.get(process.env.CLIENT_ID);
  }
}

module.exports = MiyakoClient;