// Print-Button
document.getElementById('printButton').addEventListener('click', function (event) {
    window.print();
});
window.onafterprint = handleAfterPrint;


// Highlight input content on click
var inputs = document.getElementsByTagName('input');
for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('focus', function (event) {
        event.srcElement.select();
    });
}


var ConfirmButton = document.getElementById('confirmButton');

ConfirmButton.addEventListener('click', function (event) {
    handleConfirmButtonClick();
});

var confirmCountdown = 30;
var ConfirmInterval = setInterval(function () {

    ConfirmButton.innerHTML = '<i class="fa fa-check"></i> Confirm (' + confirmCountdown + ')';

    if (--confirmCountdown < 0) {
        handleCountdownZero();
    }
}, 1000);


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
        document.getElementById('loader-overlay-icon').className = "fa fa-circle-o-notch fa-spin fa-5x"
    }, timeout);
};

var confirmPasswordsCopied = function () {
    return confirm('Did you really save all passwords?\nThe passwords can not be displayed again.\nIf you lose them your data can not be recovered!');
};

var confirmButtonPressMessage = function () {
    return confirm('Make sure you can physically access your Passdora box.\nAfter confirming this dialog you have 30 seconds to confirm the initialization by pressing and holding the button on your box for 3 seconds.');
};

var handleAuthSuccessful = function () {
    loaderOverlayShowSuccess();
    showLoaderOverlay('Authentication successful!');

    window.setTimeout(function () {
        loaderOverlayResetIcon(true);
        showLoaderOverlay('Loading Passdora...');
        window.setTimeout(function () {
            location.reload(true);
        }, 3000);
    }, 2000);
};

var handleAuthError = function (message) {
    showLoaderOverlay(message);
    loaderOverlayShowError();
    window.setTimeout(function () {
        alert(message);
        hideLoaderOverlay();
        loaderOverlayResetIcon(true);
    }, 50);
};

var handleAfterPrint = function (event) {
    enableConfirmButton();
};

var handleCountdownZero = function () {
    enableConfirmButton();
    clearInterval(ConfirmInterval);
};

var enableConfirmButton = function () {
    ConfirmButton.innerHTML = '<i class="fa fa-check"></i> Confirm';
    ConfirmButton.disabled = false;
};

var handleConfirmButtonClick = function () {
    if (confirmPasswordsCopied() && confirmButtonPressMessage()) {
        var XHttp = new XMLHttpRequest();

        XHttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    var Response = JSON.parse(XHttp.response);
                    switch (Response.returnCode) {
                        case 0:
                            handleAuthSuccessful();
                            break;
                        case 3:
                            handleAuthError('The button was not pressed long enough.\nPlease try again.');
                            break;
                        case 4:
                            handleAuthError('The button was not pressed.\nPlease try again.');
                            break;
                        default:
                            handleAuthError('Something went wrong.\nPlease try again.');
                            break;
                    }
                } else {
                    console.error('request failed');
                    handleAuthError('Something went wrong. Please try again later.');
                }
            }
        };

        showLoaderOverlay('Awaiting button press for authentication...');

        var authCodeParamAndValue = window.location.search.substr(1);

        XHttp.open("POST", "/activate?" + authCodeParamAndValue, true);
        XHttp.send();
    }
};
