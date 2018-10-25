module.exports = async (client, fs) => {
  const finalizers = await fs.readdir("./finalizers").catch(error => ({ error }));
  if (finalizers.error) throw finalizers.error;
  if (finalizers.length < 1) return;

  for (let finalizer of finalizers) {
    finalizer = finalizer.slice(0, -3).toLowerCase();
    client.finalizers[finalizer] = new (require(`../finalizers/${finalizer}`))(client);
    client.finalizers[finalizer].name = finalizer.charAt(0).toUpperCase() + finalizer.slice(1);
  }
};