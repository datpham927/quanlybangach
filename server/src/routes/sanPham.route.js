'use strict';

const express = require('express');
const ctrl = require('../controllers/sanPham.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', auth, ctrl.danhSach);
router.post('/', auth, ctrl.tao);
router.put('/:id', auth, ctrl.capNhat);
router.patch('/:id/hien-thi', auth, ctrl.hienThi);

module.exports = router;
