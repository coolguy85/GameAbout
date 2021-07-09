import { Heap} from "./tool/heap";
import { MyMap, OpenNode } from "./tool/common";



export class AStar {
    private _width: number;
    private _height: number;
    private _map: Array<Array<string>>;
    private _openList: Heap<OpenNode>;
    private _closeList: Set<number>;
    private _openMap: Map<number, OpenNode>;
    private depth: number = 0;
    private direction = [[-1, 0], [1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]];
    constructor(width: number, height: number, map: Array<Array<string>>) {
        this._width = width;
        this._width = height;
        this._map = map;
        this._openList = new Heap<OpenNode>((l: OpenNode, r: OpenNode): boolean => {
            return l.value < r.value;
        })
        this._closeList = new Set<number>();
        this._openMap = new Map<number, OpenNode>();
    }

    public open(spx: number, spy: number, tpx: number, tpy: number): OpenNode {
        let start = new OpenNode(spx, spy);
        this._openList.push(start);
        this._openMap.set(start.value, start);
        while (!this._openList.isEmtry()) {
            let pre = this._openList.pop();
            let closeId = pre.py * this._map.length + pre.px;
            this._openMap.delete(closeId);
            this._closeList.add(closeId);
            if (this.depth == 1000) {
                return null;
            }
            this.depth++;
            if (pre.px == tpx && pre.py == tpy) {
                return pre;
            }
            for (let i = 0; i < this.direction.length; i++) {
                let px = pre.px + this.direction[i][0];
                let py = pre.py + this.direction[i][1];
                if (px < 0 || py < 0 || px >= this._width || py >= this._height || this._map[px][py] == '*') {
                    continue;
                }
                let id = py * this._map.length + px;
                if (this._closeList.has(id)) {
                    continue;
                }
                let g = i < 4 ? 10 : 14;
                g += pre.g;
                let rx = Math.abs(tpx - px);
                let ry = Math.abs(tpy - py);
                let h = Math.max(rx, ry) * 14 - Math.abs(rx - ry) * 4;
                if (this._openMap.has(id)) {
                    let cur = this._openMap.get(id);
                    if (cur.value >= g + h) {
                        this._openList.remove(cur);
                        cur.info(pre, g, h);
                        this._openList.push(cur);
                    }
                    continue;
                }
                let node = new OpenNode(px, py);
                node.info(pre, g, h);
                this._openList.push(node);
                this._openMap.set(id, node);
            }
        }
        return null;
    }

    public find(spx: number, spy: number, tpx: number, tpy: number) {
        let road = this.open(spx, spy, tpx, tpy);
        if (!road) {
            console.log("未找到！");
            return;
        }
        for (let r = road; r = r.pre; r.pre != null) {
            this._map[r.px][r.py] = '0';
        }
        MyMap.print(this._map);
    }

}