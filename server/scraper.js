process.on('uncaughtException', function (err) {
    console.log(err)
});

let db = require('./db');
let _ = require('lodash');
let cities = require('./helpers/cities');
let bookingUzScraper = require('./booking-uz-scraper');
let stationModel = require('./schemas/station');
let async = require('async');

Promise.all([
    db.start(true)
]).then(function () {
    scrapCoordinatesOfStations();

    function scrapCoordinatesOfStations() {
        stationModel
            .find({}, 'bookingUz')
            .exec()
            .then(function (stations) {
                let biggestCities = cities.getBiggestCities();

                let stationsInTheBiggestCities = _(stations)
                    .filter(function (station) {
                        return _.find(biggestCities, function (biggestCity) {
                            return station.bookingUz.titles[0].title.indexOf(biggestCity) === 0;
                        });
                    })
                    .sortBy(function (a) {
                        return _.findIndex(biggestCities, function (biggestCity) {
                            return a.bookingUz.titles[0].title.indexOf(biggestCity) === 0;
                        });
                    })
                    .value();

                stationsInTheBiggestCities.length = 5;

                async.mapSeries(stationsInTheBiggestCities, function (fromStation, firstCb) {
                    async.mapSeries(stationsInTheBiggestCities, function (tillStation, secondCb) {
                        if (stationsInTheBiggestCities.indexOf(fromStation)
                            >= stationsInTheBiggestCities.indexOf(tillStation)) {
                            secondCb(null);
                        } else {
                            bookingUzScraper
                                .getRoutesBetweenCities({
                                    fromStation: {
                                        title: fromStation.bookingUz.titles[0].title,
                                        station_id: fromStation.bookingUz.id
                                    },
                                    tillStation: {
                                        title: tillStation.bookingUz.titles[0].title,
                                        station_id: tillStation.bookingUz.id
                                    }
                                })
                                .then(function (routes) {
                                    secondCb(null, routes.value);
                                });
                        }

                    }, function (err, results) {
                        if (err) {
                            console.error(err);
                            firstCb(null);
                        } else {
                            firstCb(results);
                        }
                    });
                }, function (err, results) {
                    console.log(results);
                });

                // _.each(stationsInTheBiggestCities, function (fromStation) {
                //     _.each(stationsInTheBiggestCities, function (toStation) {
                //         console.log(stationInTheBiggestCity.bookingUz.titles[0].title);
                //     });
                // });

            });
    }

    function scrapAllStations() {
        bookingUzScraper.getStationsList()
            .then(function (stations) {
                db.addItems(
                    _.map(stations, function (station) {
                        return {
                            bookingUz: {
                                id: station.station_id,
                                titles: [
                                    {
                                        title: station.title,
                                        locale: 'uk_UA'
                                    }
                                ]
                            }
                        }
                    }),
                    'stations'
                );
            });
    }
});

