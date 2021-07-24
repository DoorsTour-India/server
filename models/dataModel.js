const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
  name: String,
  id: String,
  category: String,
  about: String,
  pros: [String],
  cons: [String],
});

const Data = mongoose.model('Data', DataSchema);
module.exports = Data;
