const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const Email = require('./../utils/email');
const fileupload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const { stringify } = require('querystring');

cloudinary.config({
  cloud_name: 'dmv7jhvdh',
  api_key: '776132611778321',
  api_secret: '6Rsx1igDj7Ri-jDCi4Q8ljBzyn8',
});

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-ash6734hsad3-122333312.jpeg
//     const extension = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

// const multerStorage = multer.memoryStorage();

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new AppError('Not an image! Please upload only images', 400), false);
//   }
// };

// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
// });

//exports.uploadUserPhoto = upload.single('photo');
exports.uploadUserPhoto = catchAsync(async (req, res, next) => {
  const file = req.files.image;
  cloudinary.uploader.upload(
    file.tempFilePath,
    catchAsync(async (err, result) => {
      if (err) throw err;
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { photo: result.url },
        { runValidators: false, new: true }
      );
      res.status(201).json({
        status: 'success',
        message: 'Photo uploaded',
        data: {
          user: updatedUser,
        },
      });
    })
  );
});
// exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
//   if (!req.file) {
//     return next();
//   }

//   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

// await sharp(req.file.buffer)
//   .resize(500, 500)
//   .toFormat('jpeg')
//   .jpeg({ quality: 90 })
//   .toFile(`public/img/users/${req.file.filename}`);
// next();
// });

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'dob');
  filteredBody.dob = filteredBody.dob + 'Z';
  // if (req.file) filteredBody.photo = req.file.filename;

  // Create activation token and store it in database.
  // let token = crypto.randomBytes(32).toString('hex');
  // const activationToken = crypto
  //   .createHash('sha256')
  //   .update(token)
  //   .digest('hex');

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { ...filteredBody },
    {
      new: true,
      runValidators: false,
    }
  );

  // Send Activation Email..
  // const url = `${req.protocol}://${req.get('host')}/success/${activationToken}`;

  // await new Email(updatedUser, url).sendActivationEmail();

  res.status(201).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
