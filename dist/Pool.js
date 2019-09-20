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

        const _create = () => {
            return new Promise((resolve, reject) => {
                this.client = new DbDriver(
                    opts.host,
                    opts.port,
                    opts.dbname,
                    opts.username,
                    opts.password,
                    true,
                    opts.jarPath
                );
                this.client.connect((err) => {
                    if (err) return reject(err);
                    return resolve(this.client);
                });
            });
        };

        const _destroy = (client) => {
            return new Promise((resolve) => {
                if (client.isConnected()) {
                    client.disconnect();
                    resolve();
                }
            });
        };

        this.pool = genericPool.createPool(
            {
                create: _create,
                destroy: _destroy
            },
            {
                max: opts.max || 10,
                min: opts.min || 2
            }
        );
    }

    _exe(connect, sql) {
        return new Promise((resolve, reject) => {
            connect.then((client) => {
                client.query(sql, (err, data) => {
                    if (err) {
                        console.error("Errro on _exec: ", err);
                        reject(err);
                    } else {
                        this.pool.release(client);
                        resolve(data);
                    }
                });
            });
        });
    }

    async execute(sql) {
        const connInfo = await this.pool.acquire();
        return this._exe(connInfo, sql);
    }
}

module.exports = DBPool;
module.exports.DBPool = DBPool;
module.exports.default = DBPool;
