const mongoose = require('mongoose');

const productListSchema = new mongoose.Schema({
  name: String,
  claimPoints: Number,
});

const ProductList = mongoose.model('ProductList', productListSchema);

module.exports = ProductList;
