const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getResetPasswordForm = catchAsync(async (req, res, next) => {
  const token = req.params.token;

  res.status(200).render('passwordResetForm', {
    title: 'Reset Password',
    token,
  });
});
