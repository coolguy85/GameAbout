
export class Test2{
    a: number;
    b: number;
    c: number = 0;
    static _instance:Test2 ;
    constructor(){
        this.a = 1;
        this.b = 2;
        this.c = 3;
    }
    public static instance():Test2{
        if(!this._instance){
            this._instance = new Test2();
        }
        return this._instance;
    }
    public getA(): number {
        return this.a;
    }
    public getD(): number {
        //console.log("c:" + this.c)
        return this.b;
    }
    public getC():number{
        //onsole.log("new c:" + this.c)
        return this.b;
    }
}