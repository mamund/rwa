/* index.js 
 * RWA (2013)
 * 2012-10 (mca)
 */

var thisPage = function() {

    var g = {};
    g.moves = 0;
    g.links = [];
    g.mediaType = "application/vnd.amundsen.maze+xml";
    g.startLink = ""; //"http://localhost:1337/simple/";
    g.sorryMsg = 'Sorry, I don\'t understand what you want to do.';
    g.successMsg = 'Congratulations! you\'ve made it out of the maze!';
      
    function init() {
        var elm;
    
        elm = document.getElementById('interface');
        if(elm) {
            elm.onsubmit = function(){return move();};
        }

        elm = document.getElementById('select-server');
        if(elm) {
            elm.onsubmit = function(){return load();};
        }
    }

    function setFocus() {
        var elm;

        elm = document.getElementsByName('move')[0];
        if(elm) {
            elm.value = '';
            elm.focus();
        }  
    }

    function toggleDisplay() {
        var elm, srv;
    
        elm = document.getElementsByName('server')[0];
        if(elm) {
            srv = elm.value;
        }
        elm = document.getElementById('show-server');
        if(elm) {
            elm.innerHTML = srv;
            elm.style.display = 'block';
        }
    
        elm = document.getElementById('display');
        if(elm) {
            elm.style.display = 'block';
        }
        elm = document.getElementById('interface');
        if(elm) {
            elm.style.display = 'block';
        }
        elm = document.getElementById('select-server');
        if(elm) {
            elm.style.display = 'none';
        }
    }

    function load() {
        var elm;
    
        elm = document.getElementsByName('server')[0];
        if(elm) {
            g.startLink = elm.value;
            if(g.startLink!=='') {
                getDocument(g.startLink);
                toggleDisplay();
                setFocus();
            }
        }
        return false;
    }

    function move() {
        var elm, mv, href;
    
        elm = document.getElementsByName('move')[0];
        if(elm) {
            mv = elm.value;
            if(mv === 'clear') {
                reload();
            }
            else {
                href = getLinkElement(mv);
                if(href) {
                    updateHistory(mv);
                    getDocument(href);
                }
                else {
                    alert(g.sorryMsg);
                }
            }
            setFocus();
        }
        return false;
    }

    function reload() {
        history.go(0);
    }  
    
    function getLinkElement(key) {
        var i, x, rtn;
    
        for(i = 0, x = g.links.length; i < x; i++) {
            if(g.links[i].rel === key) {
                rtn = g.links[i].href;
                break;
            } 
        }
        return rtn || '';
    }

    function updateHistory(mv) {
        var elm, txt;
    
        elm = document.getElementById('history');
        if(elm) {
            txt = elm.innerHTML;
            g.moves++;
            if(mv==='exit') {
                txt = g.moves +': ' + g.successMsg + '<br />' + txt; 
            }
            else {
                txt = g.moves + ':' + mv + '<br />' + txt;      
            }
            elm.innerHTML = txt;
        }
    }
  
    function processLinks(ajax) {
        var xml, link, i, x, y, j, rels, href;
    
        g.links = [];
        xml = ajax.responseXML.selectNodes('//link');
        for(i = 0, x = xml.length; i < x; i++) {
            href = xml[i].getAttribute('href');
            rels = xml[i].getAttribute('rel').split(' ');
            for(j = 0, y = rels.length; j < y; j++) {
                link = {'rel' : rels[j], 'href' : href};
                g.links[g.links.length] = link;
            }
        }       
        showOptions();
    }

    function showOptions() {
        var elm, i, x, txt;
    
        txt = '';    
        elm = document.getElementsByClassName('options')[0];
        if(elm) {
            for(i = 0, x = g.links.length; i < x; i++) {
                if(i>0){
                    txt += ', ';
                }
                if(g.links[i].rel === 'collection') {
                    txt += 'clear';
                }
                else {
                    txt += g.links[i].rel;        
                }
            }
            elm.innerHTML = txt;
        }    
    }
    
    // make a server request
    function getDocument(url) {
        var ajax;

        ajax=new XMLHttpRequest();
        if(ajax) {
            ajax.onreadystatechange = function() {
                if(ajax.readyState==4 || ajax.readyState=='complete') {
                    processLinks(ajax);
                }
            };
              
            ajax.open('get', url, true); 
            ajax.setRequestHeader('accept', g.mediaType);
            ajax.send(null);
        }
    }

    // publish methods  
    var that = {};
    that.init = init;
  
    return that;
};

window.onload = function() {
    var pg = thisPage();
    pg.init();
};
