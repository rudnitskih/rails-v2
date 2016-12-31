let env = require('node-env-file');
env('./.env');

module.exports = {
    dbURI: 'mongodb://' + process.env.BD_USER + ':' + process.env.BD_PASS + '@ds141358.mlab.com:41358/rails-v2'
};
