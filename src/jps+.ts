import { OpenNode } from "./tool/common";
import { Heap } from "./tool/heap";
class Gird {
    value: number;
    mark: number;
}
class Point {
    x: number;
    y: number;
}
enum direction {
    west,
    east,
    south,
    north,
    northeast,
    southwest,
    northwest,
    southeast,
}
class PrePoint {
    value: number;
    steps = [0, 0, 0, 0, 0, 0, 0, 0]
}

export class JPSs {
    private _width: number;
    private _height: number;
    private _map: Array<Array<Gird>>;
    private _openList: Heap<OpenNode>;
    private _openSet: Set<number>;
    private _closeId: number;
    private _preMap: Array<Array<PrePoint>>;
    private _direction: any;
    constructor(width: number, height: number, map: Buffer) {
        this._width = width;
        this._height = height;
        this._map = new Array<Array<Gird>>();
        this._preMap = new Array<Array<PrePoint>>();
        let offset = 0;
        for (let y = 0; y < height; y++) {
            this._map[y] = new Array<Gird>();
            for (let x = 0; x < width; x++) {
                let v = map.readUInt8(offset++);
                this._map[y][x] = { value: v, mark: 0 };
            }
        }
        this._openList = new Heap((l: OpenNode, r: OpenNode): boolean => {
            return l.value < r.value;
        })
        this._closeId = 0;
        this._openSet = new Set<number>();
        this._direction = [[-1, 0], [1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]];
        this.preProcess(map);
    }

    protected preProcess(map: Buffer) {
        let offset = 0;
        for (let y = 0; y < this._height; y++) {
            this._preMap[y] = new Array<PrePoint>();
            for (let x = 0; x < this._width; x++) {
                let preData = new PrePoint();
                preData.value = map.readUInt8(offset++);
                this._preMap[y][x] = preData;
            }
        }
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                let p = new Point(); p.x = x; p.y = y;
                for (let i = 0; i < this._direction.length; i++) {
                    this._preMap[y][x].steps[i] = this.getBarry(p, this._direction[i][0], this._direction[i][1]);
                    if (i < 4) {
                        this.preStraightPt(i, x, y, true);
                    } else {
                        this.preOhterPt(i, x, y);
                    }
                }
                console.log("x:" + x + "," + y + ":" + this._preMap[y][x].steps);
            }
        }
    }
    protected preOhterPt(d: number, sx: number, sy: number) {
        let x = sx;
        let y = sy;
        let offset = 0;
        let dx = this._direction[d][0];
        let dy = this._direction[d][1];
        while (true) {
            offset++;
            x += dx;
            y += dy;
            if (this.isBarry(x, y)) {
                return;
            }
            if (this.preStraightPt(d, x, y, false)) {
                if (Math.abs(this._preMap[sy][sx].steps[d]) > offset) {
                    this._preMap[sy][sx].steps[d] = offset;
                }
                break;
            }
        }
    }
    protected preStraightPt(d: number, sx: number, sy: number, push: boolean) {
        let find = false;
        let dx = this._direction[d][0];
        let dy = this._direction[d][1];
        if (dx == -1 || dx == 1) {
            if (!this.isBarry(sx + dx, sy)) {
                let p = new Point(); p.x = sx; p.y = sy;
                let flag = this.findLevelPt(p, dx);
                //console.log("dx " + dx + " " + sx + "," + sy)
                if (flag) {
                    //console.log(sx + "," + sy + ":" + p.x + "," + p.y + " push dx " + push)
                    if (!push) {
                        return flag;
                    }
                    if (this._preMap[sy][sx].steps[d] > Math.abs(p.x - sx)) {
                        this._preMap[sy][sx].steps[d] = Math.abs(p.x - sx);
                    }
                    find = flag || find;
                }
            }
        }
        if (dy == -1 || dy == 1) {
            if (!this.isBarry(sx, sy + dy)) {
                let p = new Point(); p.x = sx; p.y = sy;
                let flag = this.findVerPt(p, dy);
                //console.log("dy " + dy + " " + sx + "," + sy)
                if (flag) {
                    //console.log(sx + "," + sy + ":" + p.x + "," + p.y + " push dy " + push)
                    if (!push) {
                        return flag;
                    }
                    find = flag || find;
                    if (this._preMap[sy][sx].steps[d] > Math.abs(p.y - sy)) {
                        this._preMap[sy][sx].steps[d] = Math.abs(p.y - sy);
                    }
                }
            }

        }
        return find;
    }

    protected info(node: OpenNode, tpx: number, tpy: number, coast: number, pre: OpenNode) {
        let g = pre.g + coast;
        let rx = Math.abs(tpx - node.px);
        let ry = Math.abs(tpy - node.py);
        let h = Math.max(rx, ry) * 14 - Math.abs(rx - ry) * 4;
        node.info(pre, g, h);
        return node;
    }

    public open(spx: number, spy: number, tpx: number, tpy: number): OpenNode {
        this._closeId = (this._closeId + 1) % 0xffffffff;
        let node = new OpenNode(spx, spy);
        this._openList.push(node);
        console.log("add:" + spx + "," + spx);
        this._openSet.add(spy * this._width + spx);
        let pre: OpenNode = null;
        while (!this._openList.isEmtry()) {
            let node = this._openList.pop();
            console.log("pop:" + node.px + "," + node.py);
            this._openSet.delete(node.py * this._width + node.px);
            if (node.px == tpx && node.py == tpy) {
                return node;
            }
            this._map[node.py][node.px].mark = this._closeId;
            if (!pre) {
                for (let i = 0; i < this._direction.length; i++) {
                    if (i < 4) {
                        this.findStraightPt(this._direction[i][0], this._direction[i][1], node, true, tpx, tpy);
                    } else {
                        this.findOtherPt(this._direction[i][0], this._direction[i][1], node, tpx, tpy);
                    }
                }
            } else {
                let dx = node.px - pre.px;
                let dy = node.py - pre.py;
                dx = dx > 0 ? 1 : dx == 0 ? 0 : -1;
                dy = dy > 0 ? 1 : dy == 0 ? 0 : -1;
                if (dx != 0 && dy != 0) {
                    this.findOtherPt(dx, dy, node, tpx, tpy);
                    this.findStraightPt(dx, 0, node, true, tpx, tpy);
                    this.findStraightPt(0, dy, node, true, tpx, tpy);
                }
                if (dx == 0) {
                    let dx = 1;
                    let y = node.py - dy;
                    if (this.isBarry(node.px + dx, y)) {
                        this.findStraightPt(dx, 0, node, true, tpx, tpy);
                        this.findOtherPt(dx, dy, node, tpx, tpy);
                    }
                    if (this.isBarry(node.px - dx, y)) {
                        this.findStraightPt(-dx, 0, node, true, tpx, tpy);
                        this.findOtherPt(-dx, dy, node, tpx, tpy);
                    }
                    this.findStraightPt(0, dy, node, true, tpx, tpy);
                }
                if (dy == 0) {
                    let dy = 1;
                    let x = node.px - dx;
                    if (this.isBarry(x, node.py + dy)) {
                        this.findStraightPt(0, dy, node, true, tpx, tpy);
                        this.findOtherPt(dx, dy, node, tpx, tpy);
                    }
                    if (this.isBarry(x, node.py - dy)) {
                        this.findStraightPt(0, -dy, node, true, tpx, tpy);
                        this.findOtherPt(dx, -dy, node, tpx, tpy);
                    }
                    this.findStraightPt(dx, 0, node, true, tpx, tpy);
                }
            }
            pre = node;
        }
        return null;
    }

    protected findOtherPt(dx: number, dy: number, node: OpenNode, tpx: number, tpy: number, d?: number) {
        d = d || 0;
        for (let i = 0; i < this._direction.length; i++) {
            if (dx == this._direction[i][0] && dy == this._direction[i][1]) {
                d = i;
                break;
            }
        }
        let x = node.px + this._preMap[node.py][node.px].steps[d] * dx;
        let y = node.py + this._preMap[node.py][node.px].steps[d] * dy;
        let dx1 = tpx - node.px > 0 ? 1 : tpx - node.px == 0 ? 0 : -1;
        let dy1 = tpy - node.py > 0 ? 1 : tpy - node.py == 0 ? 0 : -1;
        if (dx1 == dx && dy1 == dy) {
            let step = Math.min(Math.abs(tpx - node.px), Math.abs(tpy - node.py));
            if (step < this._preMap[node.py][node.px].steps[d]) {
                let c = step * 14;
                let x = node.px + dx * step; let y = node.py + dy * step;
                this.addOpen(x, y, tpx, tpy, node, c);
            }
        }
        //console.log("findOtherPt "+x+","+y)
        if (!this.isBarry(x, y)) {
            let p = new Point();
            p.x = x, p.y = x;
            let c = Math.abs(p.x - node.px) * 10;
            this.addOpen(p.x, p.y, tpx, tpy, node, c);
        }
    }

    protected isBarry(x: number, y: number): boolean {
        if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
            return true;
        }
        if (this._map[y][x].value == 1) {
            return true;
        }
        return false;
    }

    protected findStraightPt(dx: number, dy: number, node: OpenNode, push: boolean, tpx: number, tpy: number): boolean {
        let d = 0;
        for (let i = 0; i < this._direction.length; i++) {
            if (dx == this._direction[i][0] && dy == this._direction[i][1]) {
                d = i;
                break;
            }
        }
        let find = false;
        if (node.px == tpx || node.py == tpy) {
            let dx1 = tpx - node.px > 0 ? 1 : tpx - node.px == 0 ? 0 : -1;
            let dy1 = tpy - node.py > 0 ? 1 : tpy - node.py == 0 ? 0 : -1;
            if (dx == dx1 && dy == dy1) {
                let step = Math.abs(tpy - node.py + tpx - node.px);
                if (step < this._preMap[node.py][node.px].steps[d]) {
                    let c = step * 10;
                    this.addOpen(tpx, tpy, tpx, tpy, node, c);
                    return true;
                }
            }
        }
        
        if (dx == -1 || dx == 1) {
            let x = node.px + this._preMap[node.py][node.px].steps[d] * dx;
            //console.log("findStraightPt "+x+","+node.py)
            if (!this.isBarry(x, node.py)) {
                let p = new Point();
                p.x = x, p.y = node.py;
                let c = Math.abs(p.x - node.px) * 10;
                this.addOpen(p.x, p.y, tpx, tpy, node, c);
            }
        }
        if (dy == -1 || dy == 1) {
            let y = node.py + this._preMap[node.py][node.px].steps[d] * dy;
            //console.log("findStraightPt "+node.px+","+y)
            if (!this.isBarry(node.px, y)) {
                let p = new Point();
                p.x = node.px; p.y = y;
                let c = Math.abs(p.y - node.py) * 10;
                this.addOpen(p.x, p.y, tpx, tpy, node, c);
            }

        }
        return find;
    }

    protected addOpen(x: number, y: number, tpx: number, tpy: number, pre: OpenNode, coast: number) {
        if (this._map[y][x].mark != this._closeId && !this._openSet.has(y * this._width + x)) {
            let nextNode = new OpenNode(x, y);
            this.info(nextNode, tpx, tpy, coast, pre);
            this._openList.push(nextNode);
            console.log("add:" + nextNode.px + "," + nextNode.py);
            this._openSet.add(y * this._width + x);
            return nextNode;
        }
        return null;
    }

    protected hasBarry(p: Point, x: number, y: number): boolean {
        if (p.y == y) {
            let min = x; let max = p.x;
            if (p.x < x) {
                min = p.x; max = x;
            }
            for (let i = min + 1; i < max && i < this._width; i++) {
                if (this._map[y][i].value == 1) {
                    p.x = i;
                    return true;
                }
            }
        } else if (p.x == x) {
            let min = y; let max = p.y;
            if (p.y < y) {
                min = p.y; max = y;
            }
            for (let i = min + 1; i < max && i < this._height; i++) {
                if (this._map[i][x].value == 1) {
                    p.y = i;
                    return true;
                }
            }
        }
        return false;
    }

    protected getBarry(p: Point, dx: number, dy: number): number {
        if (dx != 0 && dy == 0) {
            for (let i = p.x; i >= 0 && i < this._width; i = i + dx) {
                if (this._map[p.y][i].value == 1) {
                    return Math.abs(i - p.x);
                }
            }
            return dx < 0 ? Math.abs(-1 - p.x) : Math.abs(this._width - p.x);
        }
        if (dy != 0 && dx == 0) {
            for (let i = p.y; i >= 0 && i < this._height; i = i + dy) {
                if (this._map[i][p.x].value == 1) {
                    return Math.abs(i - p.y);
                }
            }
            return dy < 0 ? Math.abs(-1 - p.y) : Math.abs(this._height - p.y);
        }
        if (dx != 0 && dy != 0) {
            let offset = 0;
            for (let i = p.x, j = p.y; i >= 0 && i < this._width && j >= 0 && j < this._height; i = i + dx, j = j + dy) {
                offset++;
                if (this._map[j][i].value == 1) {
                    return offset - 1;
                }
            }
            return offset;
        }
        return 1;
    }

    protected findLevelPt(p: Point, dx: number): boolean {
        let v = p.x;
        for (let i = p.x; i + dx < this._width && i + dx >= 0; i += dx) {
            if (this._map[p.y][i + dx].value == 1) {
                break;
            }
            if (p.y - 1 >= 0) {
                if (this._map[p.y - 1][i].value == 1 && this._map[p.y - 1][i + dx].value == 0) {
                    v = i + dx;
                    break;
                }
            }
            if (p.y + 1 < this._height) {
                if (this._map[p.y + 1][i].value == 1 && this._map[p.y + 1][i + dx].value == 0) {
                    v = i + dx;
                    break;
                }
            }
        }
        if (v != p.x) {
            p.x = v;
            return true;
        }
        return false;
    }

    public findVerPt(p: Point, dy: number): boolean {
        let v = p.y;
        for (let i = p.y; i + dy < this._height && i + dy >= 0; i += dy) {
            if (this._map[i + dy][p.x].value == 1) {
                break;
            }
            if (p.x - 1 >= 0) {
                if (this._map[i][p.x - 1].value == 1 && this._map[i + dy][p.x - 1].value == 0) {
                    v = i + dy;
                    break;
                }
            }
            if (p.x + 1 < this._width) {
                if (this._map[i][p.x + 1].value == 1 && this._map[i + dy][p.x + 1].value == 0) {
                    v = i + dy;
                    break;
                }
            }
        }
        if (v != p.y) {
            p.y = v;
            return true;
        }
        return false;
    }

    public find(spx: number, spy: number, tpx: number, tpy: number) {
        this._openList.clear();
        this._openSet.clear();
        let road = this.open(spx, spy, tpx, tpy);
        console.log("road:" + road)
        for (let r = road; r != null; r = r.pre) {
            this._map[r.py][r.px].value = 2;
        }
        this.print();
    }

    public print() {
        for (let i = 0; i < this._map.length; i++) {
            let str = '';
            for (let j = 0; j < this._map[i].length; j++) {
                str += this._map[i][j].value;
            }
            console.log(str);
        }
    }

}  