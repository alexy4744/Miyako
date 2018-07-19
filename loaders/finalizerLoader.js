module.exports = (client, fs) => {
  /* Load all command finalizers. */
  fs.readdir("./finalizers").then(finalizer => {
    finalizer.forEach(f => client.finalizers.set(f.slice(0, -3), require(`../finalizers/${f}`)));
  }).catch(error => {
    console.error(error);
  });
};