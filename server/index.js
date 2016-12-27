//require('app-module-path').addPath(__dirname);

process.on('uncaughtException', function(err) {
    console.log(err)
});

const bookingUzScraper = require('./booking-uz-scraper');

// bookingUzScraper.getAllStations().then(function(results){
//     console.log(results);
// });

// bookingUzScraper.getTrainSchedule().then(function(results){
//     console.log(results);
// });

// bookingUzScraper.getRoute().then(function(results){
//     console.dir(results, {depth: null});
// });

bookingUzScraper.getTrainMap().then(function(results){
    console.dir(results, {depth: null});
});
