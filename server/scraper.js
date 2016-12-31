process.on('uncaughtException', function (err) {
    console.log(err)
});

let db = require('./db');
let _ = require('lodash');
let bookingUzScraper = require('./booking-uz-scraper');

Promise.all([
    db.start()
]).then(function () {
    // bookingUzScraper.getStationsList()
    //     .then(function (stations) {
    //         db.addItems(
    //             _.map(stations, function (station) {
    //                 return {
    //                     bookingUz: {
    //                         id: station.station_id,
    //                         titles: [
    //                             {
    //                                 title: station.title,
    //                                 locale: 'uk_UA'
    //                             }
    //                         ]
    //                     }
    //                 }
    //             }),
    //             'stations'
    //         );
    //     });
});

