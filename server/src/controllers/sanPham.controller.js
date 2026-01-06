'use strict';

const SanPham = require('../models/sanPham.model');

class SanPhamController {
    static async danhSach(req, res) {
        const data = await SanPham.find().populate('nhaMayId');
        res.json({ success: true, data });
    }

    static async tao(req, res) {
        const sp = await SanPham.create(req.body);
        res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công', data: sp });
    }

    static async capNhat(req, res) {
        const sp = await SanPham.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!sp) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }
        res.json({ success: true, message: 'Cập nhật sản phẩm thành công', data: sp });
    }

    static async hienThi(req, res) {
        const sp = await SanPham.findByIdAndUpdate(req.params.id, { hienThi: req.body.hienThi }, { new: true });
        res.json({ success: true, message: 'Cập nhật trạng thái hiển thị thành công', data: sp });
    }
}

module.exports = SanPhamController;
