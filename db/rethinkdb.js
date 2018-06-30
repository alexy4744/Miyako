const r = require("rethinkdb");

module.exports = class RethinkDB {
	constructor() {
		this.rethink = this.connect();
	}

	async connect() {
		return await r.connect({ // eslint-disable-line
			db: "test"
		}, err => {
			if (err) throw new Error(err);
		});
	}

	async ping() {
		const init = Date.now();
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.now().run(conn, (err, timestamp) => {
				if (err) reject(err);
				else resolve(new Date(timestamp).getTime() - init);
			});
		});
	}

	/* Database Manipulation */

	async dbList() {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.dbList().run(conn, (err, dbs) => {
				if (err) reject(err);
				else resolve(dbs);
			});
		});
	}

	async dbCreate(dbName) {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.dbCreate(dbName).run(conn, (err, changes) => {
				if (err) reject(err);
				else resolve(changes);
			});
		});
	}

	async dbDelete(dbName) {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.dbDrop(dbName).run(conn, (err, changes) => {
				if (err) reject(err);
				else resolve(changes);
			});
		});
	}

	/* Table Manipulation */

	async tableCreate(tableName) {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.db("test").tableCreate(tableName).run(conn, (err, changes) => {
				if (err) reject(err);
				else resolve(changes);
			});
		});
	}

	async tableDelete(tableName) {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.db("test").tableDrop(tableName).run(conn, (err, changes) => {
				if (err) reject(err);
				else resolve(changes);
			});
		});
	}

	async tableList() {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.db("test").tableList().run(conn, (err, tables) => {
				if (err) reject(err);
				else resolve(tables);
			});
		});
	}

	async tableView(tableName) {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.db("test").table(tableName).run(conn, (err, changes) => {
				if (err) reject(err);
				else resolve(changes);
			});
		});
	}

	/* Data Manipulation */

	async insert(tableName, object) {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.db("test").table(tableName).insert(object)
				.run(conn, (err, changes) => {
					if (err) reject(err);
					else resolve(changes);
			});
		});
	}

	async update(tableName, id, object) {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.db("test").table(tableName).get(id)
				.update(object)
				.run(conn, (err, changes) => {
					if (err) reject(err);
					else resolve(changes);
			});
		});
	}

	async replace(tableName, id, object) {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.db("test").table(tableName).get(id)
				.replace(object)
				.run(conn, (err, changes) => {
					if (err) reject(err);
					else resolve(changes);
			});
		});
	}

	async delete(tableName, id) {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.db("test").table(tableName).get(id)
				.delete()
				.run(conn, (err, changes) => {
					if (err) reject(err);
					else resolve(changes);
			});
		});
	}

	async sync(tableName) {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.table(tableName).sync().run(conn, (err, synced) => {
				if (err) reject(err);
				else resolve(synced);
			});
		});
	}

	/* Data Fetching */

	async get(tableName, id) {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.db("test").table(tableName).get(id)
			.run(conn, (err, data) => {
				if (err) reject(err);
				else resolve(data);
			});
		});
	}

	// https://stackoverflow.com/questions/43782915/rethinkdb-check-if-record-exists
	async has(tableName, id) {
		const conn = await this.connect();
		return new Promise((resolve, reject) => {
			r.db("test").table(tableName).getAll(id)
				.count()
				.eq(1)
				.run(conn, (err, boolean) => {
					if (err) reject(err);
					else resolve(boolean);
			});
		});
	}
};