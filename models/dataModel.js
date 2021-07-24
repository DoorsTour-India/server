const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
    reitData : [],
    invitsData : []
})

const Data = mongoose.model('Data', DataSchema);
module.exports = Data;