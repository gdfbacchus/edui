var knex = require('knex');
var bookshelf = require('bookshelf');
var knexConfig = require('./knexfile');

var env = process.env.NODE_ENV ? (process.env.NODE_ENV).trim() : 'development';
// var envConfig = env === 'production' ? knexConfig.production : knexConfig.development;
var envConfig = null;
switch(env) {
  case"development":
    envConfig = knexConfig.development;
    break;
  case"staging":
    envConfig = knexConfig.staging;
    break;
  case"production":
    envConfig = knexConfig.production;
    break;
  default:
    envConfig = knexConfig.development;
    break;
}
console.log("ENV KNEX CONF: ", envConfig);

module.exports = bookshelf(knex(envConfig));
