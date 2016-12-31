let chai = require('chai');
let _ = require('lodash');
let moment = require('moment');

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

    it('should get schedule for 705К train', function (done) {
        // TODO add expect on JSON, think about do not hardcode date_dep
        bookingUzScraper.getTrainSchedule({
            stationIdFrom: 2200001,
            stationIdTill: 2218000,
            train: '705К',
            dateDep: moment()
                        .hours(6)
                        .minutes(45)
                        .seconds(0)
                        .milliseconds(0)
                        .add(15, 'day')
                        .valueOf()
        }).then(function (schedule) {
            expect(schedule).to.exist;

            done();
        });
    });

    it.only('should get map for 705К train', function (done) {
        bookingUzScraper.getTrainSchedule({
            stationIdFrom: 2200001,
            stationIdTill: 2218000,
            train: '705К',
            dateDep: moment()
                .hours(6)
                .minutes(45)
                .seconds(0)
                .milliseconds(0)
                .add(15, 'day')
                .valueOf()
        }).then(function (stations) {
            expect(stations.length).to.equal(5);
            expect(stations[0].coord).to.deep.equal({lat: '50.440058', long: '30.488309'});

            done();
        });
    });
});