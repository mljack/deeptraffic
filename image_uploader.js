// script to load custom images of deeptraffic vehicles

var croppie_options = {
                        viewport: { width: 268, height: 586},
                        boundary: { width: 300, height: 700}
                    };
var croppie = new Croppie(document.getElementById("croppie-container"), croppie_options);

function sendImage (blob) {
    var http = new XMLHttpRequest();
    http.open("POST", "https://selfdrivingcars.mit.edu/deeptraffic/customize_image.php" , true); 
    var formData = new FormData();
    formData.append("customVehicle", blob)
    http.send(formData);
}

function sendColorScheme (colorScheme) {
    var params = "color_scheme=" + encodeURIComponent(colorScheme);
    var http = new XMLHttpRequest();
    http.open("GET", "https://selfdrivingcars.mit.edu/deeptraffic/customize_colorscheme.php?" + params , true);
    console.log("https://selfdrivingcars.mit.edu/deeptraffic/customize_colorscheme.php?" + params);
    http.send(null);
}

function requestVisualization () {
    var http = new XMLHttpRequest();
    http.open("GET", "https://selfdrivingcars.mit.edu/deeptraffic/request_visualization.php", true);
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
    };
    http.send(null);
}

var requestVis = document.getElementById("requestVisualization");
requestVis.onclick = requestVisualization;

var colorSelector = document.getElementById("colorscheme");
colorSelector.onchange = function () {
    var colorScheme = colorSelector.options[colorSelector.selectedIndex].value;
    ghostColor = colorScheme;
    sendColorScheme(colorScheme);
};

var buttonCrop = document.getElementById("cropImage");
var buttonLoadFile = document.getElementById("loadFile")
buttonLoadFile.onclick = loadImageFileAsUrl;
function loadImageFileAsUrl() {
    var fileInput = document.getElementById("inputCarToLoad");
    // On click, clear the value, so that onchange always works
    fileInput.onclick = function () {
        this.value = null;
    }
    // On change, i.e. when the file is loaded
    fileInput.onchange = function () {
        var filesSelected = fileInput.files;
        if (filesSelected.length > 0) {
            var fileToLoad = filesSelected[0];
            if (fileToLoad.type.match("image.*")) {
                var fileReader = new FileReader();
                fileReader.onload = function(fileLoadedEvent) {
                    document.getElementById("vehicle").style.display = "none";
                    document.getElementById("croppie-container").style.display = "block";
                    buttonCrop.style.display = "block";
                    croppie.bind({url: fileLoadedEvent.target.result});
                    var imageLoaded = document.getElementById("vehicle");
                    buttonCrop.onclick = function () {
                        croppie.result({type: 'blob', format: 'png', size: {width: 268, height: 586}})
                            .then(function(blob) {
                                    imageLoaded.src = URL.createObjectURL(blob);
                                    sendImage(blob);
                                });
                        document.getElementById("vehicle").style.display = "block";
                        document.getElementById("croppie-container").style.display = "none";
                        buttonCrop.style.display = "none";
                    }
                };
                fileReader.readAsDataURL(fileToLoad);
            }
        }
    }
    fileInput.click();
}
