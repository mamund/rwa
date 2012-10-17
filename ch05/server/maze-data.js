/*
 * maze file handlder
 * 2012-10 (mca)
 */

var fs = require('fs');
var folder = process.cwd()+'/data/';
console.log('folder '+folder);

module.exports = main;

function main(cmd, maze, cell) {
    var rtn;

    switch(cmd)
    {
        case 'list':
            rtn = getList();
            break;
        case 'maze':
            rtn = getMaze(maze);
            break;
        case 'cell':
            rtn = getCell(maze, cell);
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
    console.log('getList '+list);
    for(i=0,x=list.length;i<x;i++) {
        coll.push(list[i].replace('.js',''));
    }
    return coll;
}

function getMaze(m) {
    try {
        return JSON.parse(fs.readFileSync(folder+m+'.js'));
    }
    catch(ex) {
        return undefined;
    }
}

function getCell(m, c) {
    try {
        var maze = getMaze(m+'.js');
        return maze.cells[cell+c];
    }
    catch(ex) {
        return undefined;
    }
}
