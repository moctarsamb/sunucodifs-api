'use strict';

module.exports = {
  db: {
    name: 'db',
    connector: 'memory'
  },
  mongo: {
    host: '',
    port: 0,
    url: process.env.MONGODB_URI || process.env.MONGODB_URL,
    database: '',
    password: '',
    name: 'mongodb',
    user: '',
    connector: 'mongodb',
  }
};
