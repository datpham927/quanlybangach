'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

class AdminController {
    static async taoAdmin(req, res) {
        try {
            const { tenDangNhap, matKhau, hoTen } = req.body;

            if (!tenDangNhap || !matKhau) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên đăng nhập và mật khẩu là bắt buộc',
                });
            }

            const daTonTai = await Admin.findOne({ tenDangNhap });
            if (daTonTai) {
                return res.status(409).json({
                    success: false,
                    message: 'Tên đăng nhập đã tồn tại',
                });
            }

            const matKhauHash = await bcrypt.hash(matKhau, 10);

            const admin = await Admin.create({
                tenDangNhap,
                matKhau: matKhauHash,
                hoTen,
            });

            return res.status(201).json({
                success: true,
                message: 'Tạo tài khoản admin thành công',
                data: {
                    _id: admin._id,
                    tenDangNhap: admin.tenDangNhap,
                    hoTen: admin.hoTen,
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Không thể tạo admin, vui lòng thử lại',
            });
        }
    }

    static async dangNhap(req, res) {
        try {
            const { tenDangNhap, matKhau } = req.body;

            if (!tenDangNhap || !matKhau) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu',
                });
            }

            const admin = await Admin.findOne({ tenDangNhap });
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Sai tên đăng nhập hoặc mật khẩu',
                });
            }

            const dungMatKhau = await bcrypt.compare(matKhau, admin.matKhau);
            if (!dungMatKhau) {
                return res.status(401).json({
                    success: false,
                    message: 'Sai tên đăng nhập hoặc mật khẩu',
                });
            }

            if (admin.trangThai !== 'HOAT_DONG') {
                return res.status(403).json({
                    success: false,
                    message: 'Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên',
                });
            }

            const token = jwt.sign(
                {
                    adminId: admin._id,
                    tenDangNhap: admin.tenDangNhap,
                },
                process.env.JWT_SECRET || 'JWT_SECRET_KEY',
                { expiresIn: '1d' },
            );

            return res.json({
                success: true,
                message: 'Đăng nhập thành công',
                token,
                admin: {
                    _id: admin._id,
                    tenDangNhap: admin.tenDangNhap,
                    hoTen: admin.hoTen,
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi đăng nhập, vui lòng thử lại sau',
            });
        }
    }
}

module.exports = AdminController;
