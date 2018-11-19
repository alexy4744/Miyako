const path = require("path");
const chalk = require("chalk");
const Stopwatch = require("./modules/Stopwatch");

require("dotenv").config({ "path": path.join(__dirname, "process.env") });

const { ShardingManager, Util } = require("discord.js");
const Manager = new ShardingManager("./Miyako.js", { token: process.env.TOKEN });

let totalShards = parseInt(process.env.SHARDS) || 0;
let currShard = 0;
let shardsReady = 0;

let spawned;
let ready;

const stopwatch = new Stopwatch();

(async () => {
  if (!totalShards || totalShards < 1) {
    totalShards = await Util.fetchRecommendedShards(process.env.TOKEN).catch(error => ({ error }));
    if (totalShards.error) throw totalShards.error;
  }

  if (totalShards > 1) totalShards--;

  Manager.spawn(totalShards > 1 ? totalShards + 1 : totalShards).then(shards => {
    if (totalShards <= 1) return verboseSingleShard(shards.first());
  }).catch(error => { throw error; });

  spawned = `${chalk.red("[SHARD]")} 0/${totalShards} spawned!`;
  ready = `${chalk.red("[SHARD]")} 0/${totalShards} ready!`;

  Manager.on("shardCreate", shard => {
    if (Manager.totalShards === 1) currShard = shard.id + 1;
    else currShard = shard.id;

    if (currShard >= totalShards) spawned = `${chalk.green("[SHARD]")} ${currShard}/${totalShards} spawned!`;
    else spawned = `${chalk.cyan("[SHARD]")} ${currShard}/${totalShards} spawned!`;

    shard.on("ready", () => {
      shardsReady++;

      if (shardsReady >= totalShards) ready = `${chalk.green("[SHARD]")} ${currShard}/${totalShards} ready!`;
      else ready = `${chalk.cyan("[SHARD]")} ${currShard}/${totalShards} ready!`;

      verboseMultiShard();
    });

    return verboseMultiShard();
  });
})();

async function verboseMultiShard() {
  console.clear();
  console.log(spawned);
  console.log(ready);

  if (currShard >= totalShards) console.log(`${chalk.green("[SHARD]")} All shards have been spawned.`);

  if (shardsReady >= totalShards) {
    stopwatch.stop();

    try {
      const tag = await Manager.fetchClientValues("user.tag").then(t => t[0]);
      const guilds = await Manager.fetchClientValues("guilds.size").then(g => g.reduce((a, b) => a + b));
      const users = await Manager.fetchClientValues("users.size").then(u => u.reduce((a, b) => a + b));
      const startUpTimes = await Manager.fetchClientValues("startUpTime").then(ms => ms.reduce((a, b) => a + b));

      console.log(`${chalk.green("[SHARD]")} All shards are READY!\n`);
      console.log(`⏱  All shards loaded in ${chalk.cyan(stopwatch.toString(startUpTimes))}!`);
      console.log(`⏱  All shards ready in ${chalk.cyan(stopwatch.toString())}!`);
      console.log(`🔥  Total Time: ${chalk.cyan(stopwatch.toString(startUpTimes + stopwatch.duration))}`);
      console.log(`🚀  ${chalk.cyan(tag)}, serving in ${guilds} guilds for ${users} users!`);
    } catch (error) {
      throw error;
    }
  }
}

async function verboseSingleShard(shard) {
  if (!shard.ready) return shard.on("ready", () => verboseSingleShard(shard));

  try {
    const startUpTime = await shard.fetchClientValue("startUpTime");
    const tag = await shard.fetchClientValue("user.tag");
    const guilds = await shard.fetchClientValue("guilds.size");
    const users = await shard.fetchClientValue("users.size");

    console.log(`${chalk.green("[SHARD]")} 1/1 is READY!\n`);
    console.log(`⏱  Ready in ${stopwatch.toString(startUpTime)}!`);
    console.log(`🚀  ${chalk.cyan(tag)}, serving in ${guilds} guilds for ${users} users!`);
  } catch (error) {
    throw error;
  }
}