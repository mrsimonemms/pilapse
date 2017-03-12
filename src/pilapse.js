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
const cron = require('node-cron');

/* Files */
const config = require('../config.json');
const sunriseSunset = require('./sunriseSunset');
const takePhoto = require('./takePhoto');

const sunriseTimes = path.join(__dirname, '..', 'sunriseSunset.json');

const updateSunriseSunset = () => sunriseSunset(config.lat, config.long, sunriseTimes);

/* Before starting, get the sunrise sunset */
updateSunriseSunset()
  .then(sunriseSunset => {
    /* Set up the taking of photos */
    config.schedule.forEach((photo) => {
      cron.schedule(photo.interval, () => takePhoto(photo, sunriseSunset), true);
    });
  });
