'use strict';

const PhieuThu = require('../models/phieuThu.model');
const HoaDon = require('../models/hoaDon.model');
const KhachHang = require('../models/khachHang.model');

class PhieuThuController {
    static async tao(req, res) {
        const phieuThu = await PhieuThu.create(req.body);
        for (const pb of phieuThu.phanBoHoaDons) {
            await HoaDon.findByIdAndUpdate(pb.hoaDonId, {
                $inc: { daThu: pb.soTien, conNo: -pb.soTien },
            });
        }
        await KhachHang.findByIdAndUpdate(phieuThu.khachHangId, {
            $inc: { congNoHienTai: -phieuThu.soTienThu },
        });
        res.status(201).json({
            success: true,
            message: 'Thu tiền thành công',
            data: phieuThu,
        });
    }

    static async danhSach(req, res) {
        const data = await PhieuThu.find().sort({ ngayTao: -1 });
        res.json({ success: true, data });
    }
}

module.exports = PhieuThuController;
