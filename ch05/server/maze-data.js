/*
 * maze file handlder
 * 2012-10 (mca)
 */

var fs = require('fs');
var folder = process.cwd()+'/data/';

module.exports = main;

function main(args) {
    var rtn;

    switch(args[0])
    {
        case 'list':
            rtn = getList();
            break;
        case 'maze':
            rtn = getMaze(args[1]);
            break;
        case 'cell':
            rtn = getCell(args[1], args[2]);
            break;
        default:
            break;
    }
    return rtn;
}

function getList() {
    var coll, maze, list, i, x;

    coll = [];
    list = fs.readdirSync(folder);
    for(i=0,x=list.length;i<x;i++) {
        maze = JSON.parse(fs.readFileSync(folder+list[i]));
        coll.push(maze);
    }
    return coll;
}

function getMaze(m) {
    return JSON.parse(fs.readFileSync(folder+m+'.js'));
}

function getCell(m, c) {
    var maze = getMaze(m+'.js');
    return maze.cells[cell+c];
}
