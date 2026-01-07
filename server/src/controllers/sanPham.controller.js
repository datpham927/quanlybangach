'use strict';

const chuyenChoModel = require('../models/chuyenCho.model');
const hoaDonModel = require('../models/hoaDon.model');
const SanPham = require('../models/sanPham.model');

class SanPhamController {
    static async danhSach(req, res) {
        try {
            const { tenSanPham, kichThuoc, nhaMayId, giaTu, giaDen, hienThi } = req.query;
            const filter = {};

            if (hienThi !== undefined) {
                filter.hienThi = Number(hienThi) === 1;
            }
            if (tenSanPham) {
                filter.tenSanPham = { $regex: tenSanPham, $options: 'i' };
            }
            if (kichThuoc) {
                filter.kichThuoc = kichThuoc;
            }
            if (nhaMayId) {
                filter.nhaMayId = nhaMayId;
            }
            if (giaTu || giaDen) {
                filter.giaBanMacDinh = {};
                if (giaTu) filter.giaBanMacDinh.$gte = Number(giaTu);
                if (giaDen) filter.giaBanMacDinh.$lte = Number(giaDen);
            }

            const data = await SanPham.find(filter).populate('nhaMayId').sort({ ngayTao: -1 });

            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách sản phẩm',
                error: error.message,
            });
        }
    }

    static async tao(req, res) {
        try {
            const count = await SanPham.countDocuments();
            const maSanPham = `SP${String(count + 1).padStart(5, '0')}`;
            const sp = await SanPham.create({
                ...req.body,
                maSanPham,
            });

            res.status(201).json({
                success: true,
                message: 'Tạo sản phẩm thành công',
                data: sp,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo sản phẩm',
                error: error.message,
            });
        }
    }

    static async capNhat(req, res) {
        try {
            const sp = await SanPham.findByIdAndUpdate(req.params.id, req.body, { new: true });

            if (!sp) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm',
                });
            }

            res.json({
                success: true,
                message: 'Cập nhật sản phẩm thành công',
                data: sp,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật sản phẩm',
                error: error.message,
            });
        }
    }

    static async hienThi(req, res) {
        try {
            const sp = await SanPham.findByIdAndUpdate(req.params.id, { hienThi: req.body.hienThi }, { new: true });

            if (!sp) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm',
                });
            }

            res.json({
                success: true,
                message: 'Cập nhật trạng thái hiển thị thành công',
                data: sp,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật hiển thị',
                error: error.message,
            });
        }
    }

    static async danhSachCongKhai(req, res) {
        try {
            const { tenSanPham, kichThuoc, nhaMayId, giaTu, giaDen } = req.query;
            const filter = { hienThi: true };

            if (tenSanPham) {
                filter.tenSanPham = { $regex: tenSanPham, $options: 'i' };
            }
            if (kichThuoc) {
                filter.kichThuoc = kichThuoc;
            }
            if (nhaMayId) {
                filter.nhaMayId = nhaMayId;
            }
            if (giaTu || giaDen) {
                filter.giaBanMacDinh = {};
                if (giaTu) filter.giaBanMacDinh.$gte = Number(giaTu);
                if (giaDen) filter.giaBanMacDinh.$lte = Number(giaDen);
            }

            const data = await SanPham.find(filter).populate('nhaMayId', 'tenNhaMay').sort({ ngayTao: -1 });

            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách công khai',
                error: error.message,
            });
        }
    }

    static async chiTietCongKhai(req, res) {
        try {
            const sanPham = await SanPham.findOne({
                _id: req.params.id,
                hienThi: true,
            }).populate('nhaMayId', 'tenNhaMay soDienThoai diaChi');

            if (!sanPham) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm',
                });
            }

            res.json({ success: true, data: sanPham });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy chi tiết sản phẩm',
                error: error.message,
            });
        }
    }

    static async xoa(req, res) {
        try {
            const { id } = req.params;

            const sanPham = await SanPham.findById(id);
            if (!sanPham) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm',
                });
            }

            const soHoaDon = await hoaDonModel.countDocuments({
                'chiTietSanPhams.sanPhamId': id,
            });
            if (soHoaDon > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa sản phẩm đã phát sinh hóa đơn',
                });
            }

            const soChuyenCho = await chuyenChoModel.countDocuments({
                'danhSachSanPhams.sanPhamId': id,
            });
            if (soChuyenCho > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa sản phẩm đã phát sinh chuyến chở',
                });
            }

            await SanPham.findByIdAndDelete(id);

            res.json({
                success: true,
                message: 'Xóa sản phẩm thành công',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa sản phẩm',
                error: error.message,
            });
        }
    }
}

module.exports = SanPhamController;
