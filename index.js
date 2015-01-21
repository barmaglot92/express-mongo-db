'use strict';

var connectOnce = require('connect-once');
var mongodbUri = require('mongodb-uri');

module.exports = function (mongodb, options) {
    options = options || {};
    options = {
        hosts: [{host: options.host || '127.0.0.1', port: options.port || 27017}],
        database: options.db || 'test',
        retries: options.retries || 60,
        reconnectWait: options.reconnectWait || 1000,
        options: options.options,
        username: options.name,
        password: options.pwd
    };

    var MongoClient = mongodb.MongoClient;
    var connection = new connectOnce(
        options,
        MongoClient.connect,
        mongodbUri.format(options),
        options.options
    );

    var f = function (req, res, next) {
        connection.when('available', function (err, db) {
            if (err) {
                return next(err);
            }
            req.db = db;
            next();
        });
    };

    f.connection = connection;

    return f;
};
