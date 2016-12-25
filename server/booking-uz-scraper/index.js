const rp = require('request-promise');
const _ = require('lodash');
const async = require('async');

const baseUrl = 'http://booking.uz.gov.ua';
const j = rp.jar();

// let cookie_string;
//
// rp({url: baseUrl, jar: j})
//     .then(function () {
//         cookie_string = j.getCookieString(baseUrl);
//     });

const alphabets = {
    'uk_ua': ['а', 'б', 'в', 'г', 'ґ', 'д', 'е', 'є', 'ж', 'з', 'и', 'і', 'ї', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ь', 'ю', 'я']
};

class BookingUzScraper {
    getStationsByPattern(pattern) {
        return rp({
            url: encodeURI(`${baseUrl}/purchase/station/${pattern}`),
            json: true
        });
    }

    getAllStations() {
        const that = this;

        return new Promise(function(resolve, reject){
            async.mapLimit(alphabets['uk_ua'], 1, function (letter, callback) {
                that.getStationsByPattern(letter)
                    .then(function (results) {
                        callback(null, _.filter(results.value, function (station) {
                            return station.title.match(new RegExp(letter, 'gi'));
                        }));
                    })
                    .catch(callback);

            }, function (err, results) {
                if (err) reject(err);

                let sum = _.reduce(results, function(sum, stationsByLetter){
                    return sum + stationsByLetter.length;
                }, 0);
                
                console.log(sum);
                resolve(results);
            });
        }).catch(console.error);

    }
}

module.exports = new BookingUzScraper();