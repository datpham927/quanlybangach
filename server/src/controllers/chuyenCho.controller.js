'use strict';

const ChuyenCho = require('../models/chuyenCho.model');

class ChuyenChoController {
    static async danhSach(req, res) {
        const data = await ChuyenCho.find().sort({ ngayChuyen: -1 });
        res.json({ success: true, data });
    }
}

module.exports = ChuyenChoController;
