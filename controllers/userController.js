const { update } = require("../models/userModel");
const User = require("../models/userModel");
const factory = require("./handlerFactory");

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

exports.updateMe = async (req, res, next) => {
  try {
    //1. Create error if body contains password or confirmPassword
    if (req.body.password || req.body.passwordConfirn) {
      return next(
        res.status(400).json({
          status: "fail",
          message:
            "This route is not for password updates. Please use /updateMyPassword",
        })
      );
    }

    //2. Filtered out unwanted field names which were not allowed to be updated.
    const filteredBody = filterObj(req.body, "name", "email");

    //3. Updated User Document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    next(
      res.status(400).json({
        status: "fail",
        message: err,
      })
    );
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(
      res.status(400).json({
        status: "fail",
        message: err,
      })
    );
  }
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined. Please use /signup for signing up",
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
//Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
