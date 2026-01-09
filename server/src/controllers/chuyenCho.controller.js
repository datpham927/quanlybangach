'use strict';

const ChuyenCho = require('../models/chuyenCho.model');

class ChuyenChoController {
    /* ======================= DANH SÁCH CHUYẾN CHỞ ======================= */
    static async danhSach(req, res) {
        try {
            const data = await ChuyenCho.find()
                .sort({ ngayChuyen: -1 });

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
