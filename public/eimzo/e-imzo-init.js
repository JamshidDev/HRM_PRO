let EIMZO_MAJOR = 3;
let EIMZO_MINOR = 37;

var EIMZO_MESSAGES = {
    uz: {
        errorCAPIWS: "E-IMZO ga ulanishda xatolik yuz berdi. Sizda E-IMZO moduli yoki E-IMZO brauzeri o'rnatilmagan bo'lishi mumkin!",
        errorBrowserWS: "Brauzer WebSocket texnologiyasini qo'llab-quvvatlamaydi. Brauzeringizning eng so'nggi versiyasini o'rnating.",
        errorUpdateApp: "DIQQAT!!! E-IMZO ilovasining yangi versiyasini yoki E-IMZO brauzerini o'rnating.",
        errorWrongPassword: "Parol noto'g'ri terildi"
    },
    ru: {
        errorCAPIWS: "Ошибка подключения к E-IMZO. Возможно, у вас не установлен модуль или браузер E-IMZO!",
        errorBrowserWS: "Ваш браузер не поддерживает технологию WebSocket. Установите последнюю версию браузера.",
        errorUpdateApp: "ВНИМАНИЕ!!! Установите новую версию приложения E-IMZO или браузера E-IMZO.",
        errorWrongPassword: "Неверно введён пароль"
    },
    en: {
        errorCAPIWS: "Failed to connect to E-IMZO. The E-IMZO module or E-IMZO browser may not be installed!",
        errorBrowserWS: "Your browser does not support WebSocket. Please install the latest version of your browser.",
        errorUpdateApp: "ATTENTION!!! Please install a new version of the E-IMZO app or E-IMZO browser.",
        errorWrongPassword: "Incorrect password entered"
    },
    uz_kr: {
        errorCAPIWS: "Э-ИМЗО га уланишда хатолик юз берди. Сизда Э-ИМЗО модули ёки Э-ИМЗО браузери ўрнатилмаган бўлиши мумкин!",
        errorBrowserWS: "Браузер WebSocket технологиясини қўллаб-қувватламайди. Браузерингизнинг энг сўнгги версиясини ўрнатинг.",
        errorUpdateApp: "ДИҚҚАТ!!! Э-ИМЗО иловасининг янги версиясини ёки Э-ИМЗО браузерини ўрнатинг.",
        errorWrongPassword: "Парол нотўғри терилди"
    }
};

function getEimzoLang() {
    var lang = (typeof localStorage !== 'undefined' && localStorage.getItem('app-language')) || 'uz';
    return EIMZO_MESSAGES[lang] ? lang : 'uz';
}

var errorCAPIWS = EIMZO_MESSAGES[getEimzoLang()].errorCAPIWS;
var errorBrowserWS = EIMZO_MESSAGES[getEimzoLang()].errorBrowserWS;
var errorUpdateApp = EIMZO_MESSAGES[getEimzoLang()].errorUpdateApp;
var errorWrongPassword = EIMZO_MESSAGES[getEimzoLang()].errorWrongPassword;

function AppLoad() {
    EIMZOClient.API_KEYS = [
        'localhost', '96D0C1491615C82B9A54D9989779DF825B690748224C2B04F500F370D51827CE2644D8D4A82C18184D73AB8530BB8ED537269603F61DB0D03D2104ABF789970B',
        '127.0.0.1', 'A7BCFA5D490B351BE0754130DF03A068F855DB4333D43921125B9CF2670EF6A40370C646B90401955E1F7BC9CDBF59CE0B2C5467D820BE189C845D0B79CFC96F',
        'hrm.railway.uz', '6B4B7F0484E4A16D405B33F3DAE52B3D0266BEF9184F426ADA92FDF9423FC09FD6C80A769FC64EB1CA34A6E7645D0795E4DD4CF5FE49E4642B4F2263BC5F9C38'
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
    if (typeof window !== 'undefined' && window.$Toast && window.$Toast.error) {
        window.$Toast.error(message);
    }
}

function uiUpdateApp() {
    // show message "Update E-IMZO"
}

function uiNotLoaded(e) {
    // Ilova bu holat uchun o'z xabarini ko'rsatadi (signature.connectionError),
    // shuning uchun bu yerda takroriy toast chiqarilmaydi.
    console.warn("E-IMZO not loaded:", wsErroCodeDesc(e) || e);
}

function wsErroCodeDesc(code) {
    // WebSocket xatosi Event obyekti bo'lib kelishi mumkin — u holda "[object Event]"
    // yozuvini ko'rsatmaymiz, faqat tushunarli xabar qoladi.
    if (typeof code !== "number") return "";
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
    // Takroriy xabar bermaymiz — ilova o'z toastini ko'rsatadi.
    if (e) {
        console.warn("E-IMZO ws error:", wsErroCodeDesc(e) || e);
    } else {
        uiShowMessage(errorBrowserWS);
    }
}

function uiAppLoad() {
    // Load your App
}

function uiHandleError(e, r) {
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
