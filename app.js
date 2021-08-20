const path = require('path');
const fs = require('fs');
const { create, search, upload } = require('./googleDriveService');
const backup = require('./backup');

(async () => {
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const database = process.env.DB_NAME;

  const { filePath, fileName } = await backup(
    host,
    port,
    user,
    password,
    database
  ).catch((err) => {
    console.error(err);
    return null;
  });

  const folderName = 'database backup'; // if not found then create automatically

  let folder = await search(folderName).catch((err) => {
    console.error(err);
    return null;
  });

  if (!folder) {
    folder = await create(folderName).catch((err) => {
      console.error(err);
      return null;
    });
  }
  let response = await upload(
    fileName,
    filePath,
    'application/octet-stream',
    folder.id
  ).catch((err) => {
    console.error(err);
    return null;
  });
  if (response.status === 200 && Object.keys(response.data).length) {
    console.log('File upload successfully.');
    //clear created files
    fs.readdir('./files', (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join('./files', file), (err) => {
          if (err) throw err;
        });
      }
    });
  }
})();
