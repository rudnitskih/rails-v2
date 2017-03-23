let mongoose = require("mongoose");
let deepPopulate = require('mongoose-deep-populate')(mongoose);

let StationSchema = new mongoose.Schema({
    bookingUz: {
        id: {
            type: Number,
            unique: true
        },
        titles: [{
            title: String,
            locale: String
        }],
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    }
});


StationSchema.plugin(deepPopulate);

module.exports = mongoose.model('Station', StationSchema);