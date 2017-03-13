/**
 * generateVideo
 */

/* Node modules */
const { exec } = require('child_process');
const os = require('os');
const path = require('path');

/* Third-party modules */
const mkdirp = require('mkdirp');
const moment = require('moment');
const mv = require('mv');
const rimraf = require('rimraf');
const uuid = require('uuid');

/* Files */

const promiseCb = (resolve, reject) => err => {
  if (err) {
    reject(err);
    return;
  }

  resolve();
};

module.exports = (photo, video) => {
  if (photo.disabled || video.disabled) {
    /* Task not scheduled to run */
    return Promise.reject(new Error('TASK_DISABLED'));
  }

  const tmpPath = path.join(os.tmpdir(), 'pilapse', uuid.v4());

  const fileName = path.join(video.savePath, `${moment().format('YYYY-MM-DD')}.mp4`);

  const cmd = `avconv -r 10 -i ${tmpPath}${path.sep}%d.jpg -r 10 -vcodec libx264 -crf 20 -g 15 ${fileName}`;

  return new Promise((resolve, reject) => {
    /* Move images to the tmp dir */
    mv(photo.savePath, tmpPath, {
      mkdirp: true
    }, promiseCb(resolve, reject));
  }).then(() => new Promise((resolve, reject) => {
    /* Ensure the save path exists */
    mkdirp(video.savePath, promiseCb(resolve, reject));
  })).then(() => new Promise((resolve, reject) => {
    /* Create the video */
    exec(cmd, promiseCb(resolve, reject));
  })).then(() => new Promise((resolve, reject) => {
    /* Delete the tmpdir */
    rimraf(tmpPath, err => {
      if (err) {
        reject(err);
        return;
      }

      resolve(fileName);
    });
  }));
};
