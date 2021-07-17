const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new mongoose.Schema({
    name : {type: String , required: true},
    deliveryAddress : {type : String, required : true},
    user : {type: Schema.Types.ObjectId, ref: 'User', default: undefined},
    pointsBefore : {type : Number , default : null, required : true},
    pointsAfter : {type : Number , default : null, required : true}
});

const Product = mongoose.model("Product" , ProductSchema)
module.exports = Product;