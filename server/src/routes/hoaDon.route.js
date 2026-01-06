'use strict';

const express = require('express');
const hoaDonController = require('../controllers/hoaDon.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', auth, hoaDonController.danhSach);
router.post('/', auth, hoaDonController.tao);
router.patch('/:id/khoa', auth, hoaDonController.khoa);

module.exports = router;
