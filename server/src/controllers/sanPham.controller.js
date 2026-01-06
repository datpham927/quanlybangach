'use strict';

const chuyenChoModel = require('../models/chuyenCho.model');
const hoaDonModel = require('../models/hoaDon.model');
const SanPham = require('../models/sanPham.model');

class SanPhamController {
    static async danhSach(req, res) {
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
    }

    static async tao(req, res) {
        const sp = await SanPham.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: sp,
        });
    }

    static async capNhat(req, res) {
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
    }

    static async hienThi(req, res) {
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
    }

    static async danhSachCongKhai(req, res) {
        const { tenSanPham, kichThuoc, nhaMayId, giaTu, giaDen } = req.query;
        const filter = {
            hienThi: true,
        };
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
    }

    static async chiTietCongKhai(req, res) {
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
    }
    static async xoa(req, res) {
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
        return res.json({
            success: true,
            message: 'Xóa sản phẩm thành công',
        });
    }
}

module.exports = SanPhamController;
