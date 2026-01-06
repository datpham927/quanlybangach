'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/* Chi tiết sản phẩm trong hóa đơn */
const ChiTietSanPhamSchema = new Schema(
    {
        sanPhamId: { type: Schema.Types.ObjectId, ref: 'SanPham', required: true },
        tenSanPham: { type: String, required: true },
        kichThuoc: { type: String, required: true },
        nhaMayId: { type: Schema.Types.ObjectId, ref: 'NhaMay', required: true },
        soLuong: { type: Number, required: true, min: 1 },
        donGia: { type: Number, required: true, min: 0 },
        thanhTien: { type: Number, required: true, min: 0 },
    },
    { _id: false },
);

const HoaDonSchema = new Schema(
    {
        maHoaDon: { type: String, required: true, unique: true },

        ngayLap: { type: Date, default: Date.now },
        ngayGiao: { type: Date, required: true },

        nhaMayId: { type: Schema.Types.ObjectId, ref: 'NhaMay', required: true },
        khachHangId: { type: Schema.Types.ObjectId, ref: 'KhachHang', required: true },

        diaChiGiao: { type: String, required: true },

        trangThai: {
            type: String,
            enum: ['CHUA_THU', 'THU_MOT_PHAN', 'DA_THU', 'HUY'],
            default: 'CHUA_THU',
        },

        tongTienHoaDon: { type: Number, required: true }, // PHÁP LÝ
        daThu: { type: Number, default: 0 },
        conNo: { type: Number, required: true },

        chiTietSanPhams: {
            type: [ChiTietSanPhamSchema],
            validate: (v) => v.length > 0,
        },

        ghiChu: String,
        daKhoa: { type: Boolean, default: false },

        nguoiTaoId: { type: Schema.Types.ObjectId },
    },
    {
        timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
    },
);

/* Tính tiền tự động */
HoaDonSchema.pre('save', function (next) {
    let tong = 0;
    this.chiTietSanPhams.forEach((i) => {
        i.thanhTien = i.soLuong * i.donGia;
        tong += i.thanhTien;
    });

    this.tongTienHoaDon = tong;
    this.conNo = tong - this.daThu;

    if (this.conNo < 0) {
        return next(new Error('Cong no khong hop le'));
    }

    next();
});

/* Cấm sửa giá khi đã khóa */
HoaDonSchema.pre('findOneAndUpdate', async function (next) {
    const hoaDon = await this.model.findOne(this.getQuery());
    if (hoaDon?.daKhoa && this.getUpdate().chiTietSanPhams) {
        return next(new Error('Hoa don da khoa, khong duoc sua gia'));
    }
    next();
});

module.exports = mongoose.model('HoaDon', HoaDonSchema);
