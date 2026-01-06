'use strict';

const express = require('express');
const phieuThuController = require('../controllers/phieuThu.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', auth, phieuThuController.danhSach);
router.post('/', auth, phieuThuController.tao);

module.exports = router;
