import { HeapElement } from "./heap";

export class OpenNode implements HeapElement {
    value: number = 0;
    pointer: number = 0;
    pre: OpenNode = null;
    px: number = 0;
    py: number = 0;
    f: number = 0;
    g: number = 0;
    h: number = 0;

    constructor(px: number, py: number) {
        this.px = px;
        this.py = py;
    }
    public info(pre: OpenNode, g: number, h: number) {
        this.pre = pre;
        this.g = g;
        this.h = h;
        this.f = g + h;
        this.value = this.f;
    }
}

export class MyMap {
    static create(width: number, height: number) {
        let arr = new Array<Array<string>>();
        for (let i = 0; i < width; i++) {
            arr[i] = new Array<string>()
            for (let j = 0; j < height; j++) {
                let r = Math.random() * 100;
                if (r < 15) {
                    arr[i][j] = '*';
                } else {
                    arr[i][j] = ' ';
                }
            }
        }
        return arr;
    }

    static print(map: Array<Array<string>>) {
        for (let i = 0; i < map.length; i++) {
            let str = '';
            for (let j = 0; j < map[i].length; j++) {
                str += map[i][j];
            }
            console.log(str);
        }
    }
    static create2(width: number, height: number): Buffer {
        width = 10;
        height = 10;
        let str1 = '' +
            '0000011000' +
            '0000011000' +
            '0000011000' +
            '0000011000' +
            '0000011000' +
            '0000011000' +
            '0000000000' +
            '0000000000' +
            '0000000000' +
            '0000000000';
        let str2 = ' ' +//旋转90度
            '0000000000' +
            '0000000000' +
            '0000000000' +
            '0000000000' +
            '0000000000' +
            '0000111111' +
            '0000111111' +
            '0000000000' +
            '0000000000' +
            '0000000000';

        let buffer = Buffer.alloc(str1.length + str2.length);
        for (let i = 0; i < str1.length; i++) {
            // let from = i % width;
            //let len = (width - from) > 8 ? 8 : (width - from);
            let sub = str1.substr(i, 1);
            //console.log(parseInt(sub, 2))
            buffer.writeUInt8(parseInt(sub), i);
        }
        for (let i = 0; i < str2.length; i++) {
            // let from = i % height;
            // let len = (height - from) > 8 ? 8 : (height - from);
            let sub = str2.substr(i, 1);
            buffer.writeUInt8(parseInt(sub), i + str1.length);
        }

        return buffer;
    }
}