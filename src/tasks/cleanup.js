/**
 * cleanup
 */

/* Node modules */

/* Third-party modules */
const rimraf = require('rimraf');

/* Files */

module.exports = (db, config) => Promise.resolve()
  .then(() => {
    if (config.disabled) {
      throw new Error('TASK_DISABLED');
    }

    return db.getDeadFiles();
  })
  .then(files => {
    const tasks = files.map(file => new Promise((resolve, reject) => {
      rimraf(file, {
        disableGlob: true
      } ,err => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    }));

    return Promise.all(tasks);
  });
