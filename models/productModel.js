const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new mongoose.Schema({
    name : {type: String , required: [true , 'Please Provide Product Name']},
    deliveryAddress : {type : String, required : [true , 'Please Provide Delivery Address']},
    user : {type: Schema.Types.ObjectId, ref: 'User', default: undefined},
    pointsBefore : {type : Number , default : null, required : true},
    pointsAfter : {type : Number , default : null, required : true},
    phoneNumber : {type : String , required : [true , 'Please provide Phone Number']},
});

const Product = mongoose.model("Product" , ProductSchema)
module.exports = Product;