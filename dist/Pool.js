const genericPool = require("generic-pool");
const DbDriver = require("./sybase");

/**
 * 数据库连接，线程池
 *
 * @param {any} opts
 *      {
 *        *host,
 *        *port,
 *        *dbname,
 *        *username,
 *        *password,
 *        jarPath,
 *        max,
 *        min,
 *        name
 *       }
 */
class DBPool {
    constructor(opts) {
        if (
            !opts.host ||
            !opts.port ||
            !opts.dbname ||
            !opts.username ||
            !opts.password
        ) {
            throw new Error("Sybase DB params lacked!");
        }
        this.name = opts.name || opts.host;
        this.client = null;
        if (!opts.logging) opts.logging = false;
        if (!opts.encoding) opts.encoding = "utf8";
        this.opts = opts;
    }

    _connect() {
        return new Promise((resolve, reject) => {
            this.client = new DbDriver(
                this.opts.host,
                this.opts.port,
                this.opts.dbname,
                this.opts.username,
                this.opts.password,
                this.opts.jarPath,
                this.opts.logging,
                this.opts.encoding
            );
            this.client.connect((err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve(this.client);
            });
        });
    }

    _disconnect() {
        return new Promise((resolve) => {
            if (this.client.isConnected()) {
                this.client.disconnect();
                resolve();
            }
        });
    }

    _exe(connect, sql) {
        return new Promise((resolve, reject) => {
            connect
                .then((client) => {
                    client.query(sql, (err, data) => {
                        if (err) {
                            console.error("Erro on _exec: ", err);
                            reject(err);
                        } else {
                            this.pool.release(client);
                            resolve(data);
                        }
                    });
                })
                .catch((error) => {
                    console.error("_exec: ", error);
                    reject(error);
                });
        });
    }

    query(sql) {
        return new Promise((resolve, reject) => {
            this._connect()
                .then((conn) => {
                    conn.query(sql, (err, data) => {
                        this._disconnect();
                        if (err) {
                            console.error("Pool - query - conn.query: ", err);
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                })
                .catch((error) => {
                    console.error("Pool - query - _connect: ", error);
                    reject(error);
                });
        });
    }

    execute(sql) {
        const connInfo = this.pool.acquire();
        return this._exe(connInfo, sql);
    }
}

module.exports = DBPool;
module.exports.DBPool = DBPool;
module.exports.default = DBPool;
