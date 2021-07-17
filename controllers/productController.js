const Product = require('./../models/productModel');
const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'teamkrayik@gmail.com',
    pass: 'Jaisairam11*',
  },
});

exports.claimProduct = catchAsync(async (req, res, next) => {
  var address =
    req.body.address +
    ', ' +
    req.body.postalCode +
    ', ' +
    req.body.district +
    ', ' +
    req.body.state;
  const user = await User.findOne({ email: req.user.email });
  const newProduct = await Product.create({
    name: req.body.productName,
    deliveryAddress: address,
    user: user._id,
    pointsBefore: user.points,
    pointsAfter: user.points - req.body.productPoints,
  });
  user.points = user.points - req.body.productPoints;
  await User.findByIdAndUpdate(
    user._id,
    { points: user.points },
    { runValidators: false }
  );
  // await user.save({ runValidators: false });
  var messageUser = {
    from: 'teamkrayik@gmail.com',
    to: user.email,
    subject: 'Your order has been placed successfully ',
    text: `your order of ${newProduct.name} has been successfully placed will be deliveried to you in a few woking days\nDILIVERY ADDRESS :\n ${newProduct.deliveryAddress}`,
  };
  var messageAdmin = {
    from: 'teamkrayik@gmail.com',
    to: 'teamkrayik@gmail.com',
    subject: `${user.name} <${user.email}> has claimed a product `,
    text: `Item name : ${newProduct.name}\n
        Delivery Address : ${newProduct.deliveryAddress}\n
        user details : ${user.name} / ${user.email}\n
        points before : ${newProduct.pointsBefore}\n
        points after : ${newProduct.pointsAfter}`,
  };
  transporter.sendMail(messageUser, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent sucessfully: ' + info.response);
    }
  });
  transporter.sendMail(messageAdmin, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent sucessfully: ' + info.response);
    }
  });
  return res.status(201).json({
    status: 'success',
    message: 'Product Claimed',
  });
});
