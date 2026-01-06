'use strict';

const express = require('express');
const ctrl = require('../controllers/nhaMay.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', auth, ctrl.danhSach);
router.post('/', auth, ctrl.tao);
router.put('/:id', auth, ctrl.capNhat);
router.delete('/:id', auth, ctrl.xoa);

module.exports = router;
