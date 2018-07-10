module.exports = (client, fs) => {
  /* Load all utilities. */
  fs.readdir("./utils").then(util => {
    util.forEach(u => {
      client.utils.set(u.slice(0, -3), require(`../utils/${u}`));
    });
  }).catch(error => {
    console.error(error);
  });
};