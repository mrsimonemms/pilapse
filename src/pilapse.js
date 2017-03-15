/**
 * PiLapse
 *
 * PiLapse is a small utility that uses a Raspberry
 * Pi to take photos at an interval and then convert
 * them into a video that can then be tweeted.
 */

/* Node modules */
const path = require('path');

/* Third-party modules */
const bunyan = require('bunyan');
const cron = require('node-cron');

/* Files */
const config = require('../config.json');
const Database = require('./lib/database');
const dropboxBackup = require('./tasks/dropboxBackup');
const FilesStore = require('./store/files');
// const generateVideo = require('./tasks/generateVideo');
const sunriseSunset = require('./tasks/sunriseSunset');
const takePhoto = require('./tasks/takePhoto');
// const tweetVideo = require('./tasks/tweetVideo');

const logger = bunyan.createLogger({
  name: 'pilapse',
  serializers: bunyan.stdSerializers,
  streams: [{
    stream: process.stdout,
    level: process.env.LOG_LEVEL
  }]
});

logger.info({
  config,
  code: 'PLSTART'
}, 'PiLapse started');

const sunriseTimes = path.join(__dirname, '..', 'sunriseSunset.json');

const db = new Database('./pilapse.sql', logger);

const files = new FilesStore(db);

return Promise.all([
  files.createTable()
]).then(() => {
  /* Set up the user's jobs */
  config.schedule.forEach(({
    dropbox = {disabled: true},
    photo = {disabled: true},
    twitter = {disabled: true},
    video = {disabled: true}
  }) => {
    /* Schedule the update of sunrise/sunset and taking of the photo */
    cron.schedule(photo.interval, () => sunriseSunset(logger, sunriseTimes, config.lat, config.long)
      .then(times => takePhoto(logger, files, photo, times))
      .catch(err => logger.error({
        err,
        code: 'PHOTOERROR'
      }, 'Uncaught exception whilst taking a photo')));

    /* Schedule the backup of the photos to dropbox */
    cron.schedule(dropbox.interval, () => dropboxBackup(
      logger,
      files,
      dropbox,
      photo.savePath,
      video.savePath
    ).catch(err => logger.error({
      err,
      code: 'DROPBOXERROR'
    }, 'Uncaught exception whilst uploading to Dropbox')));
  });
}).catch(err => {
  logger.error({
    err,
    code: 'DBCREATEERROR'
  }, err);
});
