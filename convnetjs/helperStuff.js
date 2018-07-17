function draw_net() {
    if (!headless) {
    var canvas = document.getElementById("net_canvas");
    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = canvas.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var L = brain.value_net.layers;
    var dx = (W - 50) / L.length;
    var x = 10;
    var y = 40;
    ctx.font = "12px Verdana";
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText("Value Function Approximating Neural Network:", 10, 14);
    for (var k = 0; k < L.length; k++) {
        if (typeof (L[k].out_act) === 'undefined') continue; // maybe not yet ready
        var kw = L[k].out_act.w;
        var n = kw.length;
        var dy = (H - 50) / n;
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillText(L[k].layer_type + "(" + n + ")", x, 35);
        for (var q = 0; q < n; q++) {
            var v = Math.floor(kw[q] * 100);
            if (v >= 0) ctx.fillStyle = "rgb(0,0," + v + ")";
            if (v < 0) ctx.fillStyle = "rgb(" + (-v) + ",0,0)";
            ctx.fillRect(x, y, 10, 10);
            y += 12;
            if (y > H - 25) {
                y = 40;
                x += 12
            };
        }
        x += 50;
        y = 40;
    }
    }
}

var reward_graph = new cnnvis.Graph();
var ctr = 0;

function draw_stats() {
    /*var canvas = document.getElementById("vis_canvas");
    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = canvas.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var netin = brain.last_input_array;
    ctx.strokeStyle = "rgb(0,0,0)";
    //ctx.font="12px Verdana";
    //ctx.fillText("Current state:",10,10);
    ctx.lineWidth = 10;
    ctx.beginPath();
    for (var k = 0, n = netin.length; k < n; k++) {
        ctx.moveTo(10 + k * 12, 120);
        ctx.lineTo(10 + k * 12, 120 - netin[k] * 100);
    }
    ctx.stroke();*/

    if (!headless) {
        reward_graph.add(ctr, brain.average_reward_window.get_average());
        var gcanvas = document.getElementById("graph_canvas");
        reward_graph.drawSelf(gcanvas);
    }
    ctr++;
}

function startlearn() {
    brain.learning = true;
}

function stoplearn() {
    brain.learning = false;
}

function savenet() {
    var j = brain.value_net.toJSON();
    var t = JSON.stringify(j);
    document.getElementById('tt').value = t;
}

function loadnet() {
    var t = document.getElementById('tt').value;
    var j = JSON.parse(t);
    brain.value_net.fromJSON(j);
}