const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

router.get('/resetPassword/:token', viewsController.getResetPasswordForm);

module.exports = router;
