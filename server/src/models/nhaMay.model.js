'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const NhaMaySchema = new Schema(
    {
        maNhaMay: { type: String, required: true, unique: true },
        tenNhaMay: { type: String, required: true },
        nguoiLienHe: String,
        soDienThoai: String,
        diaChi: String,
        dangHoatDong: { type: Boolean, default: true },
        ghiChu: String,
    },
    {
        timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
    },
);

module.exports = mongoose.model('NhaMay', NhaMaySchema);
