const mysqlDump = require('mysqldump');
const moment = require('moment');
const Winrar = require('winrarjs');

const backup = (host, port, user, password, database) => {
  return new Promise((resolve, reject) => {
    if (!fields_validator(user, password, database)) {
      return reject({
        message: 'Required fields are missing!',
      });
    }

    let fileName = `${database}-backup-${moment().format('DD-MM-YY-HH-mm')}`;
    mysqlDump(
      {
        host: host,
        port: port,
        user: user,
        password: password,
        database: database,
        dest: `${__dirname}/files/${fileName}.sql`,
      },
      function (err) {
        if (err) reject(err);
        let rar = new Winrar(`${__dirname}/files/${fileName}.sql`);
        rar.setOutput(`${__dirname}/files/${fileName}.zip`);
        rar
          .zip()
          .then((result) => {
            resolve(result);
          })
          .catch((err) => {
            reject({
              message: 'something went wrong!',
            });
          });
      }
    );
  });
};

const fields_validator = (user, password, database) => {
  let isFieldMissing = true;
  if (!user) isFieldMissing = false;
  if (password === '' || !password) {
    isFieldMissing = true;
  }
  if (!database) isFieldMissing = false;
  return isFieldMissing;
};

module.exports = backup;
