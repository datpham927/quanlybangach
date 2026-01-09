'use strict';

const HoaDon = require('../models/hoaDon.model');
const ChuyenCho = require('../models/chuyenCho.model');
const KhachHang = require('../models/khachHang.model');

class HoaDonController {
    /* ======================= TẠO HÓA ĐƠN ======================= */
    static async tao(req, res) {
        try {
            const {
                nhaMayId,
                khachHangId,
                diaChiGiao,
                ngayGiao,
                chiTietSanPhams,
                ghiChu,
            } = req.body;

            if (!nhaMayId || !khachHangId || !ngayGiao || !chiTietSanPhams?.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc',
                });
            }

            // 1️⃣ Sinh mã hóa đơn
            const maHoaDon = `HD${Date.now()}`;

            // 2️⃣ Gắn nhaMayId vào từng chi tiết sản phẩm
            const chiTietDaXuLy = chiTietSanPhams.map((sp) => ({
                ...sp,
                nhaMayId,
            }));

            // 3️⃣ Tạo hóa đơn
            const hoaDon = await HoaDon.create({
                maHoaDon,
                nhaMayId,
                khachHangId,
                diaChiGiao,
                ngayGiao,
                chiTietSanPhams: chiTietDaXuLy,
                ghiChu,
                nguoiTaoId: req.user?._id,
            });

            // 4️⃣ Tạo chuyến chở tự động
            await ChuyenCho.create({
                hoaDonId: hoaDon._id,
                ngayChuyen: hoaDon.ngayGiao,
                nhaMayId: hoaDon.nhaMayId,
                khachHangId: hoaDon.khachHangId,
                danhSachGach: hoaDon.chiTietSanPhams,
            });

            // 5️⃣ Cập nhật công nợ khách hàng
            await KhachHang.findByIdAndUpdate(khachHangId, {
                $inc: { congNoHienTai: hoaDon.tongTienHoaDon },
            });

            return res.status(201).json({
                success: true,
                message: 'Tạo hóa đơn thành công',
                data: hoaDon,
            });
        } catch (error) {
            console.error('❌ Lỗi tạo hóa đơn:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi tạo hóa đơn',
            });
        }
    }

    /* ======================= DANH SÁCH HÓA ĐƠN ======================= */
    static async danhSach(req, res) {
        try {
            const { khachHangId } = req.query;
            const filter = {};

            if (khachHangId) {
                filter.khachHangId = khachHangId;
            }

            const data = await HoaDon.find(filter)
                .populate('khachHangId', 'maKhachHang tenKhachHang soDienThoai')
                .sort({ ngayTao: -1 });

            return res.json({
                success: true,
                data,
            });
        } catch (error) {
            console.error('❌ Lỗi lấy danh sách hóa đơn:', error);
            return res.status(500).json({
                success: false,
                message: 'Không thể tải danh sách hóa đơn',
            });
        }
    }

    /* ======================= CHI TIẾT HÓA ĐƠN ======================= */
    static async chiTiet(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu ID hóa đơn',
                });
            }

            const hoaDon = await HoaDon.findById(id)
                .populate('khachHangId', 'maKhachHang tenKhachHang soDienThoai diaChi')
                .populate('nhaMayId', 'maNhaMay tenNhaMay')
                .lean();

            if (!hoaDon) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy hóa đơn',
                });
            }

            return res.json({
                success: true,
                data: hoaDon,
            });
        } catch (error) {
            console.error('❌ Lỗi lấy chi tiết hóa đơn:', error);
            return res.status(500).json({
                success: false,
                message: 'Không thể lấy chi tiết hóa đơn',
            });
        }
    }

    /* ======================= KHÓA HÓA ĐƠN ======================= */
    static async khoa(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu ID hóa đơn',
                });
            }

            const hoaDon = await HoaDon.findByIdAndUpdate(
                id,
                { daKhoa: true },
                { new: true }
            );

            if (!hoaDon) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy hóa đơn',
                });
            }

            return res.json({
                success: true,
                message: 'Đã khóa hóa đơn',
                data: hoaDon,
            });
        } catch (error) {
            console.error('❌ Lỗi khóa hóa đơn:', error);
            return res.status(500).json({
                success: false,
                message: 'Không thể khóa hóa đơn',
            });
        }
    }
}

module.exports = HoaDonController;
