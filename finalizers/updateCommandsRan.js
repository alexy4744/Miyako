module.exports = async client => {
  const clientData = await client.db.get().catch(e => ({
    "error": e
  }));

  if (!clientData.error) {
    if (!clientData.commandsRan) clientData.commandsRan = 0;
    clientData.commandsRan++;

    return client.db.update({
      "commandsRan": clientData.commandsRan
    }).then(() => client.updateCache("commandsRan", clientData.commandsRan)
      .catch(() => { }))
      .catch(() => { }); // Don't really care if it errors, not really an important finalizer
  }
};