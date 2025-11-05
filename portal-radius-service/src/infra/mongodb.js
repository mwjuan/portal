const mongoose = require('mongoose');
const { toJSON, timestamp } = require('misc');
const paginate = require('mongoose-paginate-v2');
const config = require('config');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const logger = require('./logger').logger.child({ module: 'infra:mongo' });

class Mongodb {
  constructor({ url, host, user, password, dbName, authenticationDatabase, backup }) {
    mongoose.plugin(timestamp);
    mongoose.plugin(toJSON);
    // mongoose.plugin(pinyin);
    mongoose.plugin(paginate);

    this.mongoose = mongoose;
    this.url = url;
    this.host = host;
    this.user = user;
    this.password = password;
    this.dbName = dbName;
    this.authenticationDatabase = authenticationDatabase;
    this.backup = backup;

    mongoose.connection.on('connected', () => {
     logger.info(`mongodb connection successful: ${this.url}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.info(`mongodb disconnect`);
     });

    mongoose.connection.on('error', (error) => {
      logger.error(`mongodb connection failed: ${error.message}`);
    });
  }

  async open() {
    await mongoose.connect(this.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useFindAndModify: false,
      // useCreateIndex: true
    });
  }

  async close() {
    await mongoose.connection.close();
    await mongoose.disconnect();
  }

  async drop() {
    await mongoose.connection.dropDatabase();
  }

  backup() {
    if (!this.dbName) throw new Error('dbName is required and can not be null');

    const filepath = `${this.backup}/s365-mongodb-${moment().format('YYYYMMDDHHmmss')}.archive`;
    const command = `mongodump${this.host ? ` -h ${this.host}` : ''}${this.user ? ` -u ${this.user}` : ''}${this.password ? `-p ${this.password}` : ''}${this.user && this.password ? ` --authenticationDatabase ${this.authenticationDatabase}` : ''} -d ${this.dbName} --gzip --archive=${path.normalize(filepath)}`;

    const isExist = fs.existsSync(this.backup);
    if (!isExist) {
      fs.mkdirSync(this.backup);
    }

    childProcess.execSync(command, (err, stdout, stderr) => {
      if (err) {
				console.log(err);
				throw Error('restore failed!');
			}
			console.log(`stdout: ${stdout}`);
			console.log(`stderr: ${stderr}`);
    });
  }


}

module.exports = new Mongodb(config.mongodb);