module.exports = async client => {
  const tables = ["voidData", "guildData", "memberData", "userData"];

  let tableList = await client.rethink.tableList().catch(error => {
    throw new Error(error);
  });

  if (tableList.length < tables.length) {
    for (let i = 0, len = tables.length; i < len; i++) {
      if (i >= tables.length - 1) {
        const has = await client.db.has().catch(error => {
          throw new Error(error);
        });

        if (!has) {
          await client.db.insert({
            id: "415313696102023169"
          }).catch(error => {
            throw new Error(error);
          });
        }

        await client.updateCache().catch(error => {
          throw new Error(error);
        });
      }

      tableList = await client.rethink.tableList().catch(error => {
        throw new Error(error);
      });

      if (!tableList.includes(tables[i])) {
        await client.rethink.tableCreate(tables[i]).catch(error => {
          throw new Error(error);
        });
      }
    }
  }
};