'use strict';

const express = require('express');
const router = express.Router();

const LichSuCongNoController = require('../controllers/lichSuCongNo.controller');

router.get('/', LichSuCongNoController.danhSach);
router.get('/:id', LichSuCongNoController.chiTiet);

module.exports = router;
