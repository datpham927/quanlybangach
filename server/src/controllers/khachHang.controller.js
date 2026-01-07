'use strict';

const KhachHang = require('../models/khachHang.model');
const HoaDon = require('../models/hoaDon.model');

class KhachHangController {
    static async danhSach(req, res) {
        try {
            const { trangThai } = req.query;
            const filter = {};

            if (trangThai) {
                filter.trangThai = trangThai;
            }

            const data = await KhachHang.find(filter).sort({ ngayTao: -1 });

            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Lỗi lấy danh sách khách hàng',
            });
        }
    }

    static async tao(req, res) {
        try {
            const last = await KhachHang.findOne().sort({ ngayTao: -1 });
            let nextNumber = 1;
            if (last?.maKhachHang) {
                const so = parseInt(last.maKhachHang.replace('KH', ''), 10);
                nextNumber = so + 1;
            }
            const maKhachHang = `KH${String(nextNumber).padStart(4, '0')}`;
            const kh = await KhachHang.create({
                ...req.body,
                maKhachHang,
                congNoHienTai: 0,
                trangThai: 'HOAT_DONG',
            });

            res.status(201).json({
                success: true,
                message: 'Tạo khách hàng thành công',
                data: kh,
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Lỗi tạo khách hàng',
            });
        }
    }
    static async capNhat(req, res) {
        try {
            const kh = await KhachHang.findByIdAndUpdate(req.params.id, req.body, { new: true });

            if (!kh) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khách hàng',
                });
            }

            res.json({
                success: true,
                message: 'Cập nhật khách hàng thành công',
                data: kh,
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Lỗi cập nhật khách hàng',
            });
        }
    }

    static async doiTrangThai(req, res) {
        try {
            const { trangThai } = req.body;

            if (!['HOAT_DONG', 'NGUNG_GIAO_DICH'].includes(trangThai)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái không hợp lệ',
                });
            }

            const kh = await KhachHang.findByIdAndUpdate(req.params.id, { trangThai }, { new: true });

            if (!kh) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khách hàng',
                });
            }

            res.json({
                success: true,
                message: trangThai === 'NGUNG_GIAO_DICH' ? 'Đã ngừng giao dịch khách hàng' : 'Đã mở lại giao dịch khách hàng',
                data: kh,
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Lỗi đổi trạng thái khách hàng',
            });
        }
    }

    static async xoa(req, res) {
        try {
            const { id } = req.params;

            const khachHang = await KhachHang.findById(id);
            if (!khachHang) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khách hàng',
                });
            }

            if (khachHang.congNoHienTai > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa khách hàng đang có công nợ',
                });
            }

            const soHoaDon = await HoaDon.countDocuments({
                khachHangId: id,
            });

            if (soHoaDon > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa khách hàng đã phát sinh hóa đơn',
                });
            }

            await KhachHang.findByIdAndDelete(id);

            res.json({
                success: true,
                message: 'Xóa khách hàng thành công',
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Lỗi xóa khách hàng',
            });
        }
    }
}

module.exports = KhachHangController;
