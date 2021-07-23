const Product = require('./../models/productModel');
const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'teamkrayik@gmail.com',
    pass: 'Jaisairam11*',
  },
});

exports.claimProduct = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.user.email });
  if (user.points >= req.body.productPoints) {
    var address =
      req.body.address +
      ', ' +
      req.body.district +
      ', ' +
      req.body.state +
      ', ' +
      req.body.postalCode;

    const newProduct = await Product.create({
      name: req.body.productName,
      deliveryAddress: address,
      user: user._id,
      pointsBefore: user.points,
      pointsAfter: user.points - req.body.productPoints,
      phoneNumber: req.body.phoneNumber,
    });
    user.points = user.points - req.body.productPoints;
    await User.findByIdAndUpdate(
      user._id,
      { points: user.points },
      { runValidators: false }
    );
    // await user.save({ runValidators: false });
    var userHTML = pug.renderFile(
      `${__dirname}/../views/product/orderConfirmationUser.pug`,
      {
        id: newProduct._id,
        address: req.body.address,
        district: req.body.district,
        state: req.body.state,
        postalCode: req.body.postalCode,
        name  : newProduct.name,
        claimedAt : newProduct.claimedAt
      }
    );
    var messageUser = {
      from: 'Krayik <krayik@doorstour.com>',
      to: user.email,
      subject: 'Your order has been placed successfully ',
      html: userHTML,
      text: htmlToText.fromString(userHTML),
    };

    var messageAdmin = {
      from: 'Krayik <krayik@doorstour.com>',
      to: 'teamkrayik@gmail.com',
      subject: `${user.name} <${user.email}> has claimed a product `,
      text: `Item name : ${newProduct.name}\n
          Delivery Address : ${newProduct.deliveryAddress}\n
          user details : ${user.name} / ${user.email}\n
          points before : ${newProduct.pointsBefore}\n
          points after : ${newProduct.pointsAfter}\n
          phone number : ${newProduct.phoneNumber}`,
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
  } else {
    return res.status(201).json({
      status: 'error',
      message: 'Not enough points',
    });
  }
});

exports.productsClaimed = catchAsync(async (req, res, next) => {
  products = await Product.find({user : req.user.email});
  res.status(201).json({
    status : 'succes',
    data : products
  });
});

