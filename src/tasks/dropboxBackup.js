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

function uploadFiles (config, str) {
  return new Promise((resolve, reject) => {
    glob(str, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(files);
    });
  }).then(files => Promise.all(files.map(file => upload(config, file))));
}

module.exports = (config, photoPath, videoPath) => Promise.resolve()
  .then(() => {
    if (config.disabled) {
      return;
    }

    return Promise.all([
      uploadFiles(config, photoPath),
      uploadFiles(config, videoPath)
    ]);
  });
