'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChiTietSanPhamSchema = new Schema(
    {
        sanPhamId: { type: Schema.Types.ObjectId, ref: 'SanPham', required: true },
        tenSanPham: { type: String, required: true },
        kichThuoc: { type: String, required: true },
        nhaMayId: { type: Schema.Types.ObjectId, ref: 'NhaMay', required: true },
        soLuong: { type: Number, required: true, min: 1 },
        donGia: { type: Number, required: true, min: 0 },
        thanhTien: { type: Number, default: 0 },
    },
    { _id: false },
);

/* ================= HÓA ĐƠN ================= */
const HoaDonSchema = new Schema(
    {
        maHoaDon: { type: String, required: true, unique: true },
        ngayLap: { type: Date, default: Date.now },
        ngayGiao: { type: Date, required: true },
        nhaMayId: { type: Schema.Types.ObjectId, ref: 'NhaMay', required: true },
        khachHangId: { type: Schema.Types.ObjectId, ref: 'KhachHang', required: true },
        diaChiGiao: { type: String, required: true },
        trangThai: { type: String, enum: ['CHUA_THU', 'THU_MOT_PHAN', 'DA_THU', 'HUY'], default: 'CHUA_THU' },
        tongTienHoaDon: { type: Number, default: 0 },
        conNo: { type: Number, default: 0 },
        daThu: { type: Number, default: 0, min: 0 },
        chiTietSanPhams: { type: [ChiTietSanPhamSchema], validate: [(v) => Array.isArray(v) && v.length > 0, 'Hóa đơn phải có ít nhất 1 sản phẩm'] },
        ghiChu: { type: String },
        daKhoa: { type: Boolean, default: false },
        nguoiTaoId: { type: Schema.Types.ObjectId, ref: 'Admin' },
    },
    {
        timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
    },
);
/* ================= TÍNH TIỀN TỰ ĐỘNG ================= */
HoaDonSchema.pre('save', function (next) {
    let tongTien = 0;
    this.chiTietSanPhams.forEach((sp) => {
        sp.thanhTien = sp.soLuong * sp.donGia;
        tongTien += sp.thanhTien;
    });
    this.tongTienHoaDon = tongTien;
    this.conNo = tongTien - this.daThu;
    if (this.conNo < 0) {
        return next(new Error('Công nợ không hợp lệ'));
    }
    next();
});

HoaDonSchema.pre('findOneAndUpdate', async function (next) {
    const hoaDon = await this.model.findOne(this.getQuery());
    if (hoaDon?.daKhoa && this.getUpdate()?.chiTietSanPhams) {
        return next(new Error('Hóa đơn đã khóa, không được sửa chi tiết'));
    }
    next();
});

module.exports = mongoose.model('HoaDon', HoaDonSchema);
