'use strict';

const PhieuThu = require('../models/phieuThu.model');
const HoaDon = require('../models/hoaDon.model');
const KhachHang = require('../models/khachHang.model');
const phieuThuModel = require('../models/phieuThu.model');

class PhieuThuController {
    static async tao(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { khachHangId, soTienThu, phanBoHoaDons = [], ghiChu } = req.body;
            const khachHang = await KhachHang.findById(khachHangId).session(session);
            if (!khachHang) {
                throw new Error('Không tìm thấy khách hàng');
            }
            const congNoTruoc = khachHang.congNoHienTai || 0;
            // 2️⃣ Tạo phiếu thu
            const [phieuThu] = await phieuThuModel.create([{ khachHangId, soTienThu, phanBoHoaDons, ghiChu }], { session });
            // 3️⃣ (KHÔNG BẮT BUỘC) cập nhật hóa đơn để hiển thị / đối soát
            for (const pb of phanBoHoaDons) {
                await HoaDon.findByIdAndUpdate(pb.hoaDonId, { $inc: { daThu: pb.soTien } }, { session });
            }
            // 4️⃣ TÍNH CÔNG NỢ SAU (CỐT LÕI)
            const congNoSau = soTienThu >= congNoTruoc ? 0 : congNoTruoc - soTienThu;
            // 5️⃣ Cập nhật công nợ khách hàng
            await KhachHang.findByIdAndUpdate(khachHangId, { congNoHienTai: congNoSau }, { session });
            // 6️⃣ Tạo ghi chú lịch sử
            const ghiChuLichSu = taoGhiChuThuTien({
                soTienThu,
                congNoTruoc,
                ghiChu,
            });
            // 7️⃣ Lưu lịch sử công nợ
            await LichSuCongNo.create(
                [
                    {
                        khachHangId,
                        loaiPhatSinh: 'THU_TIEN',
                        soTienPhatSinh: -soTienThu,
                        congNoTruoc,
                        congNoSau,
                        phieuThuId: phieuThu._id,
                        ghiChu: ghiChuLichSu,
                    },
                ],
                { session },
            );
            await session.commitTransaction();
            session.endSession();
            res.status(201).json({
                success: true,
                message: 'Thu tiền thành công',
                data: phieuThu,
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
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
