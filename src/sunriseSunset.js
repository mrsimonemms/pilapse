/**
 * sunriseSunset
 */

/* Node modules */
const fs = require('fs');

/* Third-party modules */
const request = require('request-promise-native');

/* Files */
const SunriseModel = require('./models/sunriseSunset');

module.exports = (lat, lng, savePath) => Promise.resolve()
  .then(() => {
    /* Search for exiting times */
    let times = new SunriseModel();
    try {
      times = new SunriseModel(require(savePath));
    } catch (err) {
      /* File not yet generated */
    }

    /* If not updated today, update again */
    if (times.isUpdatedToday()) {
      /* Return the saved version */
      return times;
    } else {
      /* Update the sunrise/sunset times */
      return request({
        uri: 'http://api.sunrise-sunset.org/json',
        qs: {
          lat,
          lng,
          formatted: 0
        },
        json: true
      }).then(({ results }) => {
        /* Save the times */
        const obj = SunriseModel.toModel(results);

        obj.set('updated', new Date());

        return new Promise((resolve, reject) => {
          const data = JSON.stringify(obj.getData(), null, 2);

          fs.writeFile(savePath, data, 'utf8', (err) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(obj);
          });
        });
      });
    }
  });
