/**
 * dropboxBackup
 */

/* Node modules */
const fs = require('fs');
const path = require('path');

/* Third-party modules */
const Dropbox = require('dropbox');
const glob = require('glob');

/* Files */

function upload (config, localPath) {
  const dbx = new Dropbox({
    accessToken: config.accessToken
  });

  const remotePath = path.join(config.savePath, localPath);

  return new Promise((resolve, reject) => {
    fs.readFile(localPath, (err, contents) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(contents);
    });
  }).then(contents => dbx.filesUpload({
    path: remotePath,
    contents,
    autorename: true,
    mute: true
  })).then(result => new Promise((resolve, reject) => {
    fs.unlink(localPath, err => {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  }));
}

function getFiles (str) {
  return new Promise((resolve, reject) => {
    glob(str, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(files);
    });
  });
}

module.exports = (logger, config, photoPath, videoPath) => Promise.resolve()
  .then(() => {
    if (config.disabled) {
      return;
    }

    /* Get the files */
    return Promise.all([
      getFiles(photoPath),
      getFiles(videoPath)
    ]).then(([ photos, videos ]) => {
      const uploads = []
        .concat(photos)
        .concat(videos);

      const pause = 10000;

      return uploads.reduce((thenable, file) => thenable
        .then(() => upload(config, file))
        .then(() => {
          logger.info({
            file,
            pause,
            code: 'DROPBOXUPLOAD'
          }, 'Uploaded file to Dropbox, now pausing');

          return new Promise(resolve => setTimeout(resolve, pause));
        }), Promise.resolve());
    });
  });
