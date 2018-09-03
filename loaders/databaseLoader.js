module.exports = async client => {
  const tables = ["clientData", "guildData", "memberData", "userData", "sessionData"];

  try {
    let tableList = await client.db.tableList();

    if (tableList.length < tables.length) {
      for (let i = 0, len = tables.length; i < len; i++) {
        if (i >= tables.length - 1) {
          const has = await client.db.has();
          if (!has) await client.db.insert({ id: process.env.BOTID });
        }

        tableList = await client.db.tableList();

        if (!tableList.includes(tables[i])) await client.db.tableCreate(tables[i]);
      }
    }
  } catch (error) {
    throw error;
  } finally {
    await client.updateCache();
  }
};