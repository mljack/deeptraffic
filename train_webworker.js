// webworker code for running training - imports a bunch of code, runs the user supplied net, starts the simulation and
// finally sends a result back to the main thread
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
        brain.learning = true;
    }
    if (trainIterations > 0) {
        var totalFrames = 30 /*decisionFrequency*/ * trainIterations;
        var numRuns = totalFrames / 100000 + 1;
        var percent = 0;
        doEvalRun(numRuns, totalFrames / numRuns, false, function () {
            console.log(percent + "% done");
            postMessage({
                percent: percent
            });
            //if (percent > 0 && percent % 10 == 0) {
            postMessage({
                net: brain.value_net.toJSON()
            });
            //}
            percent++;
        }, totalFrames / 100);
    }
    if (typeof brain != 'undefined') {
        brain.learning = false;
    }
    postMessage({
        net: brain.value_net.toJSON()
    });
    postMessage({
        done: true
    });
}

onmessage = function (e) {
    startEvalRun(e.data);
}
