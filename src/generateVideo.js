/**
 * generateVideo
 */

/* Node modules */
const { exec } = require('child_process');
const path = require('path');

/* Third-party modules */
const mkdirp = require('mkdirp');

/* Files */

module.exports = (config) => {
  const fileName = `${config.video.savePath}${path.sep}${config.video.fileName}`;

  const cmd = `avconv -r 25 -y -i ${config.savePath}/%d.jpg ${fileName}`;

  return new Promise((resolve, reject) => {
    mkdirp(fileName, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  }).then(() => new Promise((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(fileName);
    });
  }));
};
