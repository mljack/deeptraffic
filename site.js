// helper scripts for the general site - to make the buttons work, editor show up etc.
require.config({
    paths: {
        'vs': 'monaco-editor/min/vs'
    }
});
require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('container'), {
        value: document.getElementById("sampleCode").innerHTML.split("\n        ").join("\n"),
        language: 'javascript',
        //theme: "vs-dark",
        wrappingColumn: 75,
    });
});

run = function () {
    reward_graph = new cnnvis.Graph();
    eval(editor.getValue());
    brain.learning = false;
    reset();
    if ((2 * lanesSide + 1) * (patchesAhead + patchesBehind) > 100) {
        document.getElementById("net_canvas").setAttribute("width", "2000");
    } else {
        document.getElementById("net_canvas").setAttribute("width", "550");
    }

}
console.log(document.getElementById("sampleCode").innerHTML);
brain.learning = false;

function getData() {
    var data = editor.getValue() + "\n/*###########*/\n";
    if (brain) {
        data += "if (brain) {\nbrain.value_net.fromJSON(" + JSON.stringify(brain.value_net.toJSON()) + ");\n}";
    }
    return data;
}
// depricated
prepareDownload = function (link) {
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(getData());
}

// use this to download
downloadCode = function () {
    var blob = new Blob([getData()], {type: 'text/plain'});
    var url = URL.createObjectURL(blob);
    var blobAnchor = document.getElementById("blobDownload");
    blobAnchor.download = "net.js";
    blobAnchor.href = url;
    blobAnchor.click();
}

document.getElementById("downloadCodeButton").onclick = downloadCode;

readFile = function (picker) {
    swal({
        title: 'Are you sure?',
        text: 'This will OVERWRITE the current CODE and trained net state!',
        type: 'warning',
        showCancelButton: true,
        closeOnConfirm: false,
    }, function (isConfirm) {
        if (isConfirm) {
            console.log("loading");
            var file = picker.files[0];
            if (file) {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function (event) {
                    var data = event.target.result;
                    eval(data);
                    editor.setValue(data.split("\n/*###########*/\n")[0]);
                    brain.learning = false;
                    reset();
                    swal("Success", "File loaded!", "success");
                }
                reader.onerror = function (evt) {
                    swal("Oops...", "Error reading file!", "error");
                }
            } else {
                swal("Oops...", "Error reading file!", "error");
            }
        }
    });

}

submitNet = function () {
    var http = new XMLHttpRequest();
    var params = "code=" + encodeURIComponent(getData());
    http.open("POST", "https://selfdrivingcars.mit.edu/deeptraffic/submit_code.php" , true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function () {
        if (http.readyState == 4) { // http.status == 200) {
            try {
                var result = JSON.parse(http.responseText);
                if (result.success) {
                    swal("Success", result.message, "success");
                } else {
                    swal({
                        title: "Error",
                        text: result.message,
                        html: true,
                        type: "error"
                    });
                }
            } catch (error) {
                swal("Error", "please try again", "error");
            }

        }
    }
    http.send(params);
}

startEvalRun = function () {
    var button = document.getElementById("evalButton");
    var progress = document.getElementById("evalProgress");
    button.setAttribute("style", "display: none;");
    progress.value = 0;
    progress.setAttribute("style", ";");
    if (window.Worker) {
        var myWorker = new Worker("eval_webworker.js");
        myWorker.onmessage = function (e) {
            if (typeof e.data.percent != 'undefined') {
                progress.value = e.data.percent;
            }

            if (typeof e.data.mph != 'undefined') {
                progress.setAttribute("style", "display: none;");
                button.setAttribute("style", ";");
                swal({
                    title: "Evaluation complete",
                    text: "Average speed: <b>" + e.data.mph + " mph</b>",
                    html: true
                });
            }
        };
        myWorker.postMessage(getData());
    }
}

train = function () {
    brain.learning = false;
    var button = document.getElementById("trainButton");
    var progress = document.getElementById("trainProgress");
    button.setAttribute("style", "display: none;");
    progress.value = 0;
    progress.setAttribute("style", ";");
    if (window.Worker) {
        var myWorker = new Worker("train_webworker.js");
        myWorker.onmessage = function (e) {
            if (typeof e.data.percent != 'undefined') {
                progress.value = e.data.percent;
            }

            if (typeof e.data.net != 'undefined') {
                brain.value_net.fromJSON(e.data.net);
                // jack 2018-01-04
                //transplantBrains(brain, brains);
                for (let i = 0; i < nOtherAgents; i++) {
                   brains[i].value_net = brain.value_net;
                    
                }
                console.log("setting Net");
            }

            if (typeof e.data.done != 'undefined') {
                progress.setAttribute("style", "display: none;");
                button.setAttribute("style", ";");
                swal("Training finished!", "", "success");
            }
        };
        myWorker.postMessage(getData());
    }
}

if (!window.Worker) {
    swal({
        title: "This site requires Web Worker support",
        text: "Make sure you are using a compatible browser like <b>Google Chrome</b>, and update to the most recent version.",
        html: true,
        type: "error"
    });
}
