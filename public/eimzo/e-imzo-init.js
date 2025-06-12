let EIMZO_MAJOR = 3;
let EIMZO_MINOR = 37;


let errorCAPIWS = "E-IMZO ga ulanishda xatolik yuz berdi. Sizda E-IMZO moduli yoki E-IMZO brauzeri oʻrnatilmagan boʻlishi mumkin!.";
let errorBrowserWS = "Brauzer WebSocket texnologiyasini qo'llab-quvvatlamaydi. Brauzeringizning eng so'nggi versiyasini o'rnating.";
let errorUpdateApp = "DIQQAT!!! E-IMZO ilovasining yangi versiyasini yoki E-IMZO brauzerini o'rnating.";
let errorWrongPassword = "Parol noto'g'ri terildi";

function AppLoad() {
    EIMZOClient.API_KEYS = [
        'localhost', '96D0C1491615C82B9A54D9989779DF825B690748224C2B04F500F370D51827CE2644D8D4A82C18184D73AB8530BB8ED537269603F61DB0D03D2104ABF789970B',
        '127.0.0.1', 'A7BCFA5D490B351BE0754130DF03A068F855DB4333D43921125B9CF2670EF6A40370C646B90401955E1F7BC9CDBF59CE0B2C5467D820BE189C845D0B79CFC96F',
        'hrm.railway.uz', '92B932F95475E984C05CF9D488175CE59F0B725EA978ECFD01E86FA88A2CC5A9854311D9B887569D79E3C4192ACEFA1255F11276F1D0497111A2C69CFE7188E9'
    ];
    // uiLoading();
    EIMZOClient.checkVersion(function (major, minor) {
        let newVersion = EIMZO_MAJOR * 100 + EIMZO_MINOR;
        let installedVersion = parseInt(major) * 100 + parseInt(minor);
        if (installedVersion < newVersion) {
            uiUpdateApp();
        } else {
            EIMZOClient.installApiKeys(function () {
                uiAppLoad();
            }, function (e, r) {
                if (r) {
                    uiShowMessage(r);
                } else {
                    wsError(e);
                }
            });
        }
    }, function (e, r) {
        if (r) {
            uiShowMessage(r);
        } else {
            uiNotLoaded(e);
        }
    });
}

function uiHideProgress() {
    // hide loaging indicator
}

function uiLoading() {
    // show loaging indicator
}

function uiLoaded() {
    // hide loaging indicator
}

function uiShowMessage(message) {
    // $Toast.error(message)
}

function uiUpdateApp() {
    // show message "Update E-IMZO"
}

function uiNotLoaded(e) {
    // show message "E-IMZO not installed"
    uiShowMessage(errorCAPIWS + " : " + wsErroCodeDesc(e));
}

function wsErroCodeDesc(code) {
    let reason;
    if (code == 1000)
        reason = code + " - " + "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
    else if (code == 1001)
        reason = code + " - " + "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
    else if (code == 1002)
        reason = code + " - " + "An endpoint is terminating the connection due to a protocol error";
    else if (code == 1003)
        reason = code + " - " + "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
    else if (code == 1004)
        reason = code + " - " + "Reserved. The specific meaning might be defined in the future.";
    else if (code == 1005)
        reason = code + " - " + "No status code was actually present.";
    else if (code == 1006)
        reason = code + " - " + "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
    else if (code == 1007)
        reason = code + " - " + "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message.";
    else if (code == 1008)
        reason = code + " - " + "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
    else if (code == 1009)
        reason = code + " - " + "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
    else if (code == 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
        reason = code + " - " + "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake.";
    else if (code == 1011)
        reason = code + " - " + "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
    else if (code == 1015)
        reason = code + " - " + "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
    else
        reason = code;
    return reason;
};

function wsError(e) {
    if (e) {
        uiShowMessage(errorCAPIWS + " : " + wsErroCodeDesc(e));
    } else {
        uiShowMessage(errorBrowserWS);
    }
}

function uiAppLoad() {
    // Load your App
}

function uiHandleError(e, r) {
    console.log('error')
    uiHideProgress();
    if (r) {
        if (r.indexOf("BadPaddingException") !== -1) {
            uiShowMessage(errorWrongPassword);
        } else {
            uiShowMessage(r);
        }
    } else {
        uiShowMessage(errorBrowserWS);
    }
    if (e) wsError(e);

}
