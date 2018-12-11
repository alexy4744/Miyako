const { ShardingManager } = require("discord.js");
const { colors } = require("./Constants");
const chalk = require("chalk");

const Console = require("./Console");
const Stopwatch = require("./Stopwatch");

const console = new Console();

class MiyakoSharder extends ShardingManager {
  constructor(script, options = {}) {
    super(script, options);
    this.spawned = 1;
    this.ready = 1;
    this.total = Number(process.env.SHARDS) || options.totalShards || 0;

    this._stopwatch = new Stopwatch();

    this.start();
  }

  start() {
    this
      .spawn(this.total)
      .then(shards => this.total === 1 ? this._verbose(shards.first()) : null)
      .catch(error => { throw error; });

    this.on("shardCreate", this._onSpawn.bind(this));
  }

  async _verbose(shard) {
    if (this.total <= 1 && !shard.ready) return shard.on("ready", () => this._onReady(shard));

    console.clear();
    console.log(`[SHARD] ${this.spawned} / ${this.total} spawned!`);
    console.log(`[SHARD] ${this.ready} / ${this.total} ready!`);

    if (this.spawned >= this.total) console.log(`[SHARD] All shards are ${chalk.hex(colors.default)("spawned")}!`);

    if (this.ready >= this.total) {
      this._stopwatch.stop();

      try {
        const tag = await this.fetchClientValues("user.tag").then(t => t[0]);
        const guilds = await this.fetchClientValues("guilds.size").then(g => g.reduce((a, b) => a + b));
        const users = await this.fetchClientValues("users.size").then(u => u.reduce((a, b) => a + b));
        const startupTime = await this.fetchClientValues("startupTime").then(ms => ms.reduce((a, b) => a + b));

        console.log(`[SHARD] All shards are ${chalk.hex(colors.success)("ready")}!`);
        console.log(`⏱  All shards loaded in ${chalk.cyan(this._stopwatch.toString(startupTime))}!`);
        console.log(`⏱  All shards ready in ${chalk.cyan(this._stopwatch.toString())}!`);
        console.log(`🔥  Total Time: ${chalk.cyan(this._stopwatch.toString(startupTime + this._stopwatch.duration))}`);
        console.log(`🚀  ${chalk.cyan(tag)}, serving in ${guilds} guilds for ${users} users!`);
      } catch (error) {
        throw error;
      }
    }
  }

  _onSpawn(shard) {
    this.spawned++;
    this._verbose(shard);

    shard.on("ready", () => this._onReady(shard));
  }

  _onReady(shard) {
    this.ready++;
    this._verbose(shard);
  }
}

module.exports = MiyakoSharder;
