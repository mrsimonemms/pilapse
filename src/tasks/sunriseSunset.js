/**
 * sunriseSunset
 */

/* Node modules */
const fs = require('fs');

/* Third-party modules */
const _ = require('lodash');

/* Files */
const request = require('../lib/request');
const SunriseModel = require('../models/sunriseSunset');

module.exports = (logger, savePath, lat = null, lng = null) => Promise.resolve()
  .then(() => {
    /* Search for cached times */
    let data = {};
    try {
      /* Use fs - require will cache the file contents */
      data = JSON.parse(fs.readFileSync(savePath, 'utf8'));

      logger.info({
        code: 'SSFOUND'
      }, 'Cached sunrise/sunset times found');
    } catch (err) {
      /* File not yet generated */
      logger.info({
        code: 'SSNOTFOUND'
      }, 'Cached sunrise/sunset times not found');
    }

    const times = new SunriseModel(data);

    /* If not updated today, update again */
    if (times.isUpdatedToday() || !_.isNumber(lat) || !_.isNumber(lng)) {
      /* Return the saved/default version */
      logger.info({
        data: times.getData(),
        code: 'SSCACHED'
      }, 'Using cached sunrise/sunset times');

      return times;
    }

    logger.info({
      code: 'SSUPDATING'
    }, 'Cached sunrise/sunset times to be updated');

    const opts = {
      uri: 'http://api.sunrise-sunset.org/json',
      qs: {
        lat,
        lng,
        formatted: 0
      },
      json: true
    };

    /* Update the sunrise/sunset times */
    return request(opts).then(({ results } = {}) => {
      /* Save the times */
      const obj = SunriseModel.toModel(results);

      /* Only add save time if there's a result from API */
      if (results) {
        obj.set('updated', new Date());
      } else {
        logger.warn({
          code: 'SSFAIL',
          opts
        }, 'Failed to make API call');
      }

      return new Promise((resolve, reject) => {
        const data = JSON.stringify(obj.getData(), null, 2);

        fs.writeFile(savePath, data, 'utf8', (err) => {
          if (err) {
            reject(err);
            return;
          }

          logger.info({
            data: obj.getData(),
            code: 'SSUPDATED'
          }, 'Cached sunrise/sunset times updated');

          resolve(obj);
        });
      });
    });
  });
