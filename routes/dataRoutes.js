const express = require('express');
const dataController = require('./../controllers/dataController');

const router = express.Router();

router.get('/getData', dataController.dataDisplay);
router.get('/getProductList', dataController.getProductList);

module.exports = router;
