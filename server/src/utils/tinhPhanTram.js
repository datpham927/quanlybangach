function tinhPhanTram(hienTai, thangTruoc) {
    if (thangTruoc === 0) {
        return hienTai > 0 ? 100 : 0;
    }
    return Math.round(((hienTai - thangTruoc) / thangTruoc) * 100);
}
module.exports = tinhPhanTram;
