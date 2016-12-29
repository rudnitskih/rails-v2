let chai = require('chai');
let _ = require('lodash');
let expect = chai.expect;
let bookingUzScraper = require('./index.js');

describe('bookingUzScraper', function () {
    it('should get routes between Kyiv and Lviv', function (done) {
        bookingUzScraper.getRoutesBetweenCities({
            fromStation: {
                title: 'Київ',
                station_id: '2200001'
            },
            tillStation: {
                title: 'Львів',
                station_id: '2218000'
            }
        }).then(function (routes) {
            expect(routes.value.length > 9).to.be.true;

            done();
        });
    });

    it('should get stations list for \'k\' letter', function (done) {
        bookingUzScraper.getStationsListByPattern('к').then(function (stations) {
            expect(
                _.find(stations.value, function (station) {
                    return station.title === 'Київ';
                })
            ).to.exist;

            done();
        });
    });

    it('should get schedule for 747 train', function (done) {
        // TODO add expect on JSON, think about do not hardcode date_dep
        bookingUzScraper.getTrainSchedule({
            station_id_from: 2200001,
            station_id_till: 2218000,
            train: '747К',
            date_dep: 1485406500
        }).then(function (schedule) {
            expect(schedule).to.exist;

            done();
        });
    });
});