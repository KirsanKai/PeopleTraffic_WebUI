class Mathem {
    constructor() {

    }

    toСalculateBuildArea(build) {
        const XY = build.XY[0].points;
        let s = 0;
        for (let i = 0; i < XY.length - 1; i++) {
            s += XY[i].x * XY[i + 1].y - XY[i].y * XY[i + 1].x;
        }
        s /= 2;
        s = Math.abs(s);
        return s;
    }

    toCalculateDensity(build) {
        const s = this.toСalculateBuildArea(build);
        const density = build.NumPeople / s;
        return density;
    }

    toСalculateRGB(build) {
        let R = 0;
        let B = 255;
        const s = this.toСalculateBuildArea(build);
        let val = Math.floor(build.NumPeople / s * 255 / 5);
        if (val > 255) {
            val = 255;
        }
        R += val;
        B -= val;
        return 'rgb(' + R + ',0,' + B + ')';
    }

    toCalculateMinXY(XY) {
        let minX = XY[0].x;
        let minY = XY[0].y;
        for (let i = 1; i < XY.length; i++) {
            if (minX > XY[i].x) {
                minX = XY[i].x;
            }
            if (minY > XY[i].y) {
                minY = XY[i].y;
            }
        }
        return { x: minX, y: minY };
    }

    toCalculateMaxXY(XY) {
        let maxX = XY[0].x;
        let maxY = XY[0].y;
        for (let i = 1; i < XY.length; i++) {
            if (maxX < XY[i].x) {
                maxX = XY[i].x;
            }
            if (maxY < XY[i].y) {
                maxY = XY[i].y;
            }
        }
        return { x: maxX, y: maxY };
    }

    getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Проверка на пересечение
    inPoly(x, y, xp, yp) {
        const npol = xp.length;
        let j = npol - 1;
        let c = 0;
        for (let i = 0; i < npol;i++){
            if ((((yp[i] <= y) && (y < yp[j])) || ((yp[j] <= y) && (y < yp[i]))) && (x > (xp[j] - xp[i]) * (y - yp[i]) / (yp[j] - yp[i]) + xp[i])) {
                c++;
            }
            j = i;
        }
        return c;
    }

    isIntersection(a1, a2, b1, b2) {
        const v1 = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
        const v2 = (b2.x - b1.x) * (a2.y - b1.y) - (b2.y - b1.y) * (a2.x - b1.x);
        const v3 = (a2.x - a1.x) * (b1.y - a1.y) - (a2.y - a1.y) * (b1.x - a1.x);
        const v4 = (a2.x - a1.x) * (b2.y - a1.y) - (a2.y - a1.y) * (b2.x - a1.x);
        if ((v1 * v2 < 0) && (v3 * v4 < 0)) {
            return true;
        }
        return false
    }

    getHypotenuseLength(x1, x2, y1, y2) {
        const x = x2 - x1;
        const y = y2 - y1;
        return Math.sqrt(x * x + y * y);
    }

    getCenterPoint(XY) {
        const maxXY = this.toCalculateMaxXY(XY);
        const minXY = this.toCalculateMinXY(XY);
        return { x: (maxXY.x - minXY.x) / 2 + minXY.x, y: (maxXY.y - minXY.y) / 2 + minXY.y };
    }
}