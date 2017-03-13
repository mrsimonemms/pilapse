/**
 * request
 */

/* Node modules */

/* Third-party modules */
const request = require('request-promise-native');

/* Files */

module.exports = (...args) => request(...args)
  .catch(err => {
    if (err.cause.code === 'ENOTFOUND') {
      /* Not found - probably not online */
      return;
    }

    return Promise.reject(err);
  });
