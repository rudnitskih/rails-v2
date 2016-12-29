let rp = require('request-promise');
let _ = require('lodash');
let async = require('async');
let jjdecode = require('../helpers/jjdecode');
let moment = require('moment');

let baseUrl = 'http://booking.uz.gov.ua';

let alphabets = {
    'uk_ua': ['а', 'б', 'в', 'г', 'ґ', 'д', 'е', 'є', 'ж', 'з', 'и', 'і', 'ї', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ь', 'ю', 'я']
};

let requestHeaders = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
    'GV-Screen': '1366x768',
    'Pragma': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': '*/*',
    'Cache-Control': 'no-cache',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US,en;q=0.8,uk;q=0.6,ru;q=0.4',
    'Connection': 'keep-alive',
    'GV-Referer': baseUrl,
    'Origin': baseUrl
};
let j = rp.jar();
rp = rp.defaults({jar: j});

function getInitialRequest() {
    return requestHeaders['GV-Token']
        ? Promise.resolve(requestHeaders)
        : rp({
            url: baseUrl
        }).then(function (body) {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    requestHeaders['GV-Token'] = getGvToken(body);
                    resolve();
                }, 1000);
            })
        });
}

function getGvToken(body) {
    let matches = body.match(/70\);}\);(.*)<\/script>/);
    let jsFunction = jjdecode(matches[1]);
    return jsFunction.match(',."(.*?)..;')[1];
}

function createRequestBody(objectWithParams) {
    return _(objectWithParams).map(function (value, key) {
        return `${key}=${value}`;
    }).join('&')
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

    getRoutesBetweenCities(options) {
        return getInitialRequest()
            .then(function () {
                let {fromStation, tillStation, date = moment().add(31, 'days').format('DD.MM.YYYY'), time = '00:00'} = options;

                return rp({
                    url: 'http://booking.uz.gov.ua/purchase/search/',
                    method: 'POST',
                    headers: _.assign(requestHeaders, {
                        'GV-Ajax': '1',
                        'Referer': baseUrl,
                        'Cookie': j.getCookieString(baseUrl)
                    }),
                    jar: j,
                    json: true,
                    form: createRequestBody({
                        station_id_from: fromStation.station_id,
                        station_id_till: tillStation.station_id,
                        station_from: encodeURI(fromStation.title),
                        station_till: encodeURI(tillStation.title),
                        date_dep: date,
                        time_dep: encodeURI(time),
                        time_dep_till: '',
                        another_ec: '0',
                        search: ''
                    })
                });
            })
            .catch(console.error);
    },

    getTrainSchedule(options){
        let {stationFrom, stationTill, train, dateDep} = options;

        return getInitialRequest()
            .then(function () {
                // TODO add parsing HTML to JSON
                return rp({
                    url: 'http://booking.uz.gov.ua/purchase/train_route/',
                    method: 'POST',
                    headers: _.assign(requestHeaders, {
                        'GV-Ajax': '1',
                        'Referer': baseUrl,
                        'Cookie': j.getCookieString(baseUrl)
                    }),
                    form: createRequestBody({
                        station_id_from: stationFrom,
                        station_id_till: stationTill,
                        train: train,
                        date_dep: dateDep
                    })
                })
            }).catch(console.error);
    },

    getTrainMap(){
        return getInitialRequest()
            .then(function () {
                return rp({
                    url: 'http://booking.uz.gov.ua/purchase/train_route_map/',
                    method: 'POST',
                    headers: {
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
                    },
                    body: 'station_id_from=2200001&station_id_till=2218000&train=747%D0%9A&date_dep=1485233700'
                })
            }).catch(console.error);
    }
};