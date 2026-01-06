'use strict';

const PhieuThu = require('../models/phieuThu.model');
const HoaDon = require('../models/hoaDon.model');
const KhachHang = require('../models/khachHang.model');
const phieuThuModel = require('../models/phieuThu.model');

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
        const { maKhachHang, khachHangId, maPhieuThu } = req.query;

        const filter = {};

        if (maPhieuThu) {
            filter.maPhieuThu = { $regex: maPhieuThu, $options: 'i' };
        }

        if (khachHangId) {
            filter.khachHangId = khachHangId;
        }

        let query = PhieuThu.find(filter)
            // 1️⃣ populate KHÁCH HÀNG
            .populate('khachHangId', 'maKhachHang tenKhachHang soDienThoai')
            // 2️⃣ populate HÓA ĐƠN
            .populate({
                path: 'phanBoHoaDons.hoaDonId',
                select: `
                maHoaDon 
                ngayGiao 
                tongTienHoaDon 
                daThu 
                conNo 
                chiTietSanPhams
            `,
            })
            .sort({ ngayThu: -1 });

        // 3️⃣ Query theo mã khách hàng
        if (maKhachHang) {
            const KhachHang = require('../models/khachHang.model');

            const khIds = await KhachHang.find({
                maKhachHang: { $regex: maKhachHang, $options: 'i' },
            }).distinct('_id');

            query = query.where('khachHangId').in(khIds);
        }

        const data = await query;

        res.json({
            success: true,
            data,
        });
    }
}

module.exports = PhieuThuController;
