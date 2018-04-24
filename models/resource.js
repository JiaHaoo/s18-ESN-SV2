var mongoose = require('mongoose');
var GeoJSON = require('mongoose-geojson-schema');

var ClaimerSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: {
        type: Number,
    }
});

var ResourceSchema = mongoose.Schema({

    // sender: ref to User. not indexed.
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    claimers: { type: [ClaimerSchema], default: [] },

    unlimited: { type: Boolean, required: true },

    // quantity: Int.
    quantity: {
        type: Number,
    },
    remainingQuantity: Number,

    unit: String,
    // name: string.
    name: String,
    // details: string.
    details: String,

    //location: [float: latitude, float: longitude]
    location: { type: mongoose.Schema.Types.Point, required: true },
});


module.exports = mongoose.model('Resource', ResourceSchema);