import { AStar } from "./astar";
import { MyMap } from "./tool/common";
import { JPS } from "./jps";
import { JPSs } from "./jps+";

// let startX = 2;
// let startY = 5;
// let endX = 25;
// let endY = 10;
// let width = 30;
// let height = 30;
// let map = MyMap.create(width,height);
// map[startX][startY] = ' ';
// map[endX][endY] = ' ';
// let astar = new AStar(width,height,map);
// astar.find(startX,startY,endX,endY);
//let buffer = Buffer.alloc(10);
//buffer.writeUInt8(1);
//buffer.writeUInt8(12, 1);
//let m = buffer.readUInt8(1);
//let r = (m >> 1) & (m ^ 0xFF);
//console.log(n);
let startX = 0;
let startY = 0;
let endX = 8;
let endY = 0;
let width = 10;
let height = 10;
let map = MyMap.create2(0, 0);
let jps = new JPS(width, height, map);
//jps.print();
jps.find(startX, startY, endX, endY);



