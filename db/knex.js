const environment = process.env.NODE_ENV || 'development';
const configure = require('../knexfile.js')[environment];
module.exports = require('knex')(configure);
