'use strict';

const express = require('express');
const app = express();

app.use(express.json());

app.use('/api/admin', require('./admin.route'));
app.use('/api/nha-may', require('./nhaMay.route'));
app.use('/api/san-pham', require('./sanPham.route'));
app.use('/api/khach-hang', require('./khachHang.route'));
app.use('/api/lich-su-cong-no', require('./lichSuCongNo.route'));
app.use('/api/hoa-don', require('./hoaDon.route'));
app.use('/api/phieu-thu', require('./phieuThu.route'));
app.use('/api/chuyen-cho', require('./chuyenCho.route'));
app.use('/api/dashboard', require('./dashboard.route'));
// USER PUBLIC
app.use('/api/san-pham', require('./sanPham.route'));
module.exports = app;
