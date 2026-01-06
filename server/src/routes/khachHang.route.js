'use strict';

const express = require('express');
const khachHangController = require('../controllers/khachHang.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', auth, khachHangController.danhSach);
router.post('/', auth, khachHangController.tao);
router.put('/:id', auth, khachHangController.capNhat);
router.patch('/:id/trang-thai', auth, khachHangController.doiTrangThai);
router.delete('/:id', auth, khachHangController.xoa);

module.exports = router;
