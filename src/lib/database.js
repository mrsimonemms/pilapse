/**
 * database
 */

/* Node modules */

/* Third-party modules */
const { Database } = require('sqlite3').verbose();

/* Files */

module.exports = class SQLite {
  constructor (file, logger) {
    this._db = new Database(file);
    this._log = logger;
  }

  query (sql, ...args) {
    return new Promise((resolve, reject) => {
      this._db.serialize(() => {
        this._log.info({
          sql,
          args,
          code: 'DBQUERY'
        }, 'New database query');

        this._db.all(sql, ...args, (err, result) => {
          if (err) {
            this._log.error({
              err,
              sql,
              args,
              code: 'DBERR'
            }, 'Database error');

            reject(err);
            return;
          }

          this._log.info({
            sql,
            args,
            result,
            code: 'DBRESULT'
          }, 'Database result');

          resolve(result);
        });
      });
    });
  }
};
