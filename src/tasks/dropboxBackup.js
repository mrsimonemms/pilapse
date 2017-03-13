/**
 * dropboxBackup
 */

/* Node modules */
const fs = require('fs');
const path = require('path');

/* Third-party modules */
const _ = require('lodash');
const Dropbox = require('dropbox');

/* Files */

function dropboxBackup (config, localPath, folder = '') {
  if (config.disabled) {
    return Promise.reject('NO_DROPBOX_BACKUP');
  }

  /* Allow multiple files */
  if (_.isArray(localPath)) {
    return Promise.all(localPath.map(file => dropboxBackup(config, file, folder)));
  }

  const dbx = new Dropbox({
    accessToken: config.accessToken
  });

  const obj = path.parse(localPath);
  const remotePath = path.join(config.savePath, folder, obj.base);

  return new Promise((resolve, reject) => {
    fs.readFile(localPath, (err, contents) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(contents);
    })
  }).then(contents => dbx.filesUpload({
    path: remotePath,
    contents,
    autorename: true,
    mute: true
  }));
};

module.exports = dropboxBackup;
