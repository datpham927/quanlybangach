'use strict';

const LichSuCongNo = require('../models/lichSuCongNo.model');

class LichSuCongNoController {
    static async danhSach(req, res) {
        const { khachHangId, loaiPhatSinh } = req.query;
        const filter = {};
        if (khachHangId) {
            filter.khachHangId = khachHangId;
        }
        if (loaiPhatSinh) {
            filter.loaiPhatSinh = loaiPhatSinh;
        }
        const data = await LichSuCongNo.find(filter)
            .populate('khachHangId', 'maKhachHang tenKhachHang soDienThoai')
            .populate('hoaDonId', 'maHoaDon tongTienHoaDon')
            .populate('phieuThuId', 'maPhieuThu soTienThu')
            .sort({ thoiGian: -1 });
        res.json({
            success: true,
            data,
        });
    }
    static async chiTiet(req, res) {
        const record = await LichSuCongNo.findById(req.params.id)
            .populate('khachHangId', 'maKhachHang tenKhachHang')
            .populate('hoaDonId', 'maHoaDon tongTienHoaDon')
            .populate('phieuThuId', 'maPhieuThu soTienThu');
        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch sử công nợ',
            });
        }
        res.json({
            success: true,
            data: record,
        });
    }
}

module.exports = LichSuCongNoController;
