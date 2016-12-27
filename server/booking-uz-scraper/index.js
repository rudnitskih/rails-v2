let rp = require('request-promise');
let _ = require('lodash');
let async = require('async');
let jjdecode = require('../helpers/jjdecode');


let baseUrl = 'http://booking.uz.gov.ua';

let alphabets = {
    'uk_ua': ['а', 'б', 'в', 'г', 'ґ', 'д', 'е', 'є', 'ж', 'з', 'и', 'і', 'ї', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ь', 'ю', 'я']
};

let requestHeaders = {};
let j = rp.jar();
rp = rp.defaults({jar: j});

function getInitialRequest() {
    return requestHeaders['GV-Token']
        ? Promise.resolve(requestHeaders)
        : rp({
            url: baseUrl
        }).then(function (body) {
            requestHeaders['GV-Token'] = getGvToken(body);
        });
}

function getGvToken(body) {
    let matches = body.match(/70\);}\);(.*)<\/script>/);
    let jsFunction = jjdecode(matches[1]);
    return jsFunction.match(',."(.*?)..;')[1];
}

module.exports = {
    getStationsListByPattern(pattern) {
        return getInitialRequest()
            .then(function () {
                return rp({
                    url: encodeURI(`${baseUrl}/purchase/station/${pattern}`),
                    json: true,
                    jar: j
                }).catch(console.error);
            });
    },

    getStationsList() {
        return new Promise((resolve, reject) => {
            async.mapLimit(alphabets['uk_ua'], 1, (letter, callback) => {
                this.getStationsListByPattern(letter)
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

    },

    getRoutesBetweenCities() {
        let options = {
            url: 'http://booking.uz.gov.ua/purchase/search/',
            method: 'POST',
            headers: _.assign(requestHeaders, {
                'GV-Ajax': '1',
                'Referer': baseUrl,
                'Content-Type': 'application/x-www-form-urlencoded'
            }),
            jar: j,
            json: true,
            form: _({
                station_id_from: 2200001,
                station_id_till: 2218000,
                station_from: '%D0%9A%D0%B8%D0%B5%D0%B2',
                station_till: '%D0%9B%D1%8C%D0%B2%D0%BE%D0%B2',
                date_dep: '28.12.2016',
                time_dep: '00%3A00',
                time_dep_till: '',
                another_ec: '0',
                search: ''
            })
                .map(function (value, key) {
                    return `${key}=${value}`;
                })
                .join('&')

        };

        //request(options, callback);

        return getInitialRequest()
            .then(function () {
                return rp(options);
            });
    },

    getTrainSchedule(){
        return getInitialRequest()
            .then(function () {
                let headers = {
                    'GV-Token': '6b1fbee63f30ee998654b02e0199b260',
                    'Origin': 'http://booking.uz.gov.ua',
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'en-US,en;q=0.8,uk;q=0.6,ru;q=0.4',
                    'Connection': 'keep-alive',
                    'GV-Ajax': '1',
                    'GV-Screen': '1366x768',
                    'GV-Referer': 'http://booking.uz.gov.ua/',
                    'Pragma': 'no-cache',
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': '*/*',
                    'Cache-Control': 'no-cache',
                    'Referer': 'http://booking.uz.gov.ua/',
                    'Cookie': '_gv_sessid=jpbhokbmhs7n65bie19ahlbgp3; HTTPSERVERID=server2; __utma=31515437.1733562073.1476519681.1479150838.1480162632.4; __utmc=31515437; __utmz=31515437.1476519681.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _uz_cart_personal_email=rudnitskih%40gmail.com; JSESSIONID=aaaJXJ6xoQWs-8vB8GXKv; _gv_lang=uk; _ga=GA1.3.1733562073.1476519681; _gat=1'
                };

                let dataString = 'station_id_from=2200001&station_id_till=2218000&train=743%D0%9F&date_dep=1485184680';

                let options = {
                    url: 'http://booking.uz.gov.ua/purchase/train_route/',
                    method: 'POST',
                    headers: headers,
                    body: dataString
                };


                return rp(options).catch(console.error);
            }).catch(console.error);
    },

    getTrainMap(){
        return getInitialRequest()
            .then(function () {
                let headers = {
                    'GV-Token': '6b1fbee63f30ee998654b02e0199b260',
                    'Origin': 'http://booking.uz.gov.ua',
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'en-US,en;q=0.8,uk;q=0.6,ru;q=0.4',
                    'Connection': 'keep-alive',
                    'GV-Ajax': '1',
                    'GV-Screen': '1366x768',
                    'GV-Referer': 'http://booking.uz.gov.ua/',
                    'Pragma': 'no-cache',
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': '*/*',
                    'Cache-Control': 'no-cache',
                    'Referer': 'http://booking.uz.gov.ua/',
                    'Cookie': '_gv_sessid=jpbhokbmhs7n65bie19ahlbgp3; HTTPSERVERID=server2; _gv_lang=uk; __utma=31515437.1733562073.1476519681.1479150838.1480162632.4; __utmc=31515437; __utmz=31515437.1476519681.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _uz_cart_personal_email=rudnitskih%40gmail.com; JSESSIONID=aaaJXJ6xoQWs-8vB8GXKv; _ga=GA1.3.1733562073.1476519681; _gat=1'
                };

                var dataString = 'station_id_from=2200001&station_id_till=2218000&train=747%D0%9A&date_dep=1485233700';

                var options = {
                    url: 'http://booking.uz.gov.ua/purchase/train_route_map/',
                    method: 'POST',
                    headers: headers,
                    body: dataString
                };


                return rp(options).catch(console.error);
            }).catch(console.error);
    }
};