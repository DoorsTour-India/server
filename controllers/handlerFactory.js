const { Model } = require("mongoose");
const APIfeatures = require("./../utils/apiFeatures");

exports.deleteOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      res.status(404).json({
        status: "fail",
        message: "No document found with this ID",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
      message: "Tour has been deleted.",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });

    if (!doc) {
      res.status(404).json({
        status: "fail",
        message: "No document found with this ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getOne = (Model, popOptions) => async (req, res) => {
  try {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      res.status(404).json({
        status: "fail",
        message: "No document found with this ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getAll = (Model) => async (req, res) => {
  try {
    //To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    //EXECUTE QUERY
    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sorting()
      .limitFields()
      .paginate();
    const doc = await features.query;
    // const doc = await features.query.explain();

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      result: doc.length,
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
