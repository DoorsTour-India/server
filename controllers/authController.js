const crypto = require("crypto");
const { promisify } = require("util");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("./../utils/email");

const assignToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = assignToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  //remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    });

    next(createAndSendToken(newUser, 201, res));
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Please enter email and password",
        })
      );
    }

    const user = await User.findOne({ email: email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(
        res.status(401).json({
          status: "fail",
          message: "Incorrect email or password",
        })
      );
    }

    createAndSendToken(user, 200, res);
  } catch (err) {
    res.status(400).join({
      status: "fail",
      message: err,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    //1. Getting token and check if its there?
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        res.status(401).json({
          status: "fail",
          message: "You are not logged in! Please login to get Access.",
        })
      );
    }

    //2. Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3. Check if user still exists
    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
      return next(
        res.status(401).json({
          status: "fail",
          message: "The user belonging to the token no longer exists.",
        })
      );
    }

    //4. If user changed password after token was issued

    req.user = freshUser;
    next();
  } catch (err) {
    let statusCode;
    if (err.name === "JsonWebTokenError") {
      statusCode = 401;
      err = "Invalid token, please login again";
    }

    if (err.name === "TokenExpiredError") {
      statusCode = 401;
      err = "Your token has expired, Please login again";
    }

    res.status(400 || statusCode).json({
      status: "fail",
      message: err,
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        res.status(403).json({
          status: "fail",
          message: "You do not have permission to perform this action",
        })
      );
    }

    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  //1. Get user based on email address provided
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      res.status(404).json({
        status: "fail",
        message: "No user found with this email",
      })
    );
  }

  //2. Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3. Send it to users' email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset Token(valid for 10min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to Email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      res.status(500).json({
        status: "fail",
        message: "There was an error sending the email. Try again later!",
      })
    );
  }

  next();
};

exports.resetPassword = async (req, res, next) => {
  try {
    //1. get user based on token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    //2. Set new password only if token has not expired, and there is a user
    if (!user) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Token is invalid or has expired",
        })
      );
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    //3. Update the changedPasswordAt property for the user
    createAndSendToken(user, 200, res);

    //4. Log the user in, send JWT
  } catch (err) {
    next(
      res.status(400).json({
        status: "fail",
        message: err,
      })
    );
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    //1. Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    //2. Need to check if posted password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(
        res.status(401).json({
          status: "fail",
          message: "Your current password is wrong.",
        })
      );
    }

    //3. If correct, then update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    //4. Log the user in, send JWT
    createAndSendToken(user, 200, res);
  } catch (err) {
    next(
      res.status(400).json({
        status: "fail",
        message: err,
      })
    );
  }
};
