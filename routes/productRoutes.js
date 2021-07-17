const express = require('express');
const productController = require('./../controllers/productController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.use(authController.protect); //Protect all routes after this middleware
router.post('/claimProduct' , productController.claimProduct);

module.exports = router;
