'use strict';

const HoaDon = require('../models/hoaDon.model');
const ChuyenCho = require('../models/chuyenCho.model');
const KhachHang = require('../models/khachHang.model');

class HoaDonController {
    static async tao(req, res) {
        const { nhaMayId, khachHangId, diaChiGiao, ngayGiao, chiTietSanPhams, ghiChu } = req.body;

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
            nguoiTaoId: req.user?._id, // admin
        });

        // 4️⃣ Tạo chuyến chở (TỰ ĐỘNG)
        await ChuyenCho.create({
            hoaDonId: hoaDon._id,
            ngayChuyen: hoaDon.ngayGiao,
            nhaMayId: hoaDon.nhaMayId,
            khachHangId: hoaDon.khachHangId,
            danhSachGach: hoaDon.chiTietSanPhams,
        });

        // 5️⃣ Cập nhật công nợ khách hàng
        const KhachHang = require('../models/khachHang.model');
        await KhachHang.findByIdAndUpdate(khachHangId, {
            $inc: { congNoHienTai: hoaDon.tongTienHoaDon },
        });

        res.status(201).json({
            success: true,
            message: 'Tạo hóa đơn thành công',
            data: hoaDon,
        });
    }
    static async danhSach(req, res) {
        const { khachHangId } = req.query;
        const filter = {};
        if (khachHangId) {
            filter.khachHangId = khachHangId;
        }
        let query = HoaDon.find(filter).populate('khachHangId', 'maKhachHang tenKhachHang soDienThoai').sort({ ngayTao: -1 });
        const data = await query;
        res.json({
            success: true,
            data,
        });
    }

    static async khoa(req, res) {
        await HoaDon.findByIdAndUpdate(req.params.id, { daKhoa: true });
        res.json({ success: true, message: 'Đã khóa hóa đơn' });
    }
}

module.exports = HoaDonController;
