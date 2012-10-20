/* RWA - RESTful Web APIs
 * 2012-10 (mca)
 * the-mapmaker.js
 * stand-alone maze+xml client
 * that maps out the entire maze
 */

var url = require('url');
var http = require('http');
var DOMParser = require('xmldom').DOMParser;

var m = {};
m.start = false;
m.moves = 1;
m.help = '***Usage:\nnode the-bot [starting-url]';
m.winner = '*** DONE and it only took {m} moves! ***';
m.quitter = '*** Sorry, I can\'t find any mazes here. ***';

m.map = [];
m.rooms = [];
m.visited = [];
m.nest = 0;

// get argument and start process
arg = process.argv[2];
if(arg===undefined) {
    console.log(m.help);
}
else {
    makeRequest('GET', arg, m.nest++);
}

// send requests to server
function makeRequest(method, path) {
    var hdrs, options, pUrl;

    pUrl = url.parse(path);
    
    hdrs = {
        'host' : pUrl.host,
        'content-type' : 'application/vnd.amundsen.maze+xml'
    };

    options = {
        host : pUrl.hostname,
        port : pUrl.port,
        path : pUrl.pathname,
        method : method,
        headers : hdrs
    };

    var req = http.request(options, function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var doc, nodes, i, x, links, href, flag, choices;

            m.nest--

            // collect hyperlinks from the response
            links = [];
            doc = new DOMParser().parseFromString(body, 'text/xml');
            nodes = doc.getElementsByTagName('link');
            for(i=0, x=nodes.length; i<x; i++) {
                links.push({'rel':nodes[i].getAttribute('rel'), 'href':nodes[i].getAttribute('href')});
            }

            // check for entrance link
            if(m.start===false) {
                href = findLink(links, 'start');
                if(href) {
                    m.start = true;
                    addRooms(links);
                    addVisited(path, links);
                    console.log(m.moves++ + '[s]:' + href)
                }
                // ok, see if we can find a maze link
                if(href===undefined) {
                    href = findLink(links, 'maze');
                }
                // well, is there a collection link?
                if(href===undefined) {
                    href = findLink(links, 'collection');
                }
                // ok, i give up!
                if(href===undefined) {
                    console.log(m.quitter);
                    return;
                }
                makeRequest('GET', href, m.nest++);
            }
            
            // ok, check to see if we have some rooms
            if(href===undefined) {
                addRooms(links);
                while(m.rooms.length!==0) {
                    href = m.rooms[m.rooms.length-1];
                    addVisited(path, links);
                    m.rooms.pop();
                    console.log(m.moves++ + '[m]:' + href);
                    makeRequest('GET', href, m.nest++);
                }
            }
            
            // did we finally run out of rooms?
            if(m.nest===0 && m.rooms.length===0) {
                console.log(JSON.stringify(m.map, null, 2));
            }
        });
   });

    req.on('error', function(error) {
        console.log(error);
    });

    req.end();
}
 

function findLink(links,rel) {
    var i, x, rtn;

    for(i=0, x=links.length; i<x; i++) {
        if(links[i].rel===rel) {
            rtn = links[i].href;
        }
    }
    return rtn;
}

function addRooms(links) {
    var i, x, coll;

    // scan scrubbed collection of links
    coll = scrub(links);

    for(i=0,x=coll.length;i<x;i++) {
        if(m.visited.contains(coll[i].href)===false 
            && 
            m.rooms.contains(coll[i].href)===false) {
            m.rooms.push(coll[i].href);
        }
    }
}

function addVisited(href, links) {
    var i, x;

    if(m.visited.length==0) {
        m.visited.push(href);
        m.map.push({'href':href, 'links':links});
    }
    else {
        for(i=0, x=m.visited.length;i<x;i++) {
            if(m.visited.contains(href)===false) {
                m.visited.push(href);
                m.map.push({'href':href, 'links':scrub(links)});
            }
        }
    }
}

function scrub(links) {
    var i, x, coll;

    // drop unwanted links:
    coll=[];
    for(i=0,x=links.length;i<x;i++) {
        if(links[i].rel!=='collection'
            &&
            links[i].rel!=='maze'
            &&
            links[i].rel!=='start')
            coll.push(links[i]);
    }
    return coll;
}

// utility function for array searches
Array.prototype.contains = function(k) {
  for(p in this)
     if(this[p] === k)
        return true;
  return false;
}
