'use strict';

const express = require('express');
const SanPhamController = require('../controllers/sanPham.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/cong-khai', SanPhamController.danhSachCongKhai);
router.get('/cong-khai/:id', SanPhamController.chiTietCongKhai);
router.get('/', auth, SanPhamController.danhSach);
router.post('/', auth, SanPhamController.tao);
router.put('/:id', auth, SanPhamController.capNhat);
router.patch('/:id/hien-thi', auth, SanPhamController.hienThi);
router.delete('/:id', auth, SanPhamController.xoa);
router.get('/top-luot-xem', SanPhamController.topLuotXem);

module.exports = router;
