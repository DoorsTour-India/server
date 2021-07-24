const Data = require('./../models/dataModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


exports.dataDisplay = catchAsync(async (req, res, next) => {
    const data = await Data.find({});
    return res.status(200).json({
        status: 'success',
        data:  data
        
      });
});