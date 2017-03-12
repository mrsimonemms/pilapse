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
const generateVideo = require('./generateVideo');
const sunriseSunset = require('./sunriseSunset');
const takePhoto = require('./takePhoto');

const sunriseTimes = path.join(__dirname, '..', 'sunriseSunset.json');

const logger = bunyan.createLogger({
  name: 'pilapse',
  streams: [{
    stream: process.stdout,
    level: process.env.LOG_LEVEL
  }],
});

logger.info('PiLapse started');

const updateSunriseSunset = () => {
  logger.info('Querying the sunrise/sunset times');

  return sunriseSunset(config.lat, config.long, sunriseTimes)
    .then(result => {
      logger.info('Sunrise/sunset times retrieved', result.getData());

      return result;
    })
    .catch(err => {
      logger.error('Failed to retrieve sunrise/sunset times', err);
    });
};

/* Before starting, get the sunrise sunset */
updateSunriseSunset()
  .then(sunriseSunset => {
    /* Set up the user's jobs */
    config.schedule.forEach((photo) => {
      /* Set up the photo taking intervals */
      cron.schedule(photo.interval, () => takePhoto(photo, sunriseSunset)
        .then(result => {
          logger.info('New photo taken with command:', result);
        })
        .catch(err => {
          if (err.message === 'OUTSIDE_TIME') {
            logger.info('No photo scheduled to be taken');
          } else {
            logger.error('Failed to take photo', err);
          }
        }));

      /* Generate the video */
      cron.schedule(photo.video.interval, () => generateVideo(photo)
        .then(result => {
          logger.info('New video generated', result);
        })
        .catch(err => {
          logger.error('Failed to generate video', err);
        }));
    });

    /* Set up the daily check to get the sunrise/sunset times */
    cron.schedule('0 0 * * *', updateSunriseSunset);
  });
