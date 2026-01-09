'use strict';

const SanPham = require('../models/sanPham.model');
const KhachHang = require('../models/khachHang.model');
const HoaDon = require('../models/hoaDon.model');
const NhaMay = require('../models/nhaMay.model');
const PhieuThu = require('../models/phieuThu.model');
const tinhPhanTram = require('../utils/tinhPhanTram');
const { getDateRange } = require('../utils/getDateRange');

class DashboardController {
    /* =====================================================
       TỔNG QUAN DASHBOARD
    ===================================================== */
    static async tongQuan(req, res) {
        try {
            const { range = '1m' } = req.query;
            const { startCurrent, endCurrent, startPrev, endPrev } = getDateRange(range);

            const [
                // ================= TỔNG HỆ THỐNG =================
                tongSanPham,
                tongKhachHang,
                tongNhaMay,

                // ================= HÓA ĐƠN =================
                hoaDonHienTai,
                hoaDonTruoc,

                // ================= DOANH THU (HÓA ĐƠN) =================
                doanhThuHienTai,
                doanhThuTruoc,

                // ================= CÔNG NỢ =================
                congNoHienTai,
                congNoTruoc,

                // ================= ĐÃ THU (PHIẾU THU) =================
                daThuHienTai,
                daThuTruoc,

                // ================= LIST =================
                hoaDonCanThu,
                khachHangCongNoCao,
            ] = await Promise.all([
                SanPham.countDocuments({ daXoa: { $ne: true } }),
                KhachHang.countDocuments(),
                NhaMay.countDocuments(),

                HoaDon.countDocuments({
                    ngayLap: { $gte: startCurrent, $lte: endCurrent },
                }),
                HoaDon.countDocuments({
                    ngayLap: { $gte: startPrev, $lte: endPrev },
                }),

                // 🔥 TỔNG DOANH THU (KỲ HIỆN TẠI)
                HoaDon.aggregate([
                    {
                        $match: {
                            ngayLap: { $gte: startCurrent, $lte: endCurrent },
                            trangThai: { $ne: 'HUY' },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            tong: { $sum: '$tongTienHoaDon' },
                        },
                    },
                ]),

                // 🔥 TỔNG DOANH THU (KỲ TRƯỚC)
                HoaDon.aggregate([
                    {
                        $match: {
                            ngayLap: { $gte: startPrev, $lte: endPrev },
                            trangThai: { $ne: 'HUY' },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            tong: { $sum: '$tongTienHoaDon' },
                        },
                    },
                ]),

                KhachHang.aggregate([{ $group: { _id: null, tong: { $sum: '$congNoHienTai' } } }]),
                KhachHang.aggregate([
                    {
                        $match: {
                            ngayCapNhat: { $gte: startPrev, $lte: endPrev },
                        },
                    },
                    { $group: { _id: null, tong: { $sum: '$congNoHienTai' } } },
                ]),

                // 🔥 DOANH THU ĐÃ THU
                PhieuThu.aggregate([
                    {
                        $match: {
                            ngayThu: { $gte: startCurrent, $lte: endCurrent },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            tong: { $sum: '$soTienThu' },
                        },
                    },
                ]),
                PhieuThu.aggregate([
                    {
                        $match: {
                            ngayThu: { $gte: startPrev, $lte: endPrev },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            tong: { $sum: '$soTienThu' },
                        },
                    },
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
            const tongCongNoTruoc = congNoTruoc[0]?.tong || 0;

            const tongDaThu = daThuHienTai[0]?.tong || 0;
            const tongDaThuTruoc = daThuTruoc[0]?.tong || 0;

            const tongDoanhThu = doanhThuHienTai[0]?.tong || 0;
            const tongDoanhThuTruoc = doanhThuTruoc[0]?.tong || 0;

            return res.json({
                success: true,
                range,
                data: {
                    tongSanPham,
                    tongKhachHang,
                    tongNhaMay,

                    hoaDonHienTai,

                    // 🔥 TIỀN
                    tongDoanhThu,
                    tongDaThu,
                    tongCongNo,

                    phanTram: {
                        sanPham: tinhPhanTram(tongSanPham, 0),
                        khachHang: tinhPhanTram(tongKhachHang, 0),
                        hoaDon: tinhPhanTram(hoaDonHienTai, hoaDonTruoc),
                        doanhThu: tinhPhanTram(tongDoanhThu, tongDoanhThuTruoc),
                        daThu: tinhPhanTram(tongDaThu, tongDaThuTruoc),
                        congNo: tinhPhanTram(tongCongNo, tongCongNoTruoc),
                    },

                    hoaDonCanThu,
                    khachHangCongNoCao,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi lấy dữ liệu dashboard',
            });
        }
    }
}

module.exports = DashboardController;
