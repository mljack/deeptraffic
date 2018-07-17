// webworker code for running the evaluation - imports a bunch of code, runs the user supplied net, starts the simulation and finally sends a result back to the main thread
var window = self;
importScripts("convnetjs/convnet.js");
importScripts("convnetjs/util.js");
importScripts("convnetjs/vis.js");
importScripts("convnetjs/deepqlearn.js");
importScripts("convnetjs/helperStuff.js");
headless = true;

function startEvalRun(code) {
    eval(code);
    importScripts("gameopt.js");

    if (typeof brain != 'undefined') {
        brain.learning = false;
    }
    var runs = 500;
    var frames = 2000;
    var percent = 0;
    var mph = doEvalRun(runs, frames, true, function () {
        console.log(percent + "% done");
        postMessage({
            percent: percent
        });
        percent++;
    }, runs * frames / 100);
    if (typeof brain != 'undefined') {
        brain.learning = true;
    }
    postMessage({
        mph: mph
    });
}

onmessage = function (e) {
    startEvalRun(e.data);
}
