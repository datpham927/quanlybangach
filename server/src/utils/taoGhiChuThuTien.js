function taoGhiChuThuTien({ soTienThu, congNoTruoc, ghiChu }) {
    let ghiChuHeThong = '';
    if (soTienThu < congNoTruoc) {
        ghiChuHeThong = 'Thu tiền (trả một phần công nợ)';
    } else if (soTienThu === congNoTruoc) {
        ghiChuHeThong = 'Thu tiền (tất toán công nợ)';
    } else {
        ghiChuHeThong = 'Thu tiền (khách trả dư / trả trước)';
    }
    if (ghiChu && ghiChu.trim()) {
        return `${ghiChuHeThong} - ${ghiChu}`;
    }
    return ghiChuHeThong;
}
module.exports = taoGhiChuThuTien;
