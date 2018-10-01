const fs = require("fs-nextra");

module.exports = async client => {
  const loaders = await fs.readdir("./loaders").catch(e => { throw e; });

  for (const loader of loaders) {
    if (loader instanceof Promise) await require(`./${loader}`)(client, fs);
    else require(`./${loader}`)(client, fs);
  }
};