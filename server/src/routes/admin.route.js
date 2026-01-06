'use strict';

const express = require('express');
const adminController = require('../controllers/admin.controller');

const router = express.Router();
router.post('/login', adminController.dangNhap);
router.post('/', adminController.taoAdmin);

module.exports = router;
