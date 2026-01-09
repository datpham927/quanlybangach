'use strict';

const NhaMay = require('../models/nhaMay.model');
const SanPham = require('../models/sanPham.model');
const HoaDon = require('../models/hoaDon.model');
const ChuyenCho = require('../models/chuyenCho.model');

class NhaMayController {
    static async danhSach(req, res) {
        try {
            const data = await NhaMay.find().sort({ ngayTao: -1 });
            return res.json({
                success: true,
                data,
            });
        } catch (err) {
            console.error('danhSach error:', err);
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
    static async danhSachCongKhai(req, res) {
        try {
            const data = await NhaMay.find({
                dangHoatDong: true,
            })
                .select('tenNhaMay soDienThoai diaChi') // chỉ field public
                .sort({ tenNhaMay: 1 });

            return res.json({
                success: true,
                data,
            });
        } catch (err) {
            console.error('danhSachCongKhai error:', err);
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
    static async tao(req, res) {
        try {
            const last = await NhaMay.findOne().sort({ ngayTao: -1 });

            let nextNumber = 1;
            if (last?.maNhaMay) {
                const so = parseInt(last.maNhaMay.replace('NM', ''), 10);
                nextNumber = so + 1;
            }
            const maNhaMay = `NM${String(nextNumber).padStart(4, '0')}`;
            const nhaMay = await NhaMay.create({
                ...req.body,
                maNhaMay,
                dangHoatDong: true,
            });

            return res.status(201).json({
                success: true,
                message: 'Tạo nhà máy thành công',
                data: nhaMay,
            });
        } catch (err) {
            console.error('tao error:', err);
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
    static async capNhat(req, res) {
        try {
            const nhaMay = await NhaMay.findByIdAndUpdate(req.params.id, req.body, { new: true });

            if (!nhaMay) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy nhà máy',
                });
            }

            return res.json({
                success: true,
                message: 'Cập nhật nhà máy thành công',
                data: nhaMay,
            });
        } catch (err) {
            console.error('capNhat error:', err);
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }

    static async xoa(req, res) {
        try {
            const { id } = req.params;

            const nhaMay = await NhaMay.findById(id);
            if (!nhaMay) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy nhà máy',
                });
            }

            const [coSanPham, coHoaDon, coChuyenCho] = await Promise.all([
                SanPham.exists({ nhaMayId: id }),
                HoaDon.exists({ nhaMayId: id }),
                ChuyenCho.exists({ nhaMayId: id }),
            ]);
            // Chưa phát sinh dữ liệu → xóa vĩnh viễn
            if (!coSanPham && !coHoaDon && !coChuyenCho) {
                await NhaMay.findByIdAndDelete(id);
                return res.json({
                    success: true,
                    message: 'Đã xóa vĩnh viễn nhà máy (chưa phát sinh dữ liệu)',
                });
            }
            // Đã phát sinh dữ liệu → ngừng hợp tác
            nhaMay.dangHoatDong = false;
            await nhaMay.save();
            return res.json({
                success: true,
                message: 'Nhà máy đã phát sinh dữ liệu, không thể xóa',
                data: nhaMay,
            });
        } catch (err) {
            console.error('xoa error:', err);
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
    static async toggleHopTac(req, res) {
        try {
            const nhaMay = await NhaMay.findById(req.params.id);

            if (!nhaMay) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy nhà máy',
                });
            }
            nhaMay.dangHoatDong = !nhaMay.dangHoatDong;
            await nhaMay.save();
            return res.json({
                success: true,
                message: nhaMay.dangHoatDong ? 'Đã hợp tác lại nhà máy' : 'Đã ngừng hợp tác nhà máy',
                data: nhaMay,
            });
        } catch (err) {
            console.error('toggleHopTac error:', err);
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
}

module.exports = NhaMayController;
