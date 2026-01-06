'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChuyenChoSchema = new Schema(
    {
        hoaDonId: { type: Schema.Types.ObjectId, ref: 'HoaDon', required: true, unique: true },
        ngayChuyen: { type: Date, required: true },
        nhaMayId: { type: Schema.Types.ObjectId, ref: 'NhaMay', required: true },
        khachHangId: { type: Schema.Types.ObjectId, ref: 'KhachHang', required: true },
        danhSachGach: [
            {
                sanPhamId: Schema.Types.ObjectId,
                tenSanPham: String,
                kichThuoc: String,
                soLuong: Number,
            },
        ],
    },
    {
        timestamps: { createdAt: 'ngayTao' },
    },
);

module.exports = mongoose.model('ChuyenCho', ChuyenChoSchema);
