import { Test1 } from "./test1";
import { Test2 } from "./test2";

let t1 = new Test1();
let tt1 = new Test1();
let t2 = new Test2();
let ps = Object.getOwnPropertyNames(Test1.prototype);
let ps2 = Object.getOwnPropertyNames(Test2.prototype);
let ts1 = Object.getOwnPropertyNames(Test1);
let ts2 = Object.getOwnPropertyNames(Test2);
console.log(ts1);
console.log(ts2);
console.log(ps);
console.log(ps2);
console.log("----------------------------------");
let filters = ["length", "prototype", "name"];
for (let field of ts2) {
    if(Test2.hasOwnProperty(field) && filters.indexOf(field) == -1){
        Object.defineProperty(Test1, field, Object.getOwnPropertyDescriptor(Test2, field));
    }
}
for (let field of ps2) {
    Object.defineProperty(Test1.prototype, field, Object.getOwnPropertyDescriptor(Test2.prototype, field));
}
 ps = Object.getOwnPropertyNames(Test1.prototype);
 ps2 = Object.getOwnPropertyNames(Test2.prototype);
 ts1 = Object.getOwnPropertyNames(Test1);
 ts2 = Object.getOwnPropertyNames(Test2);
console.log(ts1);
console.log(ts2);
console.log(ps);
console.log(ps2);
console.log(Object.getOwnPropertyNames(t1));
console.log(Object.getOwnPropertyNames(t2));
//console.log(t1.get());
//console.log(tt1.getB());