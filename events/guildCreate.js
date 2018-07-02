module.exports = async guild => {
  if (!await guild.db.has()) {
    await guild.db.insert({
      id: guild.id
    }).catch(() => {});
  }
};
