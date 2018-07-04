module.exports = async guild => {
  if (!await guild.db.has().catch(() => {})) {
    await guild.db.insert({
      id: guild.id
    }).catch(() => {});
  }
};
