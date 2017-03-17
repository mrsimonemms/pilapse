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
const { v4 } = require('uuid');

/* Files */
const config = require('../config.json');
const Database = require('./lib/database');
const dropboxBackup = require('./tasks/dropboxBackup');
const FilesStore = require('./store/files');
const generateVideo = require('./tasks/generateVideo');
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

const taskRunner = (id, codeName, taskName, fn) => {
  const uuid = v4();

  logger.info({
    id,
    code: `${codeName}START`,
    uuid
  }, `Task: ${taskName} scheduled to run`);

  return fn()
    .then(result => {
      logger.info({
        id,
        code: `${codeName}END`,
        uuid
      }, `Task: ${taskName} ended successfully`);

      return result;
    })
    .catch(err => {
      if (err.message === 'TASK_DISABLED') {
        logger.info({
          id,
          code: `${codeName}DISABLED`,
          uuid
        }, `Task disabled: ${taskName}`);
      } else {
        logger.error({
          err,
          id,
          code: `${codeName}ERROR`,
          uuid
        }, `Uncaught exception occurred during task: ${taskName}`);
      }
    });
};

Promise.all([
  files.createTable()
]).then(() => {
  /* Set up the user's jobs */
  config.schedule.forEach(({
    dropbox = { disabled: true },
    photo = { disabled: true },
    twitter = { disabled: true },
    video = { disabled: true }
  }, id) => {
    /* Schedule the update of sunrise/sunset and taking of the photo */
    cron.schedule(photo.interval, () => {
      taskRunner(id, 'PHOTO', 'TAKE_PHOTO', () => sunriseSunset(logger, sunriseTimes, config.lat, config.long)
        .then(times => takePhoto(logger, files, photo, times)));
    });

    /* Schedule the backup of the photos to dropbox */
    cron.schedule(dropbox.interval, () => {
      taskRunner(id, 'DROPBOX', 'SAVE_TO_DROPBOX', dropboxBackup(
        logger,
        files,
        dropbox,
        photo.savePath,
        video.savePath
      ));
    });

    /* Generate the video */
    cron.schedule(video.interval, () => {
      taskRunner(id, 'VIDEOGENERATE', 'GENERATE_VIDEO', () => generateVideo(files, photo, video));
    });
  });
}).catch(err => {
  logger.error({
    err,
    code: 'DBCREATEERROR'
  }, err);
});
