var ConfirmButton = document.getElementById('button-next');


var confirmPasswordsCopied = function () {
    return confirm('Did you really save all passwords?\nThe passwords can not be displayed again.\nIf you lose them your data can not be recovered!');
};

var enableConfirmButton = function () {
    ConfirmButton.innerHTML = '<i class="fa fa-chevron-right"></i> Next';
    ConfirmButton.disabled = false;
};

var handleAfterPrint = function (event) {
    enableConfirmButton();
};

var handleCountdownZero = function () {
    enableConfirmButton();
    clearInterval(ConfirmInterval);
};



var handleConfirmButtonClick = function () {
    if (confirmPasswordsCopied()) {
        window.location.replace('/setup');
    }
};




// Print-Button
document.getElementById('printButton').addEventListener('click', function (event) {
    window.print();
});
window.onafterprint = handleAfterPrint;


ConfirmButton.addEventListener('click', handleConfirmButtonClick);

var confirmCountdown = 30;
var ConfirmInterval = setInterval(function () {

    ConfirmButton.innerHTML = '<i class="fa fa-chevron-right"></i> Continue (' + confirmCountdown + ')';

    if (--confirmCountdown < 0) {
        handleCountdownZero();
    }
}, 1000);
