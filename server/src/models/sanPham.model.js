'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const SanPhamSchema = new Schema(
    {
        maSanPham: { type: String, required: true, unique: true },
        tenSanPham: { type: String, required: true },
        kichThuoc: { type: String, required: true },
        nhaMayId: { type: Schema.Types.ObjectId, ref: 'NhaMay', required: true },
        giaBanMacDinh: { type: Number, required: true, min: 0 }, // GIÁ GỢI Ý
        hinhAnh: String,
        moTa: String,
        hienThi: { type: Boolean, default: true },
        luotXem: { type: Number, default: 0 },
        tinhTrangSanXuat: {
            type: String,
            enum: ['CON_SAN_XUAT', 'NGUNG_SAN_XUAT'],
            default: 'CON_SAN_XUAT',
        },
    },
    {
        timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
    },
);

module.exports = mongoose.model('SanPham', SanPhamSchema);
