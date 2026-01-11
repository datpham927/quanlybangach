'use strict';

const ChuyenCho = require('../models/chuyenCho.model');

class ChuyenChoController {
    /* ======================= DANH SÁCH CHUYẾN CHỞ ======================= */
    static async danhSach(req, res) {
        try {
            const { ngay } = req.query;
            const filter = {};

            if (ngay) {
                const startOfDay = new Date(ngay);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(ngay);
                endOfDay.setHours(23, 59, 59, 999);

                filter.ngayChuyen = {
                    $gte: startOfDay,
                    $lte: endOfDay,
                };
            }

            const data = await ChuyenCho.find(filter).sort({ ngayChuyen: -1 });

            return res.json({
                success: true,
                data,
            });
        } catch (error) {
            console.error('❌ Lỗi lấy danh sách chuyến chở:', error);
            return res.status(500).json({
                success: false,
                message: 'Không thể tải danh sách chuyến chở',
            });
        }
    }
}

module.exports = ChuyenChoController;
