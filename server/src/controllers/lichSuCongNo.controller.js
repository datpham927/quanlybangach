'use strict';

const LichSuCongNo = require('../models/lichSuCongNo.model');

class LichSuCongNoController {
    static async danhSach(req, res) {
        try {
            const { khachHangId, loaiPhatSinh, ngay } = req.query;
            const filter = {};
            if (khachHangId) {
                filter.khachHangId = khachHangId;
            }
            if (loaiPhatSinh) {
                filter.loaiPhatSinh = loaiPhatSinh;
            }
            if (ngay) {
                const startOfDay = new Date(ngay);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(ngay);
                endOfDay.setHours(23, 59, 59, 999);

                filter.thoiGian = {
                    $gte: startOfDay,
                    $lte: endOfDay,
                };
            }
            const data = await LichSuCongNo.find(filter)
                .populate('khachHangId', 'maKhachHang tenKhachHang soDienThoai')
                .populate({
                    path: 'hoaDonId',
                    select: 'maHoaDon ngayGiao tongTienHoaDon chiTietSanPhams',
                })
                .populate('phieuThuId', 'maPhieuThu soTienThu')
                .sort({ thoiGian: -1 });

            return res.json({
                success: true,
                data,
            });
        } catch (error) {
            console.error('❌ Lỗi lấy danh sách lịch sử công nợ:', error);
            return res.status(500).json({
                success: false,
                message: 'Không thể tải danh sách lịch sử công nợ',
            });
        }
    }

    /* ======================= CHI TIẾT LỊCH SỬ CÔNG NỢ ======================= */
    static async chiTiet(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu ID lịch sử công nợ',
                });
            }

            const record = await LichSuCongNo.findById(id)
                .populate('khachHangId', 'maKhachHang tenKhachHang soDienThoai')
                .populate('hoaDonId', 'maHoaDon tongTienHoaDon')
                .populate('phieuThuId', 'maPhieuThu soTienThu');

            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy lịch sử công nợ',
                });
            }

            return res.json({
                success: true,
                data: record,
            });
        } catch (error) {
            console.error('❌ Lỗi lấy chi tiết lịch sử công nợ:', error);
            return res.status(500).json({
                success: false,
                message: 'Không thể lấy chi tiết lịch sử công nợ',
            });
        }
    }
}

module.exports = LichSuCongNoController;
