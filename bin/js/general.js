// Highlight input content on click
var inputs = document.getElementsByTagName('input');
for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('focus', function (event) {
        event.srcElement.select();
    });
};




var showLoaderOverlay = function (message) {
    document.getElementById('loader-overlay-text').innerHTML = message;
    document.getElementById('loader-overlay').className = '';
};

var hideLoaderOverlay = function (message) {
    document.getElementById('loader-overlay').className = 'hidden';
};

var loaderOverlayShowIcon = function (icon) {
    var OverlayIcon = document.getElementById('loader-overlay-icon');
    OverlayIcon.className = "fa fa-5x " + icon;
};

var loaderOverlayShowSuccess = function () {
    loaderOverlayShowIcon("fa-check");
};

var loaderOverlayShowError = function () {
    loaderOverlayShowIcon("fa-close");
};

var loaderOverlayResetIcon = function (instantly) {
    var timeout = instantly ? 0 : 2000;
    window.setTimeout(function () {
        document.getElementById('loader-overlay-icon').className = "fa fa-circle-o-notch fa-spin fa-5x";
    }, timeout);
};