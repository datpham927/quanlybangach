'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const KhachHangSchema = new Schema(
    {
        maKhachHang: { type: String, unique: true },
        tenKhachHang: { type: String, required: true },
        soDienThoai: { type: String, required: true, unique: true },
        diaChi: String,
        ghiChu: String,
        congNoHienTai: { type: Number, default: 0, min: 0 },
        trangThai: {
            type: String,
            enum: ['HOAT_DONG', 'NGUNG_GIAO_DICH'],
            default: 'HOAT_DONG',
        },
    },
    {
        timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
    },
);

module.exports = mongoose.model('KhachHang', KhachHangSchema);
