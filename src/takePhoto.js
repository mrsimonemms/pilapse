/**
 * takePhoto
 */

/* Node modules */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/* Third-party modules */
const mkdirp = require('mkdirp');
const moment = require('moment');

/* Files */

module.exports = (config, sunriseSunset) => Promise.resolve()
  .then(() => {
    const map = {
      startTime: 'astronomicalTwilightBegin',
      endTime: 'astronomicalTwilightEnd'
    };

    /* Are we inside the start/end times? */
    const times = {
      startTime: config.startTime,
      endTime: config.endTime
    };

    /* Ensure we have date objects for the start/end times */
    for (const key in times) {
      const time = times[key];

      if (time === 'auto') {
        /* Getting time from the sunrise/sunset */
        const target = map[key];

        times[key] = sunriseSunset.get(target);
      } else {
        /* Converting time to Date */
        const split = time.split(':');

        times[key] = moment()
          .set({
            hour: split[0],
            minute: split[1] || 0,
            second: split[2] || 0,
            millisecond: 0
          })
          .toDate();
      }
    }

    const now = Date.now();

    if ((times.startTime.getTime() <= now && times.endTime.getTime() >= now) === false) {
      /* Nothing to do */
      throw new Error('OUTSIDE_TIME');
    }

    const savePath = config.savePath;

    return new Promise((resolve, reject) => {
      /* Create the path where the photos are to be stored */
      mkdirp(savePath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    }).then(() => new Promise((resolve, reject) => {
      fs.readdir(savePath, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(files.length);
      });
    })).then(count => {
      const fileName = `${savePath}${path.sep}${count}.jpg`;

      /* Set the options */
      const opts = (config.raspistillOpts || []).reduce((result, opt) => {
        result.push(opt);

        return result;
      }, [
        '-h 1536',
        '-w 2048',
        '-q 35',
        '-mm matrix',
        '-ex auto',
        '-n'
      ]);

      /* Create the command */
      const cmd = `/opt/vc/bin/raspistill ${opts.join(' ')} -o ${fileName}`;

      /* Execute the command to take the photo */
      return new Promise((resolve, reject) => {
        exec(cmd, (err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(cmd);
        });
      });
    });
  });
