let mongoose = require('mongoose');
let config = require('./config');

let models = {
    stations: require('./schemas/station')
};

mongoose.Promise = global.Promise;

module.exports = {
    start: function (cb) {
        console.log('Start connect to ' + config.dbURI + '...');

        return new Promise((resolve) => {
            mongoose.connection.close();
            mongoose.connect(config.dbURI);
            this._eventsHandlers(resolve);
        }).catch(console.error);
    },

    addItems: function (items, modelName) {
        let Model = models[modelName];

        if (Model) {
            console.log('Start adding `' + modelName + '`...');
            [].concat(items).forEach(function (item) {
                return new Model(item).save(function (err) {
                    console.log(item);
                    if (err) {
                        throw err;
                    }
                });
            });
            return console.log(items.length + ' `' + modelName + '` saved successfully!');
        } else {
            return console.log(modelName + 'is not exist');
        }
    },

    dropCollection: function (modelName) {
        console.log('Drop collection:', modelName);

        return new Promise(function (resolve, reject) {
            return mongoose.model(modelName).remove({}, function (err) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(console.log('Collection ' + modelName + ' removed'));
                }
            });
        });
    },

    _eventsHandlers: function (connectResolve) {
        mongoose.connection.on('connected', function () {
            console.log('Mongoose connected');
            connectResolve();
        });
        mongoose.connection.on('error', function (err) {
            console.log('Mongoose default connection error: ' + err);
            mongoose.connection.close();
            console.log("Start reconnect after error...");
            mongoose.connect(config.dbURI);
        });
        mongoose.connection.on('disconnected', function () {
            console.log('Mongoose default connection disconnected');
        });

        process.on('SIGINT', function () {
            return mongoose.connection.close(function () {
                console.log('Mongoose default connection disconnected through app termination');
                return process.exit(0);
            });
        });
    }
};