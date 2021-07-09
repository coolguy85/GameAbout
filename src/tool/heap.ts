export interface HeapElement {
    value: number;
    pointer: number;
}
//l是否在r前面
export type Comparator<T extends HeapElement> = (l: T, r: T) => boolean;

export class Heap<T extends HeapElement> {
    private readonly _elements: Array<T>;
    private readonly _comparator: Comparator<T>;

    constructor(c: Comparator<T>) {
        this._elements = [];
        this._comparator = c;
    }

    public get top(): T {
        return this._elements[0];
    }

    public isEmtry(): boolean {
        return this._elements.length === 0;
    }

    public push(e: T): void {
        this._elements.push(e);
        this.shiftUp(this._elements.length - 1, e);
    }

    public pop(): T {
        let result: T = this._elements[0];
        let value: T = this._elements.pop();

        if (0 != this._elements.length) {
            this.shiftDown(0, value);
        }

        return result;
    }

    public remove(e: T): boolean {
        let i: number = e.pointer;
        if (i >= this._elements.length) {
            return false;
        }

        if (this._elements[i] != e) {
            return false;
        }

        let value: T = this._elements.pop();
        if (i < this._elements.length) {
            this.shiftDown(i, value);
        }
        return true;
    }

    public clear(): void {
        this._elements.length = 0;
    }

    private shiftDown(i: number, e: T): void {
        let l: number = (i << 1) + 1;
        let r: number = l + 1;
        let count: number = this._elements.length;
        let v: T;
        while (l < count) {
            v = this._elements[l];
            if (r < count && this._comparator(this._elements[r], v)) {
                v = this._elements[r];
                l = r;
            }

            if (this._comparator(e, v)) {
                break;
            }

            v.pointer = i;
            this._elements[i] = v;
            i = l;
            l = (i << 1) + 1;
            r = l + 1;
        }

        e.pointer = i;
        this._elements[i] = e;
    }

    private shiftUp(i: number, e: T): void {
        let p: number = (i - 1) >> 1;
        let v: T;
        while (0 != i) {
            v = this._elements[p];
            if (!this._comparator(e, v)) {
                break;
            }

            v.pointer = i;
            this._elements[i] = v;
            i = p;
            p = (i - 1) >> 1;
        }

        e.pointer = i;
        this._elements[i] = e;
    }

    public getSize(): number {
        return this._elements.length;
    }

    public getElement(index: number): T {
        if (index >= this._elements.length) {
            return null;
        }
        return this._elements[index]
    }

    public getElementList(): Array<T> {
        return this._elements;
    }
}