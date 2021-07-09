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

export class JPS {
    private _width: number;
    private _height: number;
    private _map: Array<Array<Gird>>;
    private _openList: Heap<OpenNode>;
    private _openSet: Set<number>;
    private _closeId: number;
    private _preMap: Array<Array<PrePoint>>;
    private _direction = [[-1, 0], [1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]];
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
        // for (let i = 0; i < height; i++) {
        //     this._otherMap[i] = new Array<number>();
        //     for (let j = 0; j < width; j++) {
        //         this._otherMap[i][j] = map.readUInt8(offset++);
        //     }
        // }
        this._openList = new Heap((l: OpenNode, r: OpenNode): boolean => {
            return l.value < r.value;
        })
        this._closeId = 0;
        this._openSet = new Set<number>();
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

                    }
                }
            }
        }
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
                console.log("level:" + node.px + "," + node.py)
                this.findStraightPt(1, 1, node, true, tpx, tpy);
                this.findStraightPt(-1, -1, node, true, tpx, tpy);
                this.findOtherPt(1, 1, node, tpx, tpy);
                this.findOtherPt(1, -1, node, tpx, tpy);
                this.findOtherPt(-1, 1, node, tpx, tpy);
                this.findOtherPt(-1, -1, node, tpx, tpy);
            } else {
                let dx = node.px - pre.px;
                let dy = node.py - pre.py;
                dx = dx > 0 ? 1 : dx == 0 ? 0 : -1;
                dy = dy > 0 ? 1 : dy == 0 ? 0 : -1;
                if (dx != 0 && dy != 0) {
                    this.findOtherPt(dx, dy, node, tpx, tpy);
                    this.findStraightPt(dx, dy, node, true, tpx, tpy);
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
    protected findOtherPt(dx: number, dy: number, node: OpenNode, tpx: number, tpy: number) {
        let x = node.px;
        let y = node.py;
        let offset = 0;
        while (true) {
            offset++;
            x += dx;
            y += dy;
            if (x == tpx && y == tpy) {
                this.addOpen(x, y, tpx, tpy, node, 14 * offset);
                return;
            }
            if (this.isBarry(x, y)) {
                return;
            }
            let temp = new OpenNode(x, y);
            console.log("other" + x + "," + y + "," + dx + "," + dy);
            if (this.findStraightPt(dx, dy, temp, false, tpx, tpy)) {
                this.info(temp, tpx, tpy, 14 * offset, node);
                this._openList.push(temp);
                this._openSet.add(y * this._width + x);
                console.log("add:" + x + "," + y);
                //this.addOpen(temp.px, temp.py, tpx, tpy, node, 14 * offset)
                break;
            }
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
        console.log("staright:" + node.px + "," + node.py + "," + tpx + "," + tpy);
        if (node.px == tpx || node.py == tpy) {
            let p = new Point(); p.x = node.px; p.y = node.py;
            if (!this.hasBarry(p, tpx, tpy)) {
                if (push) {
                    let c = Math.abs(tpx - node.px + tpy - node.py) * 10;
                    this.addOpen(tpx, tpy, tpx, tpy, node, c);
                }
                return true;
            }
        }
        let find = false;
        if (dx == -1 || dx == 1) {
            if (!this.isBarry(node.px + dx, node.py)) {
                let p = new Point(); let flag = false;
                p.x = node.px; p.y = node.py;
                flag = this.findLevelPt(p, dx);
                if (flag) {
                    if (!push) {
                        return flag;
                    }
                    find = flag || find;
                    let c = Math.abs(p.x - node.px) * 10;
                    this.addOpen(p.x, p.y, tpx, tpy, node, c);
                }
            }
        }
        if (dy == -1 || dy == 1) {
            if (!this.isBarry(node.px, node.py + dy)) {
                let p = new Point(); let flag = false;
                p.x = node.px; p.y = node.py;
                flag = this.findVerPt(p, dy);
                if (flag) {
                    if (!push) {
                        return flag;
                    }
                    find = flag || find;
                    let c = Math.abs(p.y - node.py) * 10;
                    this.addOpen(p.x, p.y, tpx, tpy, node, c);
                }
            }
        }
        // if (dx == 1) {
        //     if (!this.isBarry(node.px + dx, node.py)) {
        //         let p = new Point(); let flag = false;
        //         for (let x = node.px; x < this._width;) {
        //             p.x = x; p.y = node.py;
        //             console.log("level start:" + p.x + "," + node.py)
        //             flag = this.findLevelPt(p);
        //             if (this.hasBarry(p, x, node.py)) {
        //                 return find;
        //             }
        //             if (flag) {
        //                 if (!push) {
        //                     return flag;
        //                 }
        //                 find = flag || find;
        //                 console.log("level end:" + p.x + "," + p.y + " push:" + push);
        //                 console.log("hasBarry:" + false)
        //                 let c = Math.abs(p.x - node.px) * 10;
        //                 this.addOpen(p.x, p.y, tpx, tpy, node, c);
        //                 break;
        //             }
        //             x = x + 7;
        //             //x = x > this._width ? (this._width - 1 - 8) : x;
        //         }
        //     }

        // }

        // if (dy == 1) {
        //     if (!this.isBarry(node.px, node.py + dy)) {
        //         let p = new Point(); let flag = false;
        //         for (let y = node.py; y < this._height;) {
        //             //y = y > this._height ? (this._height - 1 - 8) : y;
        //             p.x = node.px; p.y = y;
        //             flag = this.findVerPt(tpx, tpy, node, p, push);
        //             if (this.hasBarry(p, node.px, y)) {
        //                 return find;
        //             }
        //             if (flag) {
        //                 if (!push) {
        //                     return flag;
        //                 }
        //                 find = flag || find;
        //                 let c = Math.abs(p.y - node.py) * 10;
        //                 this.addOpen(p.x, p.y, tpx, tpy, node, c);
        //                 break;
        //             }
        //             y = y + 7;
        //         }
        //     }

        // }
        return find;
    }

    protected addOpen(x: number, y: number, tpx: number, tpy: number, pre: OpenNode, coast: number) {
        if (this._map[y][x].mark != this._closeId && !this._openSet.has(y * this._width + x)) {
            let nextNode = new OpenNode(x, y);
            this.info(nextNode, tpx, tpy, coast, pre);
            this._openList.push(nextNode);
            this._openSet.add(y * this._width + x);
            console.log("add:" + x + "," + y);
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
                    return i - p.x;
                }
            }
        }
        if (dy != 0 && dx == 0) {
            for (let i = p.y; i >= 0 && i < this._height; i = i + dy) {
                if (this._map[i][p.x].value == 1) {
                    return i - p.y;
                }
            }
        }
        if (dx != 0 && dy != 0) {
            let offset = 0
            for (let i = p.x, j = p.y; i >= 0 && i < this._width && j >= 0 && j < this._height; i = i + dx, j = j + dy) {
                offset++;
                if (this._map[j][i].value == 1) {
                    return offset;
                }
            }
        }
        return 0;
    }

    protected xBit(x: number, y: number): number {
        let v = this._map[y][x].value;
        for (let i = x + 1; i < x + 8 && i < this._width; i++) {
            v = (v << 1) | this._map[y][i].value;
        }
        console.log("xbit:" + x + "," + y + ": " + v)
        return v;
    }

    protected yBit(x: number, y: number) {
        let v = this._map[y][x].value;
        for (let i = y + 1; i < y + 8 && i < this._height; i++) {
            v = (v << 1) | this._map[i][x].value;
        }
        console.log("ybit:" + x + "," + y + ": " + v)
        return v;
    }

    // protected findLevelPt(p: Point): boolean {
    //     let v = 0x00;
    //     if (p.y - 1 >= 0) {
    //         v = this.xBit(p.x, p.y - 1);
    //         v = (v >> 1) & (v ^ 0xFF);
    //     }
    //     if (p.y + 1 < this._height) {
    //         let v1 = this.xBit(p.x, p.y + 1);
    //         v1 = (v1 >> 1) & (v1 ^ 0xFF);
    //         v |= v1;
    //     }
    //     if (v > 0) {
    //         let l = (p.x + 8) >= this._width ? (this._width - 1 - p.x) : 8;
    //         let rx = l - Math.floor(Math.log2(v));
    //         p.x += rx;
    //         return true;
    //     }
    //     return false;
    // }

    // public findVerPt(tpx: number, tpy: number, pre: OpenNode, p: Point, push: boolean): boolean {
    //     let v = 0x00;
    //     if (p.x - 1 >= 0) {
    //         v = this.yBit(p.x - 1, p.y);
    //         v = (v >> 1) & (v ^ 0xFF);
    //     }
    //     if (p.x + 1 < this._width) {
    //         let v1 = this.yBit(p.x + 1, p.y);
    //         v1 = (v1 >> 1) & (v1 ^ 0xFF);
    //         v |= v1;
    //     }
    //     if (v > 0) {
    //         let l = (p.y + 8) >= this._height ? (this._height - 1 - p.y) : 8;
    //         let ry = l - Math.floor(Math.log2(v));
    //         p.y += ry;
    //         return true;
    //     }
    //     return false;
    // }
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