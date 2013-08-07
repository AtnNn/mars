/* TODO

x split map into tiles
x flicker alert
x satelite
x sateite shadow
x asteroids-like movement, with alerts only when reaching edge
- slow moving stars and celestial objects in the background
x after out of range alert, recalculate location to not show the alert again
x disable mouse drag of images
x disable mouse selection of images
x control satelite with mousedown

x tardis
x waldo
x happy birthday delani
x american flag
x NASA rover
x spaceman spiff
x chocolat mars
- peruvian bird drawings
- hieroglyphs
- tintin

*/

var canvas_width = 900;
var canvas_height = 600;
var canvas;
var canvas_offset;
var mouse_trail = [];
var mouse_trail_shine = [];
var render_queued = false;
var queued_reduce_mouse_trail = false;

function init(){

    initmap();

    $('#main').mousedown(handle_mouse(5));
    $('#main').mouseup(handle_mouse(2));
    $('#main').mousemove(handle_mouse(1));

    setTimeout(info_messages,1000);

    slowlyRotate();
}

var rot_angle = 0;
var rot_direction = 0.3;
function slowlyRotate(){
    var t = 'rotate(' + rot_angle + 'deg)';
    $('#satelite, #shadow').css({
        'transform': t,
        '-mox-transform': t,
        '-o-transform': t,
        '-ms-transform': t
    });
    rot_angle += rot_direction;
    if(Math.abs(rot_angle) > 20){
        rot_direction = -rot_direction
    }
    setTimeout(slowlyRotate, 1000);
}

var map_tds = false;
function initmap(){
    var x;
    var y;
    for(x = 0; x < 78; x++){
        var tr = $('<tr>');
        for(y = 0; y < 131; y++){
            var td = $('<td>').appendTo(tr).data('empty',true);
        }
        tr.appendTo($('#map'));
    }
    map_tds = $('#map td');
    var h = $('#map').height();
    var w = $('#map').width();
    $('#map').css({
        left: -w/2,
        top: -h/2
    });
    loadtiles(w/2,h/2);
}

var active_tiles = {};

function loadtile(i){
    var td = $(map_tds[i]);
    if(!td.data('empty')){
        return;
    }
    td.css({
        'background-image': 'url(map/tile-' + i + '.jpeg)'
    });
    td.attr('i', i);
    td.data('empty',false); 
}

last_load_x = -1;
last_load_y = -1;
function loadtiles(posx, posy){
    posx = Math.round(posx / 181);
    posy = Math.round(posy / 152);
    if(posx == last_load_x && posy == last_load_y){
        return;
    }
    last_load_x = posx;
    last_load_y = posy;
    var x;
    var y;
    var extra = 2;
    for(x = posx - extra; x < posx + 5 + extra; x++){
        for(y = posy - extra; y < posy + 4 + extra; y++){
            var i = y * 131 + x; 
            loadtile(i);
        }
    }
}

function handle_mouse(amult){
    return function(ev){
        if(ev.which == 1 && (ev.buttons == 1 || ev.buttons == undefined)){
            var offset = $("#main").offset();
            var h = $('#main').height();
            var w = $('#main').width();
            var pt =
                [ev.pageX - offset.left - w/2,
                 ev.pageY - offset.top - h/2];
            impulse_to(pt, amult);
        }
        ev.preventDefault();
    }
}

var impulse_timeout = false;
var impulse_speed = [0,0];
function impulse_to(pos, amult){

    var h = $('#main').height();
    var w = $('#main').width();

    var multiplier = 0.05;
   impulse_acceleration = [pos[0] * amult, pos[1] * amult];

    if(impulse_timeout){
        return;
    }

    var ticker;
    ticker = function(){
        var pos = $('#map').position();

        var multiplier = 0.02;
        var decay = 0.99;
        var spmult = 1/160;

        var xdiff = impulse_acceleration[0] * multiplier;
        var ydiff = impulse_acceleration[1] * multiplier;
        impulse_speed[0] = cap(impulse_speed[0] + xdiff, -900, 900) * decay;
        impulse_speed[1] = cap(impulse_speed[1] + ydiff, -900, 900) * decay;
        impulse_acceleration[0] -= xdiff;
        impulse_acceleration[1] -= ydiff;

        var posx = -cappos(pos.left - impulse_speed[0] * spmult, -$('#map').width()+w, 0, function(){
            impulse_speed[0] = impulse_acceleration[0] = 0; 
        });
        var posy = -cappos(pos.top - impulse_speed[1] * spmult, -$('#map').height()+h, 0, function(){
            impulse_speed[1] = impulse_acceleration[1] = 0; 
        });

        loadtiles(posx, posy);

        $('#map').css({
            left: -posx,
            top: -posy
        });

        if(Math.abs(impulse_speed[0]) < 1 && Math.abs(impulse_speed[1]) < 1){
            clearTimeout(impulse_timeout);
            impulse_timeout = false;
        }else{
            impulse_timeout = setTimeout(ticker, 33);
        }
    }

    ticker();
}

function roundtozero(x){
    return x < 0 ? Math.ceil(x) : Math.floor(x);
}

function cap(x, a, b){
    return x < a ? a : x > b ? b : x;
}

function cappos(x, a, b, f){
    if(x < a){
        x = a;
    }else if (x > b){
        x = b;
    }else{
        return x;
    }
    f();
    show_alert('GRID COORDINATE OUT OF RANGE');
    return x;
}

function info_messages(){
    var msg;
    if(messages.length == 0){
        msg = [extra_messages[Math.floor(Math.random() * extra_messages.length)], Math.random() * 120 + 120];
    }else{
        msg = messages.shift();
    }
    show_alert(msg[0]);
    setTimeout(info_messages, msg[1]*1000);
}

function show_alert(message){
    var al = $('#alert');
    al.hide();
    al.finish();
    al.text(message);
    al.fadeIn(50).delay(200).
        fadeOut(50).delay(50).
        fadeIn(50).delay(200).
        fadeOut(50).delay(50).
        fadeIn(50).delay(2000).
        fadeOut(200);
}

function dist(a, b){
    var x = b[0]-a[0];
    var y = b[1]-a[1]
    return Math.sqrt(x*x+y*y);
}

$(init);

messages = [
    ["ACQUIRING CONTROL OF SATELLITE", 7],
    ["SATELLITE CONTROL ACQUIRED", 7],
    ["WELCOME TO THE PLANET MARS", 7],
    ["DO NOT LEAVE THE VALLES MARINERIS REGION", 70]
];

extra_messages = [
    "BEWARE OF INVISIBLE UNICORNS",
    "SOLAR IRRADIANCE IS CURRENTLY  589.2 W/M^2",
    "TEMPERATURE IS CURRENTLY -30 F",
    "SPONSORED BY JOHNNYCAB! WE HOPE YOU'VE ENJOYED THE RIDE",
    "TIME TRAVEL IS ILLEGAL",
    "HAVE YOU FOUND WALDO?",
    "LOST AND FOUND: A STUFFED TIGER",
    "REPORT ALL GRAFFITI TO THE MARS POLICE",
    "NO LITTERING - 500$ FINE"
];
