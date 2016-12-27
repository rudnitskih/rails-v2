let chai = require('chai');
let expect = chai.expect;
let bookingUzScraper = require('./index.js');

describe('bookingUzScraper', function() {
    it('should get routes between Kyiv and Lviv', function(done) {
        bookingUzScraper.getRoutesBetweenCities().then(function(routes){
            expect(routes).to.equal(0);
            done();
        });
    });
});