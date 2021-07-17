const Product = require('./../models/productModel');
const User = require('./../models/userModel');
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'attclone@gmail.com',
        pass: 'att615342clone'
    }
});


exports.claimProduct = catchAsync(async (req, res, next) => {
    var address = req.body.addrress +'\n' + req.body.postalCode + '\n' + req.body.district + '\n' + req.body.state
    const user = await User.findOne({email : req.user.email})
    const newProduct = await Product.create({
        name : req.body.productName,
        deliveryAddress : address,
        user : user._id,
        pointsBefore : user.points,
        pointsAfter : user.points - req.body.productPoints
    });
    user.points = user.points - req.body.productPoints;
    await user.save({runValidators: false})
    var messageUser = {
        from : 'attclone@gmail.com',
        to : user.email,
        subject : 'Your order has been placed successfully ',
        text : `your order of ${newProduct.name} has been successfully placed will be deliveried to you in a few woking days\nDILIVERY ADDRESS :\n ${newProduct.deliveryAddress}`
    };
    var messageAdmin  ={
        from : 'attclone@gmail.com',
        to : 'attclone@fmail.com',
        subject : `${user.name} <${user.email}> has claimed a product `,
        text : `Item name : ${newProduct.name}\n
        Dilivery Address : ${newProduct.deliveryAddress}\n
        user details : ${user.name} / ${user.email}\n
        points before : ${newProduct.pointsBefore}\n
        points after : ${newProduct.after}`
        
    }
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
        message : "Product Claimed"
    });

});