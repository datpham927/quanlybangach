'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const LichSuCongNoSchema = new Schema(
    {
        khachHangId: { type: Schema.Types.ObjectId, ref: 'KhachHang', required: true },
        loaiPhatSinh: { type: String, enum: ['HOA_DON', 'THU_TIEN', 'DIEU_CHINH'], required: true },
        soTienPhatSinh: { type: Number, required: true },
        // Quy ước:
        // + số dương  → tăng công nợ
        // - số âm     → giảm công nợ
        congNoTruoc: { type: Number, required: true },
        congNoSau: { type: Number, required: true },
        hoaDonId: { type: Schema.Types.ObjectId, ref: 'HoaDon' },
        phieuThuId: { type: Schema.Types.ObjectId, ref: 'PhieuThu' },
        ghiChu: String,
    },
    {
        timestamps: { createdAt: 'thoiGian' },
    },
);

module.exports = mongoose.model('LichSuCongNo', LichSuCongNoSchema);
