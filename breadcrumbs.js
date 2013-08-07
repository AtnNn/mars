/* TODO

x split map into tiles
- flicker alert
- satelite
- sateite shadow
- zoom out by clicking satelite, zoom in by going somewhere
- asteroids-like movement, with alerts only when reaching edge
- slow moving stars and celestial objects in the background
- after out of range alert, recalculate location to not show the alert again
- disable mouse drag of images
- disable mouse selection of images
- control satelite with mousedown

- aliens (3 groups), two of which leave edge of map
- flowing water
- tardis
- waldo
- carmen san diego
- happy birthday delani
- american flag
- NASA rover moving slowly + tracks
- other satelites flying around
- spaceman spiff
- bruno mars
- calendrier mars
- chocolat mars
- taurentula

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

    //$('#main').mousedown(handle_down);
    //$('#main').mouseup(handle_up);
    $('#main').mousemove(handle_move);

}

var map_tds = false;
function initmap(){
    var x;
    var y;
    for(x = 0; x < 78; x++){
        var tr = $('<tr>');
        for(y = 0; y < 131; y++){
            var td = $('<td>').appendTo(tr).data(true);
        }
        tr.appendTo($('#map'));
    }
    map_tds = $('#map td');
}

function loadtile(x, y){
    var i = y * 131 + x;
    var td = $(map_tds[i]);
    if(!td.data()){
        return;
    }
    $('<img>').attr({
        src: 'map/tile-' + i + '.jpeg',
        width: 181,
        height: 152
    }).appendTo(td).on('dragstart', function(ev){ ev.preventDefault(); });
     td.data(false);
}

last_load_x = -1;
last_load_y = -1;
function loadtiles(posx, posy){
    posx = Math.round(posx / 181);
    posy = Math.round(posy / 152);
    if(posx == last_load_x && posy == last_load_y){
        return;
    }
    console.log('loadtiles',posx,posy);
    last_load_x = posx;
    last_load_y = posy;
    var x;
    var y;
    var extra = 1;
    for(x = posx - extra; x < posx + 5 + extra; x++){
        for(y = posy - extra; y < posy + 4 + extra; y++){
            loadtile(x, y);
        }
    }
}

function handle_move(ev){
    if(ev.buttons == 1){
        var offset = $("#main").offset();
        var h = $('#main').height();
        var w = $('#main').width();
        var pt =
            [ev.pageX - offset.left - w/2,
             ev.pageY - offset.top - h/2];
        impulse_to(pt);
    }
    ev.preventDefault();
}

var impulse_timeout = false;
var impulse_speed = [0,0];
function impulse_to(pos){

    var h = $('#main').height();
    var w = $('#main').width();

    var multiplier = 0.05;
   impulse_acceleration = pos;

    if(impulse_timeout){
        return;
    }

    var ticker;
    ticker = function(){
        var pos = $('#map').position();

        var multiplier = 0.1;
        var decay = 0.99;
        var spmult = 1/120;

        var xdiff = impulse_acceleration[0] * multiplier;
        var ydiff = impulse_acceleration[1] * multiplier;
        impulse_speed[0] = cap(impulse_speed[0] + xdiff, -900, 900) * decay;
        impulse_speed[1] = cap(impulse_speed[1] + ydiff, -900, 900) * decay;
        impulse_acceleration[0] -= xdiff;
        impulse_acceleration[1] -= ydiff;

        var posx = -cappos(pos.left - impulse_speed[0] * spmult, -$('#map').width()+w, 0);
        var posy = -cappos(pos.top - impulse_speed[1] * spmult, -$('#map').height()+h, 0);

        loadtiles(posx, posy);

        $('#map').css({
            left: -posx,
            top: -posy
        });

        if(impulse_speed[0] < 1 && impulse_speed[1] < 1){
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

function cappos(x, a, b){
    if(x < a){
        x = a;
    }else if (x > b){
        x = b;
    }else{
        return x;
    }
    show_alert('GRID COORDINATE OUT OF RANGE');
    return x;
}

var alert_timeout = false;
function show_alert(message){
    if(alert_timeout){
        clearTimeout(alert_timeout);
        alert_timeout = false;
    }
    $('#alert').text(message);
    $('#alert').show();
    alert_timeout = setTimeout(function(){
        $('#alert').fadeOut();
    }, 2000);
}

function dist(a, b){
    var x = b[0]-a[0];
    var y = b[1]-a[1]
    return Math.sqrt(x*x+y*y);
}

$(init);
