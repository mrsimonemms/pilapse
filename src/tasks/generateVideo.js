/**
 * generateVideo
 */

/* Node modules */
const { exec } = require('child_process');
const os = require('os');
const path = require('path');

/* Third-party modules */
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const moment = require('moment');
const rimraf = require('rimraf');
const uuid = require('uuid');

/* Files */

function promiseCb (resolve, reject) {
  return (err, result) => {
    if (err) {
      reject(err);
      return;
    }

    if (result === undefined) {
      resolve();
    } else {
      resolve(result);
    }
  };
}

const generateGroupVideo = (db, group, tmpPath, cmd) => db
  .getGroup(group)
  .then(files => {
    /* First job - copy and rename */
    return files.reduce((thenable, file, count) => {
      return thenable.then(() => {
        return new Promise((resolve, reject) => {
          fs.copy(file.fileName, `${tmpPath}${path.sep}${count}.jpg`, promiseCb(resolve, reject));
        });
      });
    }, Promise.resolve()).then(() => {
      /* Now generate the video */
      return new Promise((resolve, reject) => {
        exec(cmd, promiseCb(resolve, reject));
      });
    }).then(() => {
      /* Finally, remove the tmp directory */
      return new Promise((resolve, reject) => {
        rimraf(tmpPath, promiseCb(resolve, reject));
      });
    });
  });

module.exports = (db, photo, video) => Promise.resolve()
  .then(() => {
    if (video.disabled) {
      /* Task not scheduled to run */
      throw new Error('TASK_DISABLED');
    }

    const tmpPath = path.join(os.tmpdir(), 'pilapse', uuid.v4());

    const fileName = path.join(video.savePath, `${moment().format('YYYY-MM-DD')}.mp4`);

    const cmd = `avconv -r 10 -i ${tmpPath}${path.sep}%d.jpg -r 10 -vcodec libx264 -crf 20 -g 15 ${fileName}`;

    return new Promise((resolve, reject) => {
      /* Ensure tmpPath exists */
      mkdirp(tmpPath, promiseCb(resolve, reject));
    }).then(() => new Promise((resolve, reject) => {
      /* Ensure video savePath exists */
      mkdirp(video.savePath, promiseCb(resolve, reject));
    })).then(() => db.getGroups()
      .then(groups => groups.reduce((thenable, group) => thenable
        .then(() => generateGroupVideo(db, group, tmpPath, cmd))
        .then(() => db.getByFileName(fileName) /* Is this already in the database? */)
        .then((file = {}) => {
          file.type = 'video';
          if (file.id) {
            /* Update */
            file.updated = 0;
          } else {
            file.fileName = fileName;
          }

          file.generated = 1;

          return db.save(file);
        }), Promise.resolve())));
  });
