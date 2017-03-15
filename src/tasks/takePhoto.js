/**
 * takePhoto
 */

/* Node modules */
const { exec } = require('child_process');
const path = require('path');

/* Third-party modules */
const mkdirp = require('mkdirp');
const moment = require('moment');

/* Files */

module.exports = (logger, db, config, sunriseSunset) => Promise.resolve()
  .then(() => {
    if (config.disabled) {
      /* Task has been disabled */
      throw new Error('TASK_DISABLED');
    }

    /* Are we inside the start/end times? */
    const times = {
      sunrise: config.startTime,
      sunset: config.endTime
    };

    /* Ensure we have date objects for the start/end times */
    for (const key in times) {
      const time = times[key];

      if (!time) {
        /* Getting time from the sunrise/sunset */
        times[key] = sunriseSunset.get(key);
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

    if ((times.sunrise.getTime() <= now && times.sunset.getTime() >= now) === false) {
      /* Nothing to do */
      logger.info({
        code: 'NOPHOTOSCHEDULED',
        now: new Date(now),
        times
      }, 'No photo scheduled to be taken');

      return;
    }

    /* Allowed values are Y, M or D */
    const group = config.group || 'D';

    /* Default to daily */
    let groupFormat = 'YYYY-MM-DD';
    if (group === 'Y') {
      groupFormat = 'YYYY';
    } else if (group === 'M') {
      groupFormat = 'YYYY-MM';
    }

    const savePath = [
      config.savePath,
      moment().format(groupFormat)
    ].join(path.sep);

    return new Promise((resolve, reject) => {
      /* Create the path where the photos are to be stored */
      logger.info({
        savePath,
        code: 'DIRCREATE'
      }, 'Creating some directories');

      mkdirp(savePath, err => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    }).then(() => {
      const fileName = [
        savePath,
        `img_${now}.jpg`
      ].join(path.sep);

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

      logger.info({
        cmd,
        code: 'NEWPHOTO'
      }, 'Photo being taken');

      /* Execute the command to take the photo */
      return new Promise((resolve, reject) => {
        exec(cmd, (err) => {
          if (err) {
            reject(err);
            return;
          }

          logger.info({
            cmd: 'NEWPHOTOSUCCESS'
          }, 'Photo successfully taken');

          resolve({
            cmd,
            fileName
          });
        });
      }).then(({ cmd, fileName }) => db.save({
        type: 'img',
        fileName
      }).then(() => ({
        cmd,
        fileName
      })));
    });
  });
