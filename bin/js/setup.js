var CheckboxDHCP = document.getElementById('dhcp-enabled');

var toggleDHCP = function () {
    var isChecked = CheckboxDHCP.checked;
    document.getElementById('header-ip').style.display = isChecked ? 'none' : 'block';
    document.getElementById('header-subnetmask').style.display = isChecked ? 'none' : 'block';

    document.getElementById('row-ip').style.display = isChecked ? 'none' : 'flex';
    document.getElementById('row-subnetmask').style.display = isChecked ? 'none' : 'flex';
};

CheckboxDHCP.addEventListener('change', toggleDHCP);


var CheckBoxWifi = document.getElementById('wifi-enabled');

var toggleWifi = function () {
    var isChecked = CheckBoxWifi.checked;
    document.getElementById('row-wifi-ssid').style.display = isChecked ? 'flex' : 'none';
    document.getElementById('row-wifi-password').style.display = isChecked ? 'flex' : 'none';
};

CheckBoxWifi.addEventListener('change', toggleWifi);


var ButtonConfirm = document.getElementById('button-confirm');

var submitSetup = function () {
    var settings = {
        hostname     : document.getElementById('hostname').value,
        isDhcpEnabled: CheckboxDHCP.checked,
        ip           : document.getElementById('ip').value,
        subnetmask   : document.getElementById('subnetmask').value,
        isWifiEnabled: CheckBoxWifi.checked,
        wifiSsid     : document.getElementById('wifi-ssid').value,
        wifiPassword : document.getElementById('wifi-password').value
    };

    var XHttp = new XMLHttpRequest();

    XHttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var Response = JSON.parse(XHttp.response);
                console.log(Response);
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
                // TODO: do something
            }
        }
    };

    showLoaderOverlay('Awaiting button press for authentication...');

    var params = "?settings=" + encodeURI(JSON.stringify(settings));

    XHttp.open("POST", "/activate" + params, true);
    XHttp.send();
};

ButtonConfirm.addEventListener('click', submitSetup);



var handleAuthSuccessful = function () {
    loaderOverlayShowSuccess();
    showLoaderOverlay('Authentication successful!');

    window.setTimeout(function () {
        loaderOverlayResetIcon(true);
        showLoaderOverlay('Please restart your Passdora-Box then reload this page...');
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