const environment = process.env.NODE_ENV || 'production';
const configure = require('../knexfile.js')[environment];
module.exports = require('knex')(configure);
