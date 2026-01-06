'use strict';

const HoaDon = require('../models/hoaDon.model');
const ChuyenCho = require('../models/chuyenCho.model');
const KhachHang = require('../models/khachHang.model');

class HoaDonController {
    static async tao(req, res) {
        const hoaDon = await HoaDon.create(req.body);
        // tạo chuyến chở
        await ChuyenCho.create({
            hoaDonId: hoaDon._id,
            ngayChuyen: hoaDon.ngayGiao,
            nhaMayId: hoaDon.nhaMayId,
            khachHangId: hoaDon.khachHangId,
            danhSachGach: hoaDon.chiTietSanPhams,
        });
        // cộng công nợ
        await KhachHang.findByIdAndUpdate(hoaDon.khachHangId, {
            $inc: { congNoHienTai: hoaDon.tongTienHoaDon },
        });
        res.status(201).json({
            success: true,
            message: 'Tạo hóa đơn thành công',
            data: hoaDon,
        });
    }

    static async danhSach(req, res) {
        const data = await HoaDon.find().sort({ ngayTao: -1 });
        res.json({ success: true, data });
    }

    static async khoa(req, res) {
        await HoaDon.findByIdAndUpdate(req.params.id, { daKhoa: true });
        res.json({ success: true, message: 'Đã khóa hóa đơn' });
    }
}

module.exports = HoaDonController;
