'use strict';

const SanPham = require('../models/sanPham.model');
const KhachHang = require('../models/khachHang.model');
const HoaDon = require('../models/hoaDon.model');
const NhaMay = require('../models/nhaMay.model');

class DashboardController {
    static async tongQuan(req, res) {
        const [tongSanPham, tongKhachHang, tongHoaDon, tongNhaMay] = await Promise.all([
            SanPham.countDocuments(),
            KhachHang.countDocuments(),
            HoaDon.countDocuments(),
            NhaMay.countDocuments(),
        ]);
        const tongDoanhThu = await HoaDon.aggregate([{ $group: { _id: null, tong: { $sum: '$tongTienHoaDon' } } }]);
        const tongCongNo = await KhachHang.aggregate([{ $group: { _id: null, tong: { $sum: '$congNoHienTai' } } }]);
        res.json({
            success: true,
            data: {
                tongSanPham,
                tongKhachHang,
                tongHoaDon,
                tongNhaMay,
                tongDoanhThu: tongDoanhThu[0]?.tong || 0,
                tongCongNo: tongCongNo[0]?.tong || 0,
            },
        });
    }
}

module.exports = DashboardController;
