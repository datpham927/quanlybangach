'use strict';

const hoaDonModel = require('../models/hoaDon.model');
const khachHangModel = require('../models/khachHang.model');
const KhachHang = require('../models/khachHang.model');

class KhachHangController {
    static async danhSach(req, res) {
        const { trangThai } = req.query;
        const filter = {};
        if (trangThai) {
            filter.trangThai = trangThai;
        }
        const data = await KhachHang.find(filter).sort({ ngayTao: -1 });
        res.json({ success: true, data });
    }

    static async tao(req, res) {
        const kh = await KhachHang.create(req.body);
        res.status(201).json({ success: true, message: 'Tạo khách hàng thành công', data: kh });
    }

    static async capNhat(req, res) {
        const kh = await KhachHang.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!kh) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
        }
        res.json({ success: true, message: 'Cập nhật khách hàng thành công', data: kh });
    } // 👉 NGỪNG / MỞ GIAO DỊCH
    static async doiTrangThai(req, res) {
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
    }

    static async xoa(req, res) {
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
        const soHoaDon = await hoaDonModel.countDocuments({
            khachHangId: id,
        });
        if (soHoaDon > 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa khách hàng đã phát sinh hóa đơn',
            });
        }
        await khachHangModel.findByIdAndDelete(id);
        return res.json({
            success: true,
            message: 'Xóa khách hàng thành công',
        });
    }
}

module.exports = KhachHangController;
