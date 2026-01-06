'use strict';

const express = require('express');
const chuyenChoController = require('../controllers/chuyenCho.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', auth, chuyenChoController.danhSach);

module.exports = router;
