require('dotenv').config();
const fs = require('fs');
const { google } = require('googleapis');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oAuth2Client,
});

const upload = (fileName, filePath, mimeType, folderId) => {
  return new Promise((resolve, reject) => {
    drive.files.create(
      {
        requestBody: {
          name: fileName,
          mimeType: mimeType,
          parents: folderId ? [folderId] : [],
        },
        media: {
          mimeType: mimeType,
          body: fs.createReadStream(filePath),
        },
      },
      (err, res) => {
        if (err) {
          return reject({
            message: 'Faild to upload! please try again later.',
          });
        }
        resolve(res);
      }
    );
  });
};

const search = (folderName) => {
  return new Promise((resolve, reject) => {
    drive.files.list(
      {
        q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
        fields: 'files(id, name)',
      },
      (err, res) => {
        if (err) {
          return reject({
            message: `${folderName} is not found!`,
          });
        }
        resolve(res.data.files ? res.data.files[0] : null);
      }
    );
  });
};

const create = (folderName) => {
  return new Promise((resolve, reject) => {
    drive.files.create(
      {
        resource: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id, name',
      },
      (err, res) => {
        if (err) {
          return reject({
            message: `Unable to create folder ${folderName}`,
          });
        }
        resolve(res);
      }
    );
  });
};

module.exports = {
  create,
  search,
  upload,
};
