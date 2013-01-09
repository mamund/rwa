/*
 * read/write messages module
 * 2012-11 (mamund)
 * RESTful Web APIs (Richardson/Amundsen)
 */ 

var fs = require('fs');
var folder = process.cwd()+'/data/';

module.exports = main;

function main(action, arg) {
    var rtn;

    switch(action) {
        case 'list':
            rtn = getList();
            break;
        case 'item':
            rtn = getItem(arg);
            break;
        case 'add':
            rtn = addItem(arg);
            break;
        default:
            break;
    }
    return rtn;
}

function getList(arg) {
    var coll, item, list, i, x;

    coll = [];
    list = fs.readdirSync(folder);
    for(i=0,x=list.length;i<x;i++) {
        item = JSON.parse(fs.readFileSync(folder+list[i]));
        if(arg) {
            if(item.title.indexOf(arg)!=-1) {
                coll.push(item);
            }
        }
        else {
            coll.push(item);
        }
    }
    return coll;
}

function getItem(id) {
    return JSON.parse(fs.readFileSync(folder+id));
}

function addItem(item) {
    item.id = makeId();
    item.date = new Date();
    fs.writeFileSync(folder+item.id, JSON.stringify(item));
    return getList();
}

function makeId() {
    var tmp, rtn;

    tmp = Math.random();
    rtn = String(tmp);
    rtn = rtn.substring(2);
    return rtn;
}
/* eof */

