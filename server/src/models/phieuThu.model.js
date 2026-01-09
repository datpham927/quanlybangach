'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const PhanBoSchema = new Schema(
    {
        hoaDonId: { type: Schema.Types.ObjectId, ref: 'HoaDon', required: true },
        soTien: { type: Number, required: true, min: 0 },
    },
    { _id: false },
);

const PhieuThuSchema = new Schema(
    {
        maPhieuThu: { type: String, required: true, unique: true },
        khachHangId: { type: Schema.Types.ObjectId, ref: 'KhachHang', required: true },
        ngayThu: { type: Date, required: true },
        soTienThu: { type: Number, required: true, min: 0 },
        nguoiThuId: Schema.Types.ObjectId,
        ghiChu: String,
        phanBoHoaDons: { type: [PhanBoSchema], required: true },
    },
    {
        timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
    },
);

module.exports = mongoose.model('PhieuThu', PhieuThuSchema);
