'use strict';

const HoaDon = require('../models/hoaDon.model');
const ChuyenCho = require('../models/chuyenCho.model');
const KhachHang = require('../models/khachHang.model');
const sanPhamModel = require('../models/sanPham.model');
const lichSuCongNoModel = require('../models/lichSuCongNo.model');

class HoaDonController {
    static async tao(req, res) {
        try {
            const { nhaMayId, khachHangId, diaChiGiao, ngayGiao, chiTiet, ghiChu } = req.body;

            if (!nhaMayId || !khachHangId || !ngayGiao || !chiTiet?.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc',
                });
            }

            const maHoaDon = `HD${Date.now()}`;

            // 1️⃣ LẤY THÔNG TIN KHÁCH HÀNG (để lấy công nợ trước)
            const khachHang = await KhachHang.findById(khachHangId);
            if (!khachHang) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khách hàng',
                });
            }

            const congNoTruoc = khachHang.congNoHienTai || 0;

            // 2️⃣ XỬ LÝ CHI TIẾT SẢN PHẨM
            const chiTietDaXuLy = await Promise.all(
                chiTiet.map(async (ct) => {
                    const sanPham = await sanPhamModel.findById(ct.sanPhamId);
                    if (!sanPham) {
                        throw new Error('Sản phẩm không tồn tại');
                    }

                    return {
                        sanPhamId: sanPham._id,
                        tenSanPham: sanPham.tenSanPham,
                        kichThuoc: sanPham.kichThuoc,
                        nhaMayId,
                        soLuong: ct.soLuong,
                        donGia: ct.donGia,
                    };
                }),
            );

            // 3️⃣ TẠO HÓA ĐƠN
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

            // 4️⃣ TẠO CHUYẾN CHỞ (AUTO)
            await ChuyenCho.create({
                hoaDonId: hoaDon._id,
                ngayChuyen: hoaDon.ngayGiao,
                nhaMayId,
                khachHangId,
                danhSachGach: hoaDon.chiTietSanPhams,
            });

            // 5️⃣ CẬP NHẬT CÔNG NỢ KHÁCH HÀNG
            const congNoSau = congNoTruoc + hoaDon.tongTienHoaDon;

            await KhachHang.findByIdAndUpdate(khachHangId, {
                $inc: { congNoHienTai: hoaDon.tongTienHoaDon },
            });
            // 6️⃣ 🔥 GHI LỊCH SỬ CÔNG NỢ
            await lichSuCongNoModel.create({
                khachHangId,
                hoaDonId: hoaDon._id,
                loaiPhatSinh: 'TAO_HOA_DON',
                soTienPhatSinh: hoaDon.tongTienHoaDon, // + tiền
                congNoTruoc,
                congNoSau,
                ghiChu: `Tạo hóa đơn ${maHoaDon} | +${hoaDon.tongTienHoaDon.toLocaleString()}đ`,
                thoiGian: new Date(),
            });

            return res.status(201).json({
                success: true,
                message: 'Tạo hóa đơn thành công',
                data: hoaDon,
            });
        } catch (error) {
            console.error('❌ Lỗi tạo hóa đơn:', error.message);
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server khi tạo hóa đơn',
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
            const data = await HoaDon.find(filter).populate('khachHangId', 'maKhachHang tenKhachHang soDienThoai').sort({ ngayTao: -1 });
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

            const hoaDon = await HoaDon.findByIdAndUpdate(id, { daKhoa: true }, { new: true });

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
