'use strict';

const NhaMay = require('../models/nhaMay.model');

class NhaMayController {
    static async danhSach(req, res) {
        const data = await NhaMay.find().sort({ ngayTao: -1 });
        res.json({ success: true, data });
    }

    static async tao(req, res) {
        const nhaMay = await NhaMay.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Tạo nhà máy thành công',
            data: nhaMay,
        });
    }

    static async capNhat(req, res) {
        const nhaMay = await NhaMay.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!nhaMay) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhà máy' });
        }
        res.json({ success: true, message: 'Cập nhật nhà máy thành công', data: nhaMay });
    }

    static async xoa(req, res) {
        await NhaMay.findByIdAndUpdate(req.params.id, { dangHoatDong: false });
        res.json({ success: true, message: 'Đã ngừng hợp tác nhà máy' });
    }
    static async ngungHopTac(req, res) {
        const nhaMay = await NhaMay.findByIdAndUpdate(req.params.id, { dangHoatDong: false }, { new: true });

        if (!nhaMay) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhà máy',
            });
        }

        res.json({
            success: true,
            message: 'Đã ngừng hợp tác nhà máy',
            data: nhaMay,
        });
    }
}

module.exports = NhaMayController;
