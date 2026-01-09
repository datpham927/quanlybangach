'use strict';

const PhieuThu = require('../models/phieuThu.model');
const HoaDon = require('../models/hoaDon.model');
const KhachHang = require('../models/khachHang.model');
const phieuThuModel = require('../models/phieuThu.model');
const { default: mongoose } = require('mongoose');
const { taoGhiChuThuTien } = require('../utils/taoGhiChuThuTien');
const lichSuCongNoModel = require('../models/lichSuCongNo.model');

class PhieuThuController {
    static async tao(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { maPhieuThu, khachHangId, ngayThu, soTienThu, ghiChu } = req.body;

            if (!maPhieuThu || !khachHangId || !ngayThu || !soTienThu || soTienThu <= 0) {
                throw new Error('Thiếu hoặc sai thông tin phiếu thu');
            }

            /* =======================
           1️⃣ LẤY KHÁCH HÀNG
        ======================= */
            const khachHang = await KhachHang.findById(khachHangId).session(session);
            if (!khachHang) throw new Error('Không tìm thấy khách hàng');

            const congNoTruoc = khachHang.congNoHienTai || 0;

            if (soTienThu > congNoTruoc) {
                throw new Error('Số tiền thu vượt quá công nợ khách hàng');
            }

            /* =======================
           2️⃣ LẤY HÓA ĐƠN CÒN NỢ (FIFO)
        ======================= */
            const hoaDons = await HoaDon.find({
                khachHangId,
                conNo: { $gt: 0 },
                trangThai: { $ne: 'HUY' },
            })
                .sort({ ngayGiao: 1 }) // 🔥 CŨ → MỚI
                .session(session);

            if (!hoaDons.length) {
                throw new Error('Khách hàng không có hóa đơn cần thu');
            }

            /* =======================
           3️⃣ TẠO PHIẾU THU (CHƯA PHÂN BỔ)
        ======================= */
            const [phieuThu] = await phieuThuModel.create(
                [
                    {
                        maPhieuThu,
                        khachHangId,
                        ngayThu,
                        soTienThu,
                        ghiChu,
                    },
                ],
                { session },
            );

            /* =======================
           4️⃣ TỰ ĐỘNG PHÂN BỔ TIỀN
        ======================= */
            let soTienConLai = soTienThu;

            for (const hoaDon of hoaDons) {
                if (soTienConLai <= 0) break;

                const conNoHoaDon = hoaDon.conNo;
                const soTienTra = Math.min(soTienConLai, conNoHoaDon);

                const daThuMoi = hoaDon.daThu + soTienTra;
                const conNoMoi = hoaDon.tongTienHoaDon - daThuMoi;

                let trangThai = 'CHUA_THU';
                if (daThuMoi > 0 && conNoMoi > 0) trangThai = 'THU_MOT_PHAN';
                if (conNoMoi === 0) trangThai = 'DA_THU';

                await HoaDon.findByIdAndUpdate(
                    hoaDon._id,
                    {
                        daThu: daThuMoi,
                        conNo: conNoMoi,
                        trangThai,
                    },
                    { session },
                );

                // Lưu phân bổ vào phiếu thu (để xem lại)
                await phieuThuModel.findByIdAndUpdate(
                    phieuThu._id,
                    {
                        $push: {
                            phanBoHoaDons: {
                                hoaDonId: hoaDon._id,
                                maHoaDon: hoaDon.maHoaDon,
                                soTienThu: soTienTra,
                                conNoSau: conNoMoi,
                            },
                        },
                    },
                    { session },
                );

                soTienConLai -= soTienTra;
            }

            /* =======================
           5️⃣ CẬP NHẬT CÔNG NỢ KH
        ======================= */
            const congNoSau = congNoTruoc - soTienThu;

            await KhachHang.findByIdAndUpdate(khachHangId, { congNoHienTai: congNoSau }, { session });

            /* =======================
           6️⃣ GHI LỊCH SỬ CÔNG NỢ
        ======================= */
            await lichSuCongNoModel.create(
                [
                    {
                        khachHangId,
                        loaiPhatSinh: 'THU_TIEN',
                        soTienPhatSinh: -soTienThu,
                        congNoTruoc,
                        congNoSau,
                        phieuThuId: phieuThu._id,
                        ghiChu: `Thu tiền ${soTienThu.toLocaleString()}đ | Công nợ: ${congNoTruoc.toLocaleString()} → ${congNoSau.toLocaleString()}`,
                    },
                ],
                { session },
            );
            await session.commitTransaction();
            session.endSession();
            return res.status(201).json({
                success: true,
                message: 'Thu tiền thành công',
                data: phieuThu,
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    static async danhSach(req, res) {
        const { maKhachHang, khachHangId, maPhieuThu, tuNgay, denNgay } = req.query;

        const filter = {};

        /* =======================
     LỌC MÃ PHIẾU THU
  ======================= */
        if (maPhieuThu) {
            filter.maPhieuThu = { $regex: maPhieuThu, $options: 'i' };
        }

        /* =======================
     LỌC KHÁCH HÀNG
  ======================= */
        if (khachHangId) {
            filter.khachHangId = khachHangId;
        }

        /* =======================
     ⭐ LỌC THEO NGÀY THU
  ======================= */
        if (tuNgay || denNgay) {
            filter.ngayThu = {};

            if (tuNgay) {
                filter.ngayThu.$gte = new Date(`${tuNgay}T00:00:00.000Z`);
            }

            if (denNgay) {
                filter.ngayThu.$lte = new Date(`${denNgay}T23:59:59.999Z`);
            }
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
        ghiChu
      `,
            })

            // 📌 mới nhất lên trước
            .sort({ ngayTao: -1 });

        /* =======================
     LỌC THEO MÃ KHÁCH HÀNG
  ======================= */
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
