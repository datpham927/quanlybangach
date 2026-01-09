function taoGhiChuThuTien({ soTienThu, congNoTruoc, ghiChu }) {
    let noiDung = `Thu tiền ${soTienThu.toLocaleString()}đ`;

    if (congNoTruoc > 0) {
        noiDung += ` | Công nợ trước: ${congNoTruoc.toLocaleString()}đ`;
        const congNoSau = soTienThu >= congNoTruoc ? 0 : congNoTruoc - soTienThu;
        noiDung += ` → sau: ${congNoSau.toLocaleString()}đ`;
    }

    if (ghiChu) {
        noiDung += ` | Ghi chú: ${ghiChu}`;
    }

    return noiDung;
}

module.exports = { taoGhiChuThuTien };
