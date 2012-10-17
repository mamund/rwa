/* RESTful Web APIs - 2013 */
/* Maze+XML server implementation */

var http = require('http');
var querystring = require('querystring');
var port = (process.env.PORT||1337);
var root = '';

function handler(req, res) {

    // simple routing
    var parts = req.url.split('/');
    root = 'http://'+req.headers.host;
    
    if(req.method!=='GET') {
        showError(req, res, 'Method Not Allowed', 405);
    }
    else {
        switch(parts.length) {
            case 1:
                showCollection(req, res);
                break;
            case 2:
                showMaze(req, res, parts);
                break;
            case 3:
                showCell(req, res, parts);
                break;
            default:
                showError(req, res, 'Not Found', 404);
                break;
        }
    }
}

function showCollection(req, res) {
    var body = '<maze version="1.0">' 
        + '<collection href="{r}/mid">'.replace('{r}',root)
        + '</collection>'
        + '</maze>';
    showResponse(req, res, body, 200);
}

function showMaze(req, res, parts) {
    var body = '<maze version="1.0">'
        + '<item href="{r}/{m}">'.replace('{m}',parts[1]).replace('{r}',root)
        + '</item>'
        + '</maze>';
    showResponse(req, res, body, 200);
}

function showCell(req, res, parts) {
    var body = '<maze version="1.0">'
        + '<cell href="{r}/{m}/{c}">'.replace('{r}',root).replace('{m}',parts[1]).replace('{c}',parts[2])
        + '</cell>'
        + '</maze>';
    showResponse(req, res, body, 200);
}

function showError(req, res, title, code) {
    var body = '<maze version="1.0">'
        + '<error>'
        + '<title>{t}</title>'.replace('{t}',title)
        + '</error>'
        + '</maze>';
    showResponse(req, res, body, code);
}

function showResponse(req, res, body, code) {
    res.writeHead(code,{'content-type':'application/xml'});
    res.end(body);
}

http.createServer(handler).listen(port);
