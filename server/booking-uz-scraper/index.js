const rp = require('request-promise');
const _ = require('lodash');
const async = require('async');

const baseUrl = 'http://booking.uz.gov.ua';

const alphabets = {
    'uk_ua': ['а', 'б', 'в', 'г', 'ґ', 'д', 'е', 'є', 'ж', 'з', 'и', 'і', 'ї', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ь', 'ю', 'я']
};

class BookingUzScraper {
    getStationsByPattern(pattern) {
        return rp({
            url: encodeURI(`${baseUrl}/purchase/station/${pattern}`),
            json: true
        }).catch(console.error);
    }

    getAllStations() {
        const that = this;

        return new Promise(function (resolve, reject) {
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

                resolve(_.flatten(results));
            });
        }).catch(console.error);

    }

    getRoute() {
        // return rp.post({
        //     url: `${baseUrl}/purchase/search/`,
        //     form: {
        //         station_id_from: '2200001',
        //         station_id_till: '2218000',
        //         station_from: '%D0%9A%D0%B8%D0%B5%D0%B2',
        //         station_till: '%D0%9B%D1%8C%D0%B2%D0%BE%D0%B2',
        //         date_dep: '28.12.2016',
        //         time_dep: '00%3A00',
        //         time_dep_till: '',
        //         another_ec: '0',
        //         search: ''
        //     }

        var headers = {
            'GV-Token': '9cfb993b84e92f461ff5a663177f702b',
            //'Origin': 'http://booking.uz.gov.ua',
            //'Accept-Encoding': 'gzip, deflate',
            //'Accept-Language': 'en-US,en;q=0.8,uk;q=0.6,ru;q=0.4',
            //'Connection': 'keep-alive',
            'GV-Ajax': '1',
            //'GV-Screen': '1366x768',
            //'GV-Referer': 'http://booking.uz.gov.ua/ru/',
            //'Pragma': 'no-cache',
            //'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            //'Accept': '*/*',
            //'Cache-Control': 'no-cache',
            'Referer': 'http://booking.uz.gov.ua/ru/',
            'Cookie': '_gv_sessid=jpbhokbmhs7n65bie19ahlbgp3; HTTPSERVERID=server2; __utma=31515437.1733562073.1476519681.1479150838.1480162632.4; __utmc=31515437; __utmz=31515437.1476519681.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); JSESSIONID=aaaJXJ6xoQWs-8vB8GXKv; _gv_lang=ru;'
        };

        var dataString = 'station_id_from=2200001&station_id_till=2218000&station_from=%D0%9A%D0%B8%D0%B5%D0%B2&station_till=%D0%9B%D1%8C%D0%B2%D0%BE%D0%B2&date_dep=28.12.2016&time_dep=00%3A00&time_dep_till=&another_ec=0&search=';

        var options = {
            url: 'http://booking.uz.gov.ua/ru/purchase/search/',
            method: 'POST',
            headers: headers,
            body: dataString
        };

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }

        //request(options, callback);

        return rp(options).catch(console.error);
    }
}

module.exports = new BookingUzScraper();