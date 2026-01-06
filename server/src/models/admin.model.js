'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const AdminSchema = new Schema(
    {
        tenDangNhap: { type: String, required: true, unique: true },
        matKhau: { type: String, required: true },
        hoTen: String,
        trangThai: {
            type: String,
            enum: ['HOAT_DONG', 'KHOA'],
            default: 'HOAT_DONG',
        },
    },
    {
        timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
    },
);

module.exports = mongoose.model('Admin', AdminSchema);
