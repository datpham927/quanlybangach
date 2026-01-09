'use strict';

function getDateRange(range) {
    const now = new Date();

    let startCurrent, endCurrent, startPrev, endPrev;

    switch (range) {
        /* ================= HÔM NAY ↔ HÔM QUA ================= */
        case 'today': {
            // Hôm nay: 00:00 → hiện tại
            startCurrent = new Date(now);
            startCurrent.setHours(0, 0, 0, 0);
            endCurrent = now;

            // Hôm qua: 00:00 → 23:59:59
            startPrev = new Date(startCurrent);
            startPrev.setDate(startPrev.getDate() - 1);

            endPrev = new Date(startCurrent);
            endPrev.setMilliseconds(-1);
            break;
        }

        /* ================= 7 NGÀY ↔ 7 NGÀY TRƯỚC ================= */
        case '7d': {
            // 7 ngày gần nhất
            startCurrent = new Date(now);
            startCurrent.setDate(startCurrent.getDate() - 7);
            endCurrent = now;

            // 7 ngày trước đó
            startPrev = new Date(startCurrent);
            startPrev.setDate(startPrev.getDate() - 7);

            endPrev = new Date(startCurrent);
            endPrev.setMilliseconds(-1);
            break;
        }

        /* ================= NĂM NÀY ↔ NĂM TRƯỚC ================= */
        case '1y': {
            // Năm hiện tại
            startCurrent = new Date(now.getFullYear(), 0, 1);
            endCurrent = now;

            // Năm trước
            startPrev = new Date(now.getFullYear() - 1, 0, 1);
            endPrev = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
            break;
        }

        /* ================= THÁNG NÀY ↔ THÁNG TRƯỚC ================= */
        case '1m':
        default: {
            // Tháng hiện tại
            startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
            endCurrent = now;

            // Tháng trước
            startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endPrev = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
            break;
        }
    }

    return { startCurrent, endCurrent, startPrev, endPrev };
}

module.exports = { getDateRange };
