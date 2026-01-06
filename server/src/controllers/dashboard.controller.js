'use strict';

const SanPham = require('../models/sanPham.model');
const KhachHang = require('../models/khachHang.model');
const HoaDon = require('../models/hoaDon.model');
const NhaMay = require('../models/nhaMay.model');
const tinhPhanTram = require('../utils/tinhPhanTram');

class DashboardController {
    static async tongQuan(req, res) {
        const now = new Date();
        const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const [
            // Tổng hiện tại
            tongSanPham,
            tongKhachHang,
            tongNhaMay,
            hoaDonThangNay,
            // Tháng trước
            sanPhamThangTruoc,
            khachHangThangTruoc,
            hoaDonThangTruoc,
            // Công nợ
            congNoHienTai,
            congNoThangTruoc,
            hoaDonCanThu,
            khachHangCongNoCao,
        ] = await Promise.all([
            SanPham.countDocuments({ daXoa: { $ne: true } }),
            KhachHang.countDocuments(),
            NhaMay.countDocuments(),
            HoaDon.countDocuments({ ngayLap: { $gte: startThisMonth, $lte: endThisMonth } }),
            // Đếm tháng trước
            SanPham.countDocuments({ ngayTao: { $gte: startLastMonth, $lte: endLastMonth } }),
            KhachHang.countDocuments({ ngayTao: { $gte: startLastMonth, $lte: endLastMonth } }),
            HoaDon.countDocuments({ ngayLap: { $gte: startLastMonth, $lte: endLastMonth } }),
            // Công nợ
            KhachHang.aggregate([{ $group: { _id: null, tong: { $sum: '$congNoHienTai' } } }]),
            KhachHang.aggregate([
                { $match: { ngayCapNhat: { $gte: startLastMonth, $lte: endLastMonth } } },
                { $group: { _id: null, tong: { $sum: '$congNoHienTai' } } },
            ]),
            HoaDon.find({ conNo: { $gt: 0 }, trangThai: { $ne: 'HUY' } })
                .select('maHoaDon ngayGiao conNo trangThai')
                .sort({ ngayGiao: 1 })
                .limit(5),
            KhachHang.find({ congNoHienTai: { $gt: 0 } })
                .select('maKhachHang tenKhachHang soDienThoai congNoHienTai')
                .sort({ congNoHienTai: -1 })
                .limit(5),
        ]);

        const tongCongNo = congNoHienTai[0]?.tong || 0;
        const tongCongNoThangTruoc = congNoThangTruoc[0]?.tong || 0;

        res.json({
            success: true,
            data: {
                tongSanPham,
                tongKhachHang,
                tongNhaMay,
                hoaDonThangNay,
                tongCongNo,
                // ===== % SO VỚI THÁNG TRƯỚC =====
                phanTram: {
                    sanPham: tinhPhanTram(tongSanPham, sanPhamThangTruoc),
                    khachHang: tinhPhanTram(tongKhachHang, khachHangThangTruoc),
                    hoaDon: tinhPhanTram(hoaDonThangNay, hoaDonThangTruoc),
                    congNo: tinhPhanTram(tongCongNo, tongCongNoThangTruoc),
                },
                hoaDonCanThu,
                khachHangCongNoCao,
            },
        });
    }
}

module.exports = DashboardController;
