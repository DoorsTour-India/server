const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new mongoose.Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'ProductList',
    default: undefined,
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Please Provide Delivery Address'],
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', default: undefined },
  pointsBefore: { type: Number, default: null, required: true },
  pointsAfter: { type: Number, default: null, required: true },
  claimedAt: {
    type: Date,
    default: Date.now(),
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide Phone Number'],
  },
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
