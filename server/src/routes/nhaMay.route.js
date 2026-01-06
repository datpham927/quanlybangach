'use strict';

const express = require('express');
const nhaMayController = require('../controllers/nhaMay.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', auth, nhaMayController.danhSach);
router.post('/', auth, nhaMayController.tao);
router.put('/:id', auth, nhaMayController.capNhat);
router.delete('/:id', auth, nhaMayController.xoa);
router.patch('/:id/ngung', auth, nhaMayController.ngungHopTac);

module.exports = router;
