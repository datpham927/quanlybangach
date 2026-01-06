'use strict';

const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/tong-quan', auth, dashboardController.tongQuan);

module.exports = router;
