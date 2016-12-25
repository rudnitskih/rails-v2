require('app-module-path').addPath(__dirname + '/server');

process.on('uncaughtException', function(err) {
    console.log(err)
});

const bookingUzScraper = require('./booking-uz-scraper');

bookingUzScraper.getAllStations();
