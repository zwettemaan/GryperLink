/**
 * Creative Developer Tools (CRDT) is a growing suite of tools aimed at script developers and plug-in developers for the Adobe Creative Cloud eco-system.
 *
 * There are two different versions of CRDT: one for UXP/UXPScript and another for ExtendScript.
 *
 * For downloading and installation info, visit
 *
 * https://CreativeDeveloperTools.com
 *
 *  `crdtuxp` contains a number of useful functions. Some of these functions
 * are implemented in JavaScript in `crdtux.js` and are synchronous.
 *
 * Other functions are delegated to a daemon process, and are always asynchronous.
 *
 * The list of endpoints is further down
 *
 * `crdtuxp` steps out of the UXP security sandbox - which means that as a developer,
 * you need to be judicious when using this.
 *
 * Every solution operates in a unique context. The UXP security measures are
 * helpful in keeping things secure, but in many situations, they are a massive overkill.
 *
 * It should be up to the user/developer/IT department to decide how to handle security.
 *
 * Sometimes the whole workflow can live inside walled garden, on a disconnected network, 
 * without any contact with the outside world and not be allowed to run any
 * unvetted software.
 *
 * Or sometimes the OS security is safe enough for the workflow at hand.
 *
 * In those cases, the UXP security measures are counter-productive: they represent
 * unnessary hurdles to the software development, or make the user interace clunky and
 * user-unfriendly.
 *
 * Using the UXP sandboxing should be a developer-selectable option, not an enforced requirement, and it should
 * be up to the developer and/or the IT department to decide what is appropriate and what not.
 *
 * @module crdtuxp
 */

const DEFAULT_WAIT_FILE_INTERVAL_MILLISECONDS   = 1000;
const DEFAULT_WAIT_FILE_TIMEOUT_MILLISECONDS    = 60000;

const UXP_VARIANT_PHOTOSHOP_UXP                 = "UXP_VARIANT_PHOTOSHOP_UXP";
const UXP_VARIANT_PHOTOSHOP_UXPSCRIPT           = "UXP_VARIANT_PHOTOSHOP_UXPSCRIPT";
const UXP_VARIANT_INDESIGN_UXP                  = "UXP_VARIANT_INDESIGN_UXP";
const UXP_VARIANT_INDESIGN_UXPSCRIPT            = "UXP_VARIANT_INDESIGN_UXPSCRIPT";
const UXP_VARIANT_INDESIGN_SERVER_UXPSCRIPT     = "UXP_VARIANT_INDESIGN_SERVER_UXPSCRIPT";

const FILE_NAME_EXTENSION_JSON                  = "json";
const FILE_NAME_SUFFIX_TQL_REQUEST              = "q";
const FILE_NAME_SUFFIX_TQL_RESPONSE             = "r";

const LENGTH_REQUEST_ID                         =  10;

const RESOLVED_PROMISE_UNDEFINED                = Promise.resolve(undefined);
const RESOLVED_PROMISE_FALSE                    = Promise.resolve(false);
const RESOLVED_PROMISE_TRUE                     = Promise.resolve(true);

function getPlatformGlobals() {
    return global;
}

let platformGlobals = getPlatformGlobals();
platformGlobals.getPlatformGlobals = getPlatformGlobals;
platformGlobals.defineGlobalObject = function defineGlobalObject(globalName) {
    if (! platformGlobals[globalName]) {
        platformGlobals[globalName] = {};
    }
    return platformGlobals[globalName];
}

/**
 * `localhost.tgrg.net` resolves to `127.0.0.1`
 *
 * The Tightener daemon manages the necessary certificate for https
 *
 * @constant {string} DNS_NAME_FOR_LOCALHOST
 */

const DNS_NAME_FOR_LOCALHOST = "localhost.tgrg.net";

/**
 * The Tightener daemon listens for HTTPS connections on port `18888`.
 *
 * @constant {number} PORT_TIGHTENER_DAEMON
 */
const PORT_TIGHTENER_DAEMON = 18888;

const LOCALHOST_URL = "https://" + DNS_NAME_FOR_LOCALHOST+ ":" + PORT_TIGHTENER_DAEMON;

/**
 * The Tightener daemon provides persistent named scopes (similar to persistent ExtendScript engines).
 *
 * When executing multiple TQL scripts in succession a named scope will retain any globals that
 * were defined by a previous script.
 *
 * @constant {string} TQL_SCOPE_NAME_DEFAULT
 */
const TQL_SCOPE_NAME_DEFAULT = "defaultScope";

const PLATFORM_MAC_OS_X = "darwin";

if (! module.exports) {
    module.exports = {};
}
let crdtuxp = module.exports;

module.exports.IS_MAC = require('os').platform() == PLATFORM_MAC_OS_X;
module.exports.IS_WINDOWS = ! module.exports.IS_MAC;
let FILE_NOT_EXIST_ERROR;
if (module.exports.IS_MAC) {
    FILE_NOT_EXIST_ERROR = -2;
}
else {
    FILE_NOT_EXIST_ERROR = -4058;
}

module.exports.path = {};
if (module.exports.IS_MAC) {
    module.exports.path.SEPARATOR = "/";
    module.exports.path.OTHER_PLATFORM_SEPARATOR = "\\";
}
else {
    module.exports.path.SEPARATOR = "\\";
    module.exports.path.OTHER_PLATFORM_SEPARATOR = "/";
}

/**
 * Setting log level to `LOG_LEVEL_OFF` causes all log output to be suppressed.
 *
 * @constant {number} LOG_LEVEL_OFF
 */
const LOG_LEVEL_OFF = 0;
module.exports.LOG_LEVEL_OFF = LOG_LEVEL_OFF;

/**
 * Setting log level to `LOG_LEVEL_ERROR` causes all log output to be suppressed,
 * except for errors.
 *
 * @constant {number} LOG_LEVEL_ERROR
 */
const LOG_LEVEL_ERROR = 1;
module.exports.LOG_LEVEL_ERROR = LOG_LEVEL_ERROR;

/**
 * Setting log level to `LOG_LEVEL_WARNING` causes all log output to be suppressed,
 * except for errors and warnings.
 *
 * @constant {number} LOG_LEVEL_WARNING
 */
const LOG_LEVEL_WARNING = 2;
module.exports.LOG_LEVEL_WARNING = LOG_LEVEL_WARNING;

/**
 * Setting log level to `LOG_LEVEL_NOTE` causes all log output to be suppressed,
 * except for errors, warnings and notes.
 *
 * @constant {number} LOG_LEVEL_NOTE
 */
const LOG_LEVEL_NOTE = 3;
module.exports.LOG_LEVEL_NOTE = LOG_LEVEL_NOTE;

/**
 * Setting log level to `LOG_LEVEL_TRACE` causes all log output to be output.
 *
 * @constant {number} LOG_LEVEL_TRACE
 */
const LOG_LEVEL_TRACE = 4;
module.exports.LOG_LEVEL_TRACE = LOG_LEVEL_TRACE;

// Symbolic params to `getDir()`

/**
 * Pass `DESKTOP_DIR` into `getDir()` to get the path of the user's Desktop folder.
 *
 * @constant {string} DESKTOP_DIR
 */
module.exports.DESKTOP_DIR    = "DESKTOP_DIR";

/**
 * Pass `DOCUMENTS_DIR` into `getDir()` to get the path of the user's Documents folder.
 *
 * @constant {string} DOCUMENTS_DIR
 */
module.exports.DOCUMENTS_DIR  = "DOCUMENTS_DIR";

/**
 * Pass `HOME_DIR` into `getDir()` to get the path of the user's home folder.
 *
 * @constant {string} HOME_DIR
 */
module.exports.HOME_DIR       = "HOME_DIR";

/**
 * Pass `LOG_DIR` into `getDir()` to get the path of the Tightener logging folder.
 *
 * @constant {string} LOG_DIR
 */
module.exports.LOG_DIR        = "LOG_DIR";

/**
 * Pass `SYSTEMDATA_DIR` into `getDir()` to get the path of the system data folder
 * (`%PROGRAMDATA%` or `/Library/Application Support`).
 *
 * @constant {string} SYSTEMDATA_DIR
 */
module.exports.SYSTEMDATA_DIR = "SYSTEMDATA_DIR";

/**
 * Pass `TMP_DIR` into `getDir()` to get the path of the temporary folder.
 *
 * @constant {string} TMP_DIR
 */
module.exports.TMP_DIR        = "TMP_DIR";

/**
 * Pass `USERDATA_DIR` into `getDir()` to get the path to the user data folder
 * (`%APPDATA%` or `~/Library/Application Support`).
 *
 * @constant {string} USERDATA_DIR
 */
module.exports.USERDATA_DIR   = "USERDATA_DIR";

/**
 * `UNIT_NAME_NONE` represents unit-less values.
 */
module.exports.UNIT_NAME_NONE     = "NONE";

/**
 * `UNIT_NAME_INCH` for inches.
 */
module.exports.UNIT_NAME_INCH     = "\"";

/**
 * `UNIT_NAME_CM` for centimeters
 */
module.exports.UNIT_NAME_CM       = "cm";

/**
 * `UNIT_NAME_MM` for millimeters
 */
module.exports.UNIT_NAME_MM       = "mm";

/**
 * `UNIT_NAME_CICERO` for ciceros
 */
module.exports.UNIT_NAME_CICERO   = "cicero";

/**
 * `UNIT_NAME_PICA` for picas
 */
module.exports.UNIT_NAME_PICA     = "pica";

/**
 * `UNIT_NAME_PIXEL` for pixels
 */
module.exports.UNIT_NAME_PIXEL    = "px";

/**
 * `UNIT_NAME_POINT` for points
 */
module.exports.UNIT_NAME_POINT    = "pt";

// INI parser states
const STATE_IDLE                               =  0;
const STATE_SEEN_OPEN_SQUARE_BRACKET           =  1;
const STATE_SEEN_NON_WHITE                     =  2;
const STATE_AFTER_NON_WHITE                    =  3;
const STATE_SEEN_EQUAL                         =  4;
const STATE_ERROR                              =  5;
const STATE_SEEN_CLOSE_SQUARE_BRACKET          =  6;
const STATE_IN_COMMENT                         =  7;

// INI value string processing helpers
const REGEXP_TRIM                              = /^\s*(\S?.*?)\s*$/;
const REGEXP_TRIM_REPLACE                      = "$1";
const REGEXP_DESPACE                           = /\s+/g;
const REGEXP_DESPACE_REPLACE                   = "";
const REGEXP_ALPHA_ONLY                        = /[^-a-zA-Z0-9$]+/g;
const REGEXP_ALPHA_ONLY_REPLACE                = "";
const REGEXP_SECTION_NAME_ONLY                 = /[^-a-zA-Z0-9$:]+/g;
const REGEXP_SECTION_NAME_ONLY_REPLACE         = "";
const REGEXP_NUMBER_ONLY                       = /^([\d\.]+).*$/;
const REGEXP_NUMBER_ONLY_REPLACE               = "$1";
const REGEXP_UNIT_ONLY                         = /^[\d\.]+\s*(.*)$/;
const REGEXP_UNIT_ONLY_REPLACE                 = "$1";
const REGEXP_PICAS                             = /^([\d]+)p(([\d]*)(\.([\d]+)?)?)?$/;
const REGEXP_PICAS_REPLACE                     = "$1";
const REGEXP_PICAS_POINTS_REPLACE              = "$2";
const REGEXP_CICEROS                           = /^([\d]+)c(([\d]*)(\.([\d]+)?)?)?$/;
const REGEXP_CICEROS_REPLACE                   = "$1";
const REGEXP_CICEROS_POINTS_REPLACE            = "$2";

const LOCALE_EN_US                             = "en_US";

const DEFAULT_LOCALE                           = LOCALE_EN_US;

const BTN_OK                                   = "BTN_OK";
const TTL_DIALOG_ALERT                         = "TTL_DIALOG_ALERT";

let LOCALE_STRINGS                             = {
    BTN_OK: {
        "en_US": "OK"
    },
    TTL_DIALOG_ALERT: {
        "en_US": "Alert"
    }
};

module.exports.LOCALE                          = DEFAULT_LOCALE;
module.exports.LOCALE_STRINGS                  = LOCALE_STRINGS;

//
// UXP internally caches responses from the server - we need to avoid this as each script
// run can return different results. `HTTP_CACHE_BUSTER` will be incremented after each use.
//
let HTTP_CACHE_BUSTER         = Math.floor(Math.random() * 1000000);
let LOG_LEVEL_STACK           = [];
let LOG_ENTRY_EXIT            = false;
let LOG_LEVEL                 = LOG_LEVEL_OFF;
let IN_LOGGER                 = false;
let LOG_TO_UXPDEVTOOL_CONSOLE = true;
let LOG_TO_CRDT               = false;
let LOG_TO_FILEPATH           = undefined;

// Inefficient logging using readSync/writeSync
let SYNC_LOG_TO_FILEPATH      = undefined;

let SYS_INFO;

/**
 * Make sure a path ends in a trailing separator (helps identify directory paths)
 *
 * @function addTrailingSeparator
 *
 * @param {string} filePath - a file path 
 * @param {string=} separator - the separator to use. If omitted, will try 
 * guess the separator.
 * @returns file path with a terminating separator
 */

function addTrailingSeparator(filePath, separator) {
// coderstate: function
    let retVal = filePath;

    do {

        try {

            if (! filePath) {
                break; 
            }

            const lastChar = filePath.substr(-1); 
            if (
                lastChar == crdtuxp.path.SEPARATOR 
            || 
                lastChar == crdtuxp.path.OTHER_PLATFORM_SEPARATOR
            ) {
                break;
            }

            if (! separator) {
                separator = crdtuxp.path.SEPARATOR;
            }

            retVal += separator;

        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}

module.exports.path.addTrailingSeparator = addTrailingSeparator;

/**
 * Show an alert.
 *
 * @function alert
 *
 * @param {string} message - string to display
 * @returns {Promise<any>}
 */

function alert(message) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            var uxpContext = getUXPContext();
            if (uxpContext.uxpVariant == UXP_VARIANT_INDESIGN_SERVER_UXPSCRIPT) {
                // We've lost access to the alert() function in InDesign Server, which writes
                // to stdout.
                // The only workaround I currently have is to pass through ExtendScript
                uxpContext.app.doScript(
                    "alert(" + crdtuxp.dQ(message) + ")", 
                    uxpContext.indesign.ScriptLanguage.JAVASCRIPT);
                retVal = true;
                break;
            }

            if (uxpContext.uxpVariant == UXP_VARIANT_INDESIGN_UXPSCRIPT) {

                // InDesign dialogs are not async - they stall the thread until they 
                // are closed

                const dlg = uxpContext.app.dialogs.add();
                const col = dlg.dialogColumns.add();
                const stText = col.staticTexts.add();
                stText.staticLabel = "" + message;
                dlg.canCancel = false;
                dlg.show();
                dlg.destroy(); 
                retVal = true;
                break;
            }

            if (
                uxpContext.uxpVariant == UXP_VARIANT_PHOTOSHOP_UXP 
            || 
                uxpContext.uxpVariant == UXP_VARIANT_PHOTOSHOP_UXPSCRIPT
            ) {

                function modalDialog() {

                    const dlg = document.createElement("dialog");
                    const frm = document.createElement("form");
                    const bdy = document.createElement("sp-body");
                    bdy.textContent = message;
                    frm.appendChild(bdy);

                    const buttonContainer = document.createElement("div");
                    buttonContainer.style.display = "flex";
                    buttonContainer.style.justifyContent = "flex-end";
                    frm.appendChild(buttonContainer);

                    const btnOK = document.createElement("sp-button");
                    buttonContainer.appendChild(btnOK);

                    btnOK.textContent = S(BTN_OK);

                    btnOK.onclick = function onClick() {
                        dlg.close();
                    };

                    dlg.appendChild(frm);
                    document.body.appendChild(dlg); 
                    return dlg.uxpShowModal(
                        {
                            title: S(TTL_DIALOG_ALERT),
                            resize: "none", 
                            size: { width: 400, height: 100} 
                        }
                    );
                }

                function executeAsModalResolveFtn() {
                    // coderstate: resolver
                    return true;
                };                
                function executeAsModalRejectFtn(reason) {
                    // coderstate: rejector
                    crdtuxp.logError(arguments, "rejected for " + reason);
                    return undefined;
                };

                retVal = 
                    uxpContext.photoshop.core.executeAsModal(
                        modalDialog, 
                        {
                            "commandName": "alert message"
                        }
                    ).then(
                        executeAsModalResolveFtn,
                        executeAsModalRejectFtn);

                break;
            }
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.alert = alert;

/**
 * Decode a string that was encoded using base64.
 *
 * The evalTQL variant of the function has not been speed-tested; it's mainly for 
 * testing things.
 *
 * I suspect it might only be beneficial for very large long strings, if that. 
 * The overheads might be larger than the speed benefit.
 *
 * @function base64decode
 *
 * @param {string} base64Str - base64 encoded string
 * @param {object=} options - options: {
 *   isBinary: true/false, default false
 * }
 * @returns {Promise<string|array|undefined>} decoded string
 */
function base64decode(base64Str, options) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            let isBinary = options && options.isBinary;                        

            let context = getContext();
            if (! context.IS_FORCE_USE_DAEMON) {

                let rawString = window.atob(base64Str);
                let byteArray = rawStringToByteArray(rawString);
                if (isBinary) {
                    retVal = byteArray;
                }
                else {
                    retVal = binaryUTF8ToStr(byteArray);
                }
                break;
            }

            let evalTQLOptions = {
                isBinary: isBinary
            };

            let responsePromise = 
                evalTQL(
                    "base64decode(" + dQ(base64Str) + ")",
                    evalTQLOptions
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    if (isBinary) {
                        retVal = deQuote(response.text);
                    }
                    else {
                        retVal = response.text;
                    }
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };
            
            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal; 
}
module.exports.base64decode = base64decode;

/**
 * Encode a string or an array of bytes using Base 64 encoding.
 *
 * The evalTQL variant of the function has not been speed-tested; it's mainly for 
 * testing things.
 *
 * I suspect it might only be beneficial for very large long strings, if that. 
 * The overheads might be larger than the speed benefit.
 *
 * @function base64encode
 *
 * @param {string} s_or_ByteArr - either a string or an array containing bytes (0-255).
 * @returns {Promise<string|undefined>} encoded string
 *
 */
function base64encode(s_or_ByteArr) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            let context = getContext();
            if (! context.IS_FORCE_USE_DAEMON) {

                let byteArray;
                if ("string" == typeof s_or_ByteArr) {
                    byteArray = strToUTF8(s_or_ByteArr);
                }
                else {
                    byteArray = s_or_ByteArr;
                }

                let rawString = byteArrayToRawString(byteArray);

                retVal = window.btoa(rawString);

                break;
            }

            const responsePromise = 
                evalTQL(
                    "base64encode(" + dQ(s_or_ByteArr) + ")"
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    try {
                        if (! response || response.error) {
                            crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                            break;
                        }

                        retVal = response.text;
                    }
                    catch (err) {
                        crdtuxp.logError(arguments, "throws " + err);                        
                    }
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal; 
}
module.exports.base64encode = base64encode;

/**
 * Get the last segment of a path
 *
 * @function baseName
 *
 * @param {string} filePath - a file path 
 * @param {string=} separator - the separator to use. If omitted, will try 
 * guess the separator.
 * @returns {string} the last segment of the path
 */

function baseName(filePath, separator) { 
// coderstate: function
    let endSegment;

    try {
        if (! separator) {
            separator = crdtuxp.path.SEPARATOR;
        }

        // toString() handles cases where filePath is not a real string
        let splitPath = filePath.toString().split(separator);
        do {
            endSegment = splitPath.pop(); 
        }
        while (splitPath.length > 0 && endSegment == "");
    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return endSegment;
}
module.exports.path.baseName = baseName;

/**
 * Decode an array of bytes that contains a UTF-8 encoded string.
 *
 * @function binaryUTF8ToStr
 *
 * @param {array} in_byteArray - an array containing bytes (0-255)
 * for a string using UTF-8 encoding.
 * @returns {string|undefined} a string or undefined if the UTF-8 is not valid
 */
function binaryUTF8ToStr(in_byteArray) {
// coderstate: function
    let retVal = undefined;

    try {
        let idx = 0;
        let len = in_byteArray.length;
        let c;
        while (idx < len) {
            let byte = in_byteArray[idx];
            idx++;
            let bit7 = byte >> 7;
            if (! bit7) {
                // U+0000 - U+007F
                c = String.fromCharCode(byte);
            }
            else {
                let bit6 = (byte & 0x7F) >> 6;
                if (! bit6) {
                    // Invalid
                    retVal = undefined;
                    break;
                }
                else {
                    let byte2 = in_byteArray[idx];
                    idx++;
                    let bit5 = (byte & 0x3F) >> 5;
                    if (! bit5) {
                        // U+0080 - U+07FF
                        c = String.fromCharCode(((byte & 0x1F) << 6) | (byte2 & 0x3F));
                    }
                    else {
                        let byte3 = in_byteArray[idx];
                        idx++;
                        let bit4 = (byte & 0x1F) >> 4;
                        if (! bit4) {
                            // U+0800 - U+FFFF
                            c = String.fromCharCode(
                                    ((byte & 0x0F) << 12) | 
                                    ((byte2 & 0x3F) << 6) | 
                                    (byte3 & 0x3F)
                                );
                        }
                        else {
                            // Not handled U+10000 - U+10FFFF
                            retVal = undefined;
                            break;
                        }
                    }
                }
            }
            if (! retVal) {
                retVal = "";
            }
            retVal += c;
        }
    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
        retVal = undefined;
    }

    return retVal;
}
module.exports.binaryUTF8ToStr = binaryUTF8ToStr;

/**
 * Make a byte array into a 'fake string'. Not UTF8-aware
 *
 * @function byteArrayToRawString
 *
 * @param {string} in_byteArray - a byte array
 * @returns {string|undefined} a string with the exact same bytes
 */
function byteArrayToRawString(in_array) {
// coderstate: function
    let retVal = "";

    try {

        for (let idx = 0; idx < in_array.length; idx++) {
            retVal += String.fromCharCode(in_array[idx]);
        }

    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return retVal;
}
module.exports.byteArrayToRawString = byteArrayToRawString;

/**
 * Internal: convert a Unicode character code to a 1 to 3 byte UTF8 byte sequence
 *
 * @function charCodeToUTF8__
 *
 * @param {number} in_charCode - a Unicode character code 
 * @returns {array} an array with 1 to 3 bytes
 */

function charCodeToUTF8__(in_charCode) {
// coderstate: function
    let retVal = undefined;

    try {

        if (in_charCode <= 0x007F) {
            retVal = [];
            retVal.push(in_charCode);
        }
        else if (in_charCode <= 0x07FF) {
            const hi = 0xC0 + ((in_charCode >> 6) & 0x1F);
            const lo = 0x80 + ((in_charCode      )& 0x3F);
            retVal = [];
            retVal.push(hi);
            retVal.push(lo);
        }
        else {
            const hi =  0xE0 + ((in_charCode >> 12) & 0x1F);
            const mid = 0x80 + ((in_charCode >>  6) & 0x3F);
            const lo =  0x80 + ((in_charCode      ) & 0x3F);
            retVal = [];
            retVal.push(hi);
            retVal.push(mid);
            retVal.push(lo);
        }
    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
        // anything weird, we return undefined
        retVal = undefined;
    }

    return retVal;
}

/**
 * Configure the logger
 *
 * @function configLogger
 *
 * @param {object} logInfo - object with logger setup info
 *     logLevel: 0-4
 *     logEntryExit: boolean
 *     logToUXPConsole: boolean
 *     logToCRDT: boolean
 *     logToFilePath: undefined or a file path for logging
 * 
 * @returns {boolean} success/failure
 */
function configLogger(logInfo) {
// coderstate: function
    let retVal = false;

    do {
        try {

            if (! logInfo) {
                break;
            }

            if ("logLevel" in logInfo) {
                LOG_LEVEL = logInfo.logLevel;
            }
            if ("logEntryExit" in logInfo) {
                LOG_ENTRY_EXIT = logInfo.logEntryExit;
            }
            if ("logToUXPConsole" in logInfo) {
                LOG_TO_UXPDEVTOOL_CONSOLE = logInfo.logToUXPConsole;
            }
            if ("logToCRDT" in logInfo) {
                LOG_TO_CRDT = logInfo.logToCRDT;
            }
            if ("logToFilePath" in logInfo) {
                LOG_TO_FILEPATH = logInfo.logToFilePath;
            }
            if ("syncLogToFilePath" in logInfo) {
                SYNC_LOG_TO_FILEPATH = logInfo.syncLogToFilePath;
            }
            retVal = true;
        }
        catch (err) {
            consoleLog("configLogger throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.configLogger = configLogger;

/**
 * Bottleneck for `console.log`
 *
 * @function consoleLog
 *
 * @param {...*} args - args for function
 */
function consoleLog(...args) {
// coderstate: function
    console.log(...args);

    if (SYNC_LOG_TO_FILEPATH) {
        fileAppend_(SYNC_LOG_TO_FILEPATH, args[0] + "\n");
    }

}
module.exports.consoleLog = consoleLog;

/**
 * Reverse the operation of the `encrypt()` function.
 *
 * Only available to paid developer accounts
 *
 * @function decrypt
 *
 * @param {string} s_or_ByteArr - a string or an array of bytes
 * @param {string} aesKey - a string or an array of bytes
 * @returns {Promise<Array|undefined>} an array of bytes
 */

function decrypt(s_or_ByteArr, aesKey, aesIV) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            if (! aesIV) {
                aesIV = "";
            }

            const responsePromise = 
                evalTQL(
                    "decrypt(" + 
                        dQ(s_or_ByteArr) + ", " + 
                        dQ(aesKey) + ", " + 
                        dQ(aesIV) + 
                    ")"
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text;
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.decrypt = decrypt;

/**
 * Delayed execution of a function
 *
 * @function delayFunction
 *
 * @param {number} delayTimeMilliseconds - a delay in milliseconds
 * @param {function} ftn - a function
 * @param {...*} args - optional args for function
 * @returns {Promise<any>}
 */
function delayFunction(delayTimeMilliseconds, ftn, ...args) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    try {

        function executor(resolveFtn, rejectFtn) {
            // coderstate: executor

            function timeoutFtn() {
                // coderstate: executor
                try {
                    let result = ftn(...args);
                    if (result instanceof Promise) {
                        result.then(
                            resolveFtn,
                            rejectFtn
                        );
                    }
                    else {
                        resolveFtn(result);
                    }
                } 
                catch (err) {
                    rejectFtn(err);
                } 
            };
            setTimeout(
                timeoutFtn,
                delayTimeMilliseconds
            );
        };

        retVal = new Promise(executor);
    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return retVal;
}
module.exports.delayFunction = delayFunction;

/**
 * Reverse the operation of `dQ()` or `sQ()`.
 *
 * @function deQuote
 *
 * @param {string} quotedString - a quoted string
 * @returns {array} a byte array. If the quoted string contains any `\uHHHH` codes,
 * these are first re-encoded using UTF-8 before storing them into the byte array.
 */
function deQuote(quotedString) {
// coderstate: function
    let retVal = [];

    let state = -1;
    let buffer = [];

    do {

        try {

            let qLen = quotedString.length;
            if (qLen < 2) {
                retVal = quotedString;
                break;
            }

            const quoteChar = quotedString.charAt(0);
            qLen -= 1;
            if (quoteChar != quotedString.charAt(qLen)) {
                retVal = quotedString;
                break;
            }

            if (quoteChar != '"' && quoteChar != "'") {
                retVal = quotedString;
                break;
            }

            state = 0;
            let cCode = 0;
            for (let charIdx = 1; charIdx < qLen; charIdx++) {

                if (state == -1) {
                    break;
                }

                const c = quotedString.charAt(charIdx);
                switch (state) {
                case 0:
                    if (c == '\\') {
                        state = 1;
                    }
                    else {
                        buffer.push(c.charCodeAt(0));
                    }
                    break;
                case 1:
                    if (c == 'x') {
                        // state 2->3->0
                        state = 2;
                    }
                    else if (c == 'u') {
                        // state 4->5->6->7->0
                        state = 4;
                    }
                    else if (c == 't') {
                        buffer.push(0x09);
                        state = 0;
                    }
                    else if (c == 'r') {
                        buffer.push(0x0D);
                        state = 0;
                    }
                    else if (c == 'n') {
                        buffer.push(0x0A);
                        state = 0;
                    }
                    else {
                        buffer.push(c.charCodeAt(0));
                        state = 0;
                    }
                    break;
                case 2:
                case 4:
                    if (c >= '0' && c <= '9') {
                        cCode = c.charCodeAt(0)      - 0x30;
                        state++;
                    }
                    else if (c >= 'A' && c <= 'F') {
                        cCode = c.charCodeAt(0) + 10 - 0x41;
                        state++;
                    }
                    else if (c >= 'a' && c <= 'f') {
                        cCode = c.charCodeAt(0) + 10 - 0x61;
                        state++;
                    }
                    else {
                        state = -1;
                    }
                    break;
                case 3:
                case 5:
                case 6:
                case 7:

                    if (c >= '0' && c <= '9') {
                        cCode = (cCode << 4) + c.charCodeAt(0)      - 0x30;
                    }
                    else if (c >= 'A' && c <= 'F') {
                        cCode = (cCode << 4) + c.charCodeAt(0) + 10 - 0x41;
                    }
                    else if (c >= 'a' && c <= 'f') {
                        cCode = (cCode << 4) + c.charCodeAt(0) + 10 - 0x61;
                    }
                    else {
                        state = -1;
                    }

                    if (state == 3)  {
                        // Done with \xHH
                        buffer.push(cCode);
                        state = 0;
                    }
                    else if (state == 7) {
                        // Done with \uHHHHH - convert using UTF-8
                        let bytes = charCodeToUTF8__(cCode);
                        if (! bytes) {
                            state = -1
                        }
                        else {
                            for (let byteIdx = 0; byteIdx < bytes.length; byteIdx++) {
                                buffer.push(bytes[byteIdx]);
                            }
                            state = 0;
                        }
                    }
                    else {
                        // Next state: 2->3, 4->5->6->7
                        state++;
                    }
                    break;
                }
            }
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    if (state == 0) {
        retVal = buffer;
    }

    return retVal;
}
module.exports.deQuote = deQuote;

/**
 * Create a directory.
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function dirCreate
 *
 * @param {string} filePath
 * @returns {Promise<boolean|undefined>} success or failure
 */

function dirCreate(filePath) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            let context = getUXPContext();
            let uxpContext = getUXPContext();
            if (uxpContext.hasDirectFileAccess && ! context.IS_FORCE_USE_DAEMON) {

                let parentPath = crdtuxp.path.dirName(filePath);
                let baseName = crdtuxp.path.baseName(filePath);

                // https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/fs/
                try {
                    const stats = uxpContext.fs.lstatSync(parentPath);
                    if (! stats || ! stats.isDirectory()) {
                        retVal = false;
                        break;
                    } 
                }
                catch (err) {
                    if (err != FILE_NOT_EXIST_ERROR) {
                        crdtuxp.logNote(arguments, "throws " + err);
                    }
                    break;
                }

                try {
                    const stats = uxpContext.fs.lstatSync(filePath);
                    if (stats) {
                        retVal = false;
                        break;
                    }
                }
                catch (err) {
                    if (err != FILE_NOT_EXIST_ERROR) {
                        crdtuxp.logNote(arguments, "throws " + err);
                    }
                }

                try {
                    function mkdirResolveFtn() {
                        // coderstate: resolver
                        return true;
                    };
                    function mkdirRejectFtn(reason) {
                        // coderstate: rejector
                        crdtuxp.logError(arguments, "rejected for " + reason);
                        return false;
                    };
                    // If no callback given, returns a Promise
                    retVal = uxpContext.fs.mkdir(filePath).then(
                        mkdirResolveFtn,
                        mkdirRejectFtn
                    );
                }
                catch (err) {
                    crdtuxp.logError(arguments, "throws " + err);
                }
                break;
            }

            const responsePromise = 
                evalTQL(
                    "dirCreate(" + dQ(filePath) + ") ? \"true\" : \"false\""
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text == "true";
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.dirCreate = dirCreate;

/**
 * Delete a directory.
 *
 * Not restricted by the UXP security sandbox.
 *
 * Be very careful with the `recurse` parameter! It is very easy to delete the wrong 
 * directory.
 *
 * @function dirDelete
 *
 * @param {string} filePath
 * @param {boolean} recurse
 * @returns {Promise<boolean|undefined>} success or failure
 */

function dirDelete(filePath, recurse) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            let context = getUXPContext();
            let uxpContext = getUXPContext();
            if (uxpContext.hasDirectFileAccess && ! context.IS_FORCE_USE_DAEMON) {

                // https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/fs/

                try {
                    const stats = uxpContext.fs.lstatSync(filePath);
                    if (! stats || ! stats.isDirectory()) {
                        retVal = RESOLVED_PROMISE_FALSE;
                        break;
                    }
                }
                catch (err) {
                    if (err != FILE_NOT_EXIST_ERROR) {
                        crdtuxp.logNote(arguments, "throws " + err);
                    }
                    retVal = RESOLVED_PROMISE_FALSE;
                    break;
                }

                let entries = [];
                try {
                    entries = uxpContext.fs.readdirSync(filePath);
                }
                catch (err) {
                    crdtuxp.logError(arguments, "throws " + err);
                    retVal = RESOLVED_PROMISE_FALSE;
                    break;
                }

                if (! recurse) {

                    if (entries.length > 0) {
                        retVal = RESOLVED_PROMISE_FALSE;
                        break;
                    }

                    try {
                        function rmdirResolveFtn() {
                            // coderstate: resolver
                            return true;
                        };
                        function rmdirRejectFtn(reason) {
                            // coderstate: rejector
                            crdtuxp.logError(arguments, "rejected for " + reason);
                            return false;
                        };
                        // If no callback given, returns a Promise
                        retVal = uxpContext.fs.rmdir(filePath).then(
                            rmdirResolveFtn,
                            rmdirRejectFtn
                        );
                    }
                    catch (err) {
                        crdtuxp.logError(arguments, "throws " + err);
                        retVal = RESOLVED_PROMISE_FALSE;
                    }

                    break;
                }

                const dirPathPrefix = addTrailingSeparator(filePath);
                let promises = [];
                for (let idx = 0; idx < entries.length; idx++) {
                    let entryPath = dirPathPrefix + entries[idx];
                    try {
                        const stats = uxpContext.fs.lstatSync(entryPath);
                        if (! stats) {
                            promises = undefined;
                            break;
                        }
                        let deletePromise;
                        if (stats.isDirectory()) {
                            function dirDeleteResolveFtn() {
                                // coderstate: resolver
                                return true;
                            };
                            function dirDeleteRejectFtn(reason) {
                                // coderstate: rejector
                                crdtuxp.logError(arguments, "rejected for " + reason);
                                return false;
                            };
                            deletePromise = dirDelete(entryPath, true).then(
                                dirDeleteResolveFtn,
                                dirDeleteRejectFtn
                            );
                        }
                        else {
                            function fileDeletResolveFtn() {
                                // coderstate: resolver
                                return true;
                            };
                            function fileDeleteRejectFtn(reason) {
                                // coderstate: rejector
                                crdtuxp.logError(arguments, "rejected for " + reason);
                                return false;
                            };
                            // If no callback given, returns a Promise
                            deletePromise =  uxpContext.fs.unlink(entryPath).then(
                                fileDeletResolveFtn,
                                fileDeleteRejectFtn
                            );
                        }
                        promises.push(deletePromise);
                    }
                    catch (err) {
                        if (err != FILE_NOT_EXIST_ERROR) {
                            crdtuxp.logNote(arguments, "throws " + err);
                        }
                        promises = undefined;
                        break;
                    }
                }

                if (! promises) {
                    retVal = RESOLVED_PROMISE_FALSE;
                }

                function allResolveFtn() {
                    // coderstate: resolver
                    try {
                        function rmdirResolveFtn() {
                            // coderstate: resolver
                            return true;
                        };
                        function rmdirRejectFtn(reason) {
                            // coderstate: rejector
                            crdtuxp.logError(arguments, "rejected for " + reason);
                            return false;
                        };
                        // If no callback given, returns a Promise
                        retVal = uxpContext.fs.rmdir(filePath).then(
                            rmdirResolveFtn,
                            rmdirRejectFtn
                        );
                    }
                    catch (err) {
                        crdtuxp.logError(arguments, "throws " + err);
                        retVal = false;
                    }
                };
                function allRejectFtn(reason) {
                    // coderstate: rejector
                    crdtuxp.logError(arguments, "rejected for " + reason);
                    return false;
                };
                
                retVal = Promise.allSettled(promises).then(
                    allResolveFtn,
                    allRejectFtn
                );

                break;
            }

            const responsePromise = 
                evalTQL(
                    "dirDelete(" + 
                    dQ(filePath) + 
                    "," + 
                    (recurse ? "true" : "false") + 
                    ") ? \"true\" : \"false\""
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text == "true";
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.dirDelete = dirDelete;

/**
 * Verify whether a directory exists. Will return `false` if the path points to a file 
 * (instead of a directory).
 *
 * Also see `fileExists()`.
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function dirExists
 *
 * @param {string} dirPath - a path to a directory
 * @returns {Promise<boolean|undefined>} success or failure
 */

function dirExists(dirPath) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            let context = getUXPContext();
            let uxpContext = getUXPContext();
            if (uxpContext.hasDirectFileAccess && ! context.IS_FORCE_USE_DAEMON) {

                try {
                    const stats = uxpContext.fs.lstatSync(dirPath);
                    if (! stats || ! stats.isDirectory()) {
                        retVal = RESOLVED_PROMISE_FALSE;
                        break;
                    }
                }
                catch (err) {
                    if (err != FILE_NOT_EXIST_ERROR) {
                        crdtuxp.logNote(arguments, "throws " + err);
                    }
                    retVal = RESOLVED_PROMISE_FALSE;
                    break;
                }

                retVal = RESOLVED_PROMISE_TRUE;
                break;
            }

            const responsePromise = 
                evalTQL(
                    "dirExists(" + dQ(dirPath) + ") ? \"true\" : \"false\""
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text == "true";
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            ); 
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.dirExists = dirExists;

/**
 * Get the parent directory of a path
 *
 * @function dirName
 *
 * @param {string} filePath - a file path 
 * @param {object=} options - options: 
 * { 
 *   addTrailingSeparator: true/false, default false,
 *   separator: separatorchar. the separator to use. If omitted, will try to guess the 
 *   separator.
 * }
 * @param {string=} separator - 
 * @returns the parent of the path
 */

function dirName(filePath, options) { 
// coderstate: function
    let retVal;

    try {

        let separator;
        if (options) {
            if (options.separator) {
                separator = options.separator;
            }
        }

        if (! separator) {
            separator = crdtuxp.path.SEPARATOR;
        }

        // toString() handles cases where filePath is not a real string
        let splitPath = filePath.toString().split(separator);
        let endSegment;
        do {
            endSegment = splitPath.pop(); 
        }
        while (splitPath.length > 0 && endSegment == "");

        retVal = splitPath.join(separator);
        if (options && options.addTrailingSeparator) {
            retVal += separator;
         }
    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return retVal;
}
module.exports.path.dirName = dirName;

/**
 * Scan a directory.
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function dirScan
 *
 * @param {string} filePath
 * @returns {Promise<Array|undefined>} list of items in directory
 */

function dirScan(filePath) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {
            // https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/fs/

            let context = getUXPContext();
            let uxpContext = getUXPContext();
            if (uxpContext.hasDirectFileAccess && ! context.IS_FORCE_USE_DAEMON) {

                let entries = [];
                try {
                    entries = uxpContext.fs.readdirSync(filePath);
                }
                catch (err) {
                    crdtuxp.logError(arguments, "throws " + err);
                    retVal = false;
                    break;
                }
                retVal = Promise.resolve(entries);
                break;
            }

            const responsePromise = 
                evalTQL(
                    "enquote(dirScan(" + dQ(filePath) + ").toString())"
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal = undefined;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    const responseText = response.text;
                    if (! responseText) {
                        crdtuxp.logError(arguments, "no responseText");
                        break;
                    }

                    const deQuotedResponseText = deQuote(responseText);
                    if (! deQuotedResponseText) {
                        crdtuxp.logError(arguments, "no deQuotedResponseText");
                        break;
                    }

                    const binaryResponse = binaryUTF8ToStr(deQuotedResponseText);
                    if (! binaryResponse) {
                        crdtuxp.logError(arguments, "no binaryResponse");
                        break;
                    }

                    try {
                        retVal = JSON.parse(binaryResponse);
                    }
                    catch (err) {
                        crdtuxp.logError(arguments, "failed to parse JSON " + binaryResponse);
                        break;
                    }

                } 
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.dirScan = dirScan;

/**
 * Wrap a string or a byte array into double quotes, encoding any
 * binary data as a string. Knows how to handle Unicode characters
 * or binary zeroes.
 *
 * When the input is a string, high Unicode characters are
 * encoded as `\uHHHH`.
 *
 * When the input is a byte array, all bytes are encoded
 * as characters or as `\xHH` escape sequences.
 *
 * @function dQ
 *
 * @param {string|Array} s_or_ByteArr - a Unicode string or an array of bytes
 * @returns {string} a string enclosed in double quotes. This string is pure 7-bit
 * ASCII and can be used into generated script code
 * Example:
 * `let script = "a=b(" + dQ(somedata) + ");";`
 */
function dQ(s_or_ByteArr) {
// coderstate: function
    let retVal;

    try { 
        retVal = enQuote__(s_or_ByteArr, "\"");
    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return retVal;
}
module.exports.dQ = dQ;

/**
 * Encrypt a string or array of bytes using a key. A random salt
 * is added into the mix, so even when passing in the same parameter values, the result will
 * be different every time.
 *
 * Only available to paid developer accounts
 *
 * @function encrypt
 *
 * @param {string} s_or_ByteArr - a string or an array of bytes
 * @param {string} aesKey - a string or an array of bytes, key
 * @param {string=} aesIV - a string or an array of bytes, initial vector
 * @returns {Promise<string|undefined>} a base-64 encoded encrypted string.
 */

function encrypt(s_or_ByteArr, aesKey, aesIV) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            if (! aesIV) {
                aesIV = "";
            }

            const responsePromise = 
              evalTQL(
                "encrypt(" + 
                    dQ(s_or_ByteArr) + ", " + 
                    dQ(aesKey) + ", " + 
                    dQ(aesIV) + 
                ")"
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text;
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.encrypt = encrypt;

//
// enQuote__: Internal helper function. Escape and wrap a string in quotes
//
function enQuote__(s_or_ByteArr, quoteChar) {
// coderstate: function
    let retVal = "";

    try {

        const quoteCharCode = quoteChar.charCodeAt(0);

        let isString;
        let byteSequence;
        if (s_or_ByteArr instanceof ArrayBuffer) {
            byteSequence = new Uint8Array(in_byteArray);
        }
        else {
            isString = ("string" == typeof s_or_ByteArr);
            byteSequence = s_or_ByteArr;
        }

        const sLen = byteSequence.length;
        let escapedS = "";
        for (let charIdx = 0; charIdx < sLen; charIdx++) {
            let cCode;
            if (isString) {
                cCode = byteSequence.charCodeAt(charIdx);
            }
            else {
                cCode = byteSequence[charIdx];
            }
            if (cCode == 0x5C) {
                escapedS += '\\\\';
            }
            else if (cCode == quoteCharCode) {
                escapedS += '\\' + quoteChar;
            }
            else if (cCode == 0x0A) {
                escapedS += '\\n';
            }
            else if (cCode == 0x0D) {
                escapedS += '\\r';
            }
            else if (cCode == 0x09) {
                escapedS += '\\t';
            }
            else if (cCode < 32 || cCode == 0x7F || (! isString && cCode >= 0x80)) {
                escapedS += "\\x" + toHex(cCode, 2);
            }
            else if (isString && cCode >= 0x80) {
                escapedS += "\\u" + toHex(cCode, 4);
            }
            else {
                escapedS += String.fromCharCode(cCode);
            }
        }

        retVal = quoteChar + escapedS + quoteChar;

    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return retVal;
}

/**
 * Send a TQL script to the daemon and wait for the result
 *
 * @function evalTQL
 *
 * @param {string} tqlScript - a script to run
 * @param {string=} tqlScopeName - a scope name to use. Scopes are persistent for the 
 * duration of the daemon process and can be used to pass data between different 
 * processes
 * @param {object=} options - optional. 
 *   options.wait when false don't wait to resolve, default true
 *   options.isBinary default false
 *   options.tqlScopeName default TQL_SCOPE_NAME_DEFAULT
 * or can be decoded as a string
 * @returns {Promise<any>} a string or a byte array
 */
function evalTQL(tqlScript, options) {
// coderstate: promisor
    let retVal = Promise.resolve({ error: true });

    do {

        try {

            let context = crdtuxp.getContext();

            let resultIsRawBinary = false;
            let wait = true;
            let tqlScopeName = TQL_SCOPE_NAME_DEFAULT;

            if (options) {
                resultIsRawBinary = !!options.isBinary;
                wait = options.wait === undefined ? true : options.wait;
                tqlScopeName = options.tqlScopeName || TQL_SCOPE_NAME_DEFAULT;
            }

            let uxpContext = getUXPContext();
            if (! uxpContext.hasNetworkAccess && ! uxpContext.hasDirectFileAccess) {
                consoleLog("evalTQL needs direct file access or network access");
                // Need either network access or direct file access - cannot do
                // without
                break;
            }

            if (! uxpContext.hasNetworkAccess || context.IS_FORCE_DAEMON_FILE_BASED_API) {

                // https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/fs/

                if (! context?.PATH_EVAL_TQL) 
                {
                    consoleLog("evalTQL: need context.PATH_EVAL_TQL to be set");
                    // Need to know where to put the packet
                    break;
                }

                if (! uxpContext.tqlRequestID) {
                    uxpContext.tqlRequestID = 0;
                    uxpContext.tqlRequestsByID = {};
                }

                let validUntil = 
                    (new Date()).getTime() + DEFAULT_WAIT_FILE_TIMEOUT_MILLISECONDS;

                let tqlRequest = {
                    validUntil: validUntil,
                    wait: wait ? 1 : 0,
                    sessionID: uxpContext.sessionID,
                    requestID: ++uxpContext.tqlRequestID,
                    tqlRequest: tqlScript,
                    tqlScopeName: tqlScopeName
                };
                uxpContext.tqlRequestsByID[tqlRequest.requestID] = tqlRequest;

                let tqlRequestJSON = JSON.stringify(tqlRequest);
                let tqlRequestByteArray = strToUTF8(tqlRequestJSON);

                let tqlSharedFilePathPrefix = 
                    context.PATH_EVAL_TQL + 
                    tqlRequest.sessionID + 
                    crdtuxp.leftPad(tqlRequest.requestID, "0", LENGTH_REQUEST_ID);

                let requestFilePath = 
                    tqlSharedFilePathPrefix + 
                    FILE_NAME_SUFFIX_TQL_REQUEST + 
                    "." + 
                    FILE_NAME_EXTENSION_JSON;

                let responseFilePath = 
                    tqlSharedFilePathPrefix + 
                    FILE_NAME_SUFFIX_TQL_RESPONSE + 
                    "." + 
                    FILE_NAME_EXTENSION_JSON;

                function handleResponseData(replyByteArray) {
                    // coderstate: function
                    let retVal = undefined;

                    let responseText;
                    do {
                        try {
                            let jsonResponse = binaryUTF8ToStr(replyByteArray);

                            let response;
                            try {
                                response = JSON.parse(jsonResponse);
                            }
                            catch (err) {
                                break;
                            }

                            if (! response || response.result === undefined) {
                                break;
                            }

                            responseText = response.result;
                        }
                        catch (err) {
                            consoleLog("evalTQL handleResponseData throws " + err);
                            break;
                        }

                    }
                    while (false);

                    if (resultIsRawBinary) {
                        responseTextUnwrapped = responseText;
                    }
                    else {
                        responseTextUnwrapped = binaryUTF8ToStr(deQuote(responseText));
                    }

                    retVal = {
                        text: responseTextUnwrapped
                    };

                    return retVal;
                }

                function responseWaitResolveFtn(responseFileState) {
                    // coderstate: resolver
                    let retVal = undefined;

                    do {

                        delete uxpContext.tqlRequestsByID[tqlRequest.requestID];

                        if (! responseFileState) {
                            consoleLog("evalTQL responseWaitResolveFtn timed out waiting for file");
                            break;
                        }

                        let replyByteArray;

                        function unlinkResolveFtn() { 
                            // coderstate: resolver
                            return handleResponseData(replyByteArray);
                        };

                        function unlinkRejectFtn(reason) {
                            // coderstate: rejector
                            consoleLog("evalTQL responseWaitResolveFtn rejected for " + reason);
                            return handleResponseData(replyByteArray);
                        };

                        try {
                            replyByteArray = new Uint8Array(uxpContext.fs.readFileSync(responseFilePath));
                            retVal = uxpContext.fs.unlink(responseFilePath).then(
                                unlinkResolveFtn,
                                unlinkRejectFtn
                            );
                        }
                        catch (err) {
                            consoleLog("evalTQL responseWaitResolveFtn throws " + err);
                        }
                    }
                    while (false);

                    return retVal;
                };

                function responseWaitRejectFtn(reason) {
                    // coderstate: rejector
                    consoleLog("evalTQL responseWaitRejectFtn rejected for " + reason);
                    delete uxpContext.tqlRequestsByID[tqlRequest.requestID];
                    return undefined;
                };

                try {
                    uxpContext.fs.writeFileSync(requestFilePath, new Uint8Array(tqlRequestByteArray));
                }
                catch (err) {
                    consoleLog("evalTQL writeFileSync failed " + err);
                    break;
                }

                if (! wait) {
                    retVal = RESOLVED_PROMISE_UNDEFINED;
                    break;
                }

                retVal = crdtuxp.waitForFile(responseFilePath).then(
                    responseWaitResolveFtn,
                    responseWaitRejectFtn
                );

                break;
            }

            const init = {
                method: "POST",
                body: tqlScript
            };

            const responsePromise = 
                fetch(LOCALHOST_URL + "/" + tqlScopeName + "?" + HTTP_CACHE_BUSTER, init);
            HTTP_CACHE_BUSTER = HTTP_CACHE_BUSTER + 1;

            if (! wait) {
                retVal = RESOLVED_PROMISE_UNDEFINED;
                break;
            }

            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver

                const responseTextPromise = response.text();

                function responseTextResolveFtn(responseText) {
                    // coderstate: resolver
                    let retVal;

                    do {
                        let responseTextUnwrapped;
                        try {
                            if (resultIsRawBinary) {
                                responseTextUnwrapped = responseText;
                            }
                            else {
                                responseTextUnwrapped = binaryUTF8ToStr(deQuote(responseText));
                            }
                        }
                        catch (err) {
                            consoleLog("evalTQL responseTextResolveFtn throws " + err);
                            retVal = {
                                error: err
                            };
                            break;
                        }

                        retVal = {
                            text: responseTextUnwrapped
                        };
                    }
                    while (false);

                    return retVal;
                };
                
                function responseTextRejectFtn(reason) {
                    // coderstate: rejector
                    consoleLog("evalTQL responseTextRejectFtn rejected for " + reason);
                    return { 
                        error: reason 
                    };
                };

                return responseTextPromise.then(
                    responseTextResolveFtn,
                    responseTextRejectFtn
                );
            };
            
            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                consoleLog("evalTQL evalTQLRejectFtn rejected for " + reason);
                return { 
                    error: reason 
                };
            };
            
            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            consoleLog("evalTQL throws " + err);
        } 
    } 
    while (false);

    return retVal;
}
module.exports.evalTQL = evalTQL;

/**
 * (Internal) Inefficient file append, for debugging use
 *
 * @function fileAppend_
 *
 * @param {string} filePath - file to append to
 * @param {string} data - string to append
 */
function fileAppend_(filePath, data) {
// coderstate: function

    do {
        // This is a low-level function. Do not call consoleLog or crdtuxp.logError.

        let uxpContext = getUXPContext();
        if (! uxpContext.hasDirectFileAccess) {
            console.log("fileAppend_ needs hasDirectFileAccess");
            break;
        }

        let fileExists;
        try {
            const stats = uxpContext.fs.lstatSync(filePath);
            fileExists = stats && stats.isFile();
        }
        catch (err) {
            if (err != FILE_NOT_EXIST_ERROR) {
                console.log("fileAppend_ lstatSync throws " + err);
            }
        }

        let oldData = "";
        if (fileExists) {
            try {
                oldData = binaryUTF8ToStr(new Uint8Array(uxpContext.fs.readFileSync(filePath)));
            }
            catch (err) {
                console.log("fileAppend_ readFileSync throws " + err);                
            }
        }

        try {
            uxpContext.fs.writeFileSync(filePath, oldData + data);
        }
        catch (err) {
            console.log("fileAppend_ writeFileSync throws " + err);                
        }

    }
    while (false);
}
module.exports.fileAppend_ = fileAppend_;

/**
 * Append a string to a file (useful for logging)
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function fileAppendString
 *
 * @param {string} fileName - path to file
 * @param {string} appendStr - data to append. If a newline is needed it needs to be part of appendStr
 * @param {object=} options - {
 *      options.wait = false means don't wait to resolve
 * }
 * @returns {Promise<boolean|undefined>} success or failure
 */

function fileAppendString(fileName, in_appendStr, options) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            // Don't try direct file access - Photoshop UXPScript lacks an 
            // append function

            let waitForLogConfirmation = true;
            if (options && ! options.wait) {
                waitForLogConfirmation = false;
            }

            let evalTQLOptions = {
                wait: waitForLogConfirmation
            };

            const responsePromise = evalTQL(
                "var retVal = true;" + 
                "var handle = fileOpen(" + dQ(fileName) + ",'a');" +
                "if (! handle) {" + 
                    "retVal = false;" + 
                "}" + 
                "else if (! fileWrite(handle, " + dQ(in_appendStr) + ")) {" +
                    "retVal = false;" + 
                "}" + 
                "if (! fileClose(handle)) {" +
                    "retVal = false;" + 
                "}" + 
                "retVal ? \"true\" : \"false\"",
                evalTQLOptions
            );

            if (options && ! options.wait) {
                retVal = RESOLVED_PROMISE_UNDEFINED;
                break;
            }

            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        consoleLog("fileAppendString bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text == "true";
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                consoleLog("fileAppendString rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            consoleLog("fileAppendString throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.fileAppendString = fileAppendString;

/**
 * Close a currently open file
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function fileClose
 *
 * @param {number} fileHandle - a file handle as returned by `fileOpen()`.
 * @returns {Promise<boolean|undefined>} success or failure
 */

function fileClose(fileHandle) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            let context = getUXPContext();
            let uxpContext = getUXPContext();
            if (uxpContext.hasDirectFileAccess && ! context.IS_FORCE_USE_DAEMON) {
                let fileInfo = uxpContext.fileInfoByFileHandle[fileHandle];
                if (! fileInfo) {
                    break;
                }
                delete uxpContext.fileInfoByFileHandle[fileHandle];
                retVal = RESOLVED_PROMISE_TRUE;
                break;
            }

            const responsePromise = 
                evalTQL(
                    "fileClose(" + fileHandle + ") ? \"true\" : \"false\""
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text == "true";
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };
            
            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.fileClose = fileClose;

/**
 * Copy a file
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function fileCopy
 *
 * @param {string} fileFromPath - file to copy
 * @param {string} fileToPath - where to copy to
 * @returns {Promise<boolean|undefined>} success or failure
 */

function fileCopy(fileFromPath, fileToPath) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            const responsePromise = 
                evalTQL(
                    "fileCopy(" + dQ(fileFromPath) + "," + dQ(fileToPath) + ") ? \"true\" : \"false\""
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text == "true";
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };
            
            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.fileCopy = fileCopy;

/**
 * Delete a file
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function fileDelete
 *
 * @param {string} filePath
 * @returns {Promise<boolean|undefined>} success or failure
 */

function fileDelete(filePath) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            let context = getUXPContext();
            let uxpContext = getUXPContext();
            if (uxpContext.hasDirectFileAccess && ! context.IS_FORCE_USE_DAEMON) {

                // https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/fs/
                try {
                    const stats = uxpContext.fs.lstatSync(filePath);
                    if (! stats || ! stats.isFile()) {
                        retVal = RESOLVED_PROMISE_FALSE;
                        break;
                    } 
                }
                catch (err) {
                    if (err != FILE_NOT_EXIST_ERROR) {
                        crdtuxp.logNote(arguments, "throws " + err);
                    }
                    break;
                }

                try {
                    function unlinkResolveFtn() {
                        // coderstate: resolver
                        return true;
                    };
                    function unlinkRejectFtn(reason) {
                        // coderstate: rejector
                        crdtuxp.logError(arguments, "rejected for " + reason);
                        return false;
                    };
                    // If no callback given, returns a Promise
                    retVal = uxpContext.fs.unlink(filePath).then(
                        unlinkResolveFtn,
                        unlinkRejectFtn
                    );
                }
                catch (err) {
                }
                break;
            }

            const responsePromise = 
                evalTQL(
                    "fileDelete(" + dQ(filePath) + ") ? \"true\" : \"false\""
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text == "true";
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };
            
            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.fileDelete = fileDelete;

/**
 * Check if a file exists. Will return `false` if the file path points to a directory.
 *
 * Also see `dirExists()`.
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function fileExists
 *
 * @param {string} filePath
 * @returns {Promise<boolean|undefined>} existence of file
 */

function fileExists(filePath) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            let context = getUXPContext();
            let uxpContext = getUXPContext();
            if (uxpContext.hasDirectFileAccess && ! context.IS_FORCE_USE_DAEMON) {

                // https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/fs/
                try {
                    const stats = uxpContext.fs.lstatSync(filePath);
                    if (! stats || ! stats.isFile()) {
                        retVal = RESOLVED_PROMISE_FALSE;
                        break;
                    } 
                }
                catch (err) {
                    if (err != FILE_NOT_EXIST_ERROR) {
                        crdtuxp.logNote(arguments, "throws " + err);
                    }
                    break;
                }

                retVal = Promise.resolve(true);
                break;
            }

            const responsePromise = 
                evalTQL(
                    "fileExists(" + dQ(filePath) + ") ? \"true\" : \"false\""
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text == "true";
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };
            
            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.fileExists = fileExists;

/**
 * Get the file name extension of a path
 *
 * @function fileNameExtension
 *
 * @param {string} filePath - a file path 
 * @param {string=} separator - the separator to use. If omitted, will try 
 * guess the separator.
 * @returns the lowercased file name extension, without leading period
 */

function fileNameExtension(filePath, separator) {
// coderstate: function
    let retVal;

    try {
        let splitName = crdtuxp.path.baseName(filePath).split(".");
        let extension = "";
        if (splitName.length > 1) {
            extension = splitName.pop();
        }

        retVal = extension.toLowerCase();
    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return retVal;
}
module.exports.path.fileNameExtension = fileNameExtension;

/**
 * Open a binary file and return a handle
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function fileOpen
 *
 * @param {string} filePath - a native full file path to the file
 * @param {string} mode - one of `'a'`, `'r'`, `'w'` (append, read, write)
 * @returns {Promise<Number|undefined>} file handle
 */

function fileOpen(filePath, mode) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            let context = getUXPContext();
            let uxpContext = getUXPContext();
            if (uxpContext.hasDirectFileAccess && ! context.IS_FORCE_USE_DAEMON) {
                let parentPath = crdtuxp.path.dirName(filePath); 
                let baseName = crdtuxp.path.baseName(filePath); 
                if (! uxpContext.uniqueFileHandleID) {
                    uxpContext.uniqueFileHandleID = 0;
                    uxpContext.fileInfoByFileHandle = {};
                }

                if (mode == 'w' || mode == 'a') {

                    // https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/fs/
                    try {
                        const stats = uxpContext.fs.lstatSync(parentPath);
                        if (! stats || ! stats.isDirectory()) {
                            break;
                        } 
                    }
                    catch (err) {
                        if (err != FILE_NOT_EXIST_ERROR) {
                            crdtuxp.logNote(arguments, "throws " + err);
                        }
                        break;
                    }

                    let uniqueFileHandleID = ++uxpContext.uniqueFileHandleID; 
                    let fileInfo = {
                        fileHandle: uniqueFileHandleID,
                        filePath: filePath,
                        mode: mode
                    }
                    uxpContext.fileInfoByFileHandle[uniqueFileHandleID] = fileInfo;
                    retVal = Promise.resolve(uniqueFileHandleID);

                } 
                else if (mode == 'r') {

                    try {
                        const stats = uxpContext.fs.lstatSync(filePath);
                        if (! stats || ! stats.isFile()) {
                            break;
                        } 
                    }
                    catch (err) {
                        if (err != FILE_NOT_EXIST_ERROR) {
                            crdtuxp.logNote(arguments, "throws " + err);
                        }
                        break;
                    }

                    let uniqueFileHandleID = ++uxpContext.uniqueFileHandleID; 
                    let fileInfo = {
                        fileHandle: uniqueFileHandleID,
                        filePath: filePath,
                        mode: mode
                    }
                    uxpContext.fileInfoByFileHandle[uniqueFileHandleID] = fileInfo;
                    retVal = Promise.resolve(uniqueFileHandleID);
                }
                break;
            }

            let responsePromise;
            if (mode) {
                responsePromise = 
                    evalTQL(
                        "enquote(fileOpen(" + dQ(filePath) + "," + dQ(mode) + "))"
                    );
            }
            else {
                responsePromise = 
                    evalTQL(
                        "enquote(fileOpen(" + dQ(filePath) + "))"
                    );
            }
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    try {
                        if (! response || response.error) {
                            crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                            break;
                        }

                        let responseStr = deQuote(response.text);
                        if (! responseStr) {
                            crdtuxp.logError(arguments, "no responseStr");
                            break;
                        }

                        let responseData = binaryUTF8ToStr(responseStr);
                        if (! responseData) {
                            crdtuxp.logError(arguments, "no responseData");
                            break;
                        }

                        retVal = parseInt(responseData, 10);
                        if (isNaN(retVal)) {
                            crdtuxp.logError(arguments, "not a number " + responseData);
                            retVal = undefined;
                            break;
                        }
                    }
                    catch (err) {
                        crdtuxp.logError(arguments, "throws " + err);
                        break;
                    }
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };
            
            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.fileOpen = fileOpen;

/**
 * Read a file into memory
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function fileRead
 *
 * @param {number} fileHandle - a file handle as returned by `fileOpen()`.
 * @param {boolean|object=} options - options: { isBinary: true/false, default false }
 * @returns {Promise<any>} either a byte array or a string
 */

function fileRead(fileHandle, options) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            if ("boolean" == typeof options) {
                options = {
                    isBinary: options
                };
            }

            let context = getUXPContext();
            let uxpContext = getUXPContext();
            if (uxpContext.hasDirectFileAccess && ! context.IS_FORCE_USE_DAEMON) {

                if (! uxpContext.fileInfoByFileHandle) {
                    break;
                }

                let fileInfo = uxpContext.fileInfoByFileHandle[fileHandle];
                if (! fileInfo) {
                    break;
                }

                if (fileInfo.mode != 'r') {
                    break;
                }

                let replyByteArray;
                try {
                    replyByteArray = new Uint8Array(uxpContext.fs.readFileSync(fileInfo.filePath));
                    if (options?.isBinary) {
                        retVal = Promise.resolve(replyByteArray);
                        break;
                    }
                }
                catch (err) {
                    crdtuxp.logError(arguments, "throws " + err);
                    break;
                }

                retVal = Promise.resolve(binaryUTF8ToStr(replyByteArray));
                break;
            }

            let evalTQLOptions = {
                isBinary: options?.isBinary
            };

            const responsePromise = 
                evalTQL(
                    "enquote(fileRead(" + fileHandle + "))", 
                    evalTQLOptions);
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    let byteArrayStr = deQuote(response.text);
                    if (! byteArrayStr) {
                        crdtuxp.logError(arguments, "no byteArrayStr");
                        break;
                    }

                    var str = binaryUTF8ToStr(byteArrayStr);
                    if (! str) {
                        crdtuxp.logError(arguments, "no str");
                        break;
                    }

                    if (! options?.isBinary) {
                        retVal = str;
                        break;
                    }

                    retVal = deQuote(str);
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };
            
            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.fileRead = fileRead;

/**
 * Binary write to a file. Strings are written as UTF-8
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function fileWrite
 *
 * @param {number} fileHandle - a file handle as returned by `fileOpen()`.
 * @param {string|Array} s_or_ByteArr - data to write to the file
 * @returns {Promise<boolean|undefined>} success or failure
 */

function fileWrite(fileHandle, s_or_ByteArr) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {
            let byteArray;
            if ("string" == typeof s_or_ByteArr) {
                byteArray = strToUTF8(s_or_ByteArr);
            }
            else {
                byteArray = s_or_ByteArr;
            }

            let context = getUXPContext();
            let uxpContext = getUXPContext();
            if (uxpContext.hasDirectFileAccess && ! context.IS_FORCE_USE_DAEMON) {

                if (! uxpContext.fileInfoByFileHandle) {
                    break;
                }

                let fileInfo = uxpContext.fileInfoByFileHandle[fileHandle];
                if (! fileInfo) {
                    break;
                }

                if (fileInfo.mode != 'w' && fileInfo.mode != 'a') {
                    break;
                }

                let lengthWritten = 0;
                try {
                    lengthWritten = uxpContext.fs.writeFileSync(fileInfo.filePath, new Uint8Array(byteArray));
                }
                catch (err) {
                    crdtuxp.logError(arguments, "throws " + err);
                    break;
                }

                retVal = Promise.resolve(lengthWritten == byteArray.length);

                break;
            }

            const responsePromise = 
                evalTQL(
                    "fileWrite(" + fileHandle + "," + dQ(byteArray) + ") ? \"true\" : \"false\""
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text == "true";
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };
            
            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.fileWrite = fileWrite;

/**
 * Terminate crdtuxp
 *
 * @function finalize
 */

function finalize() {
    // coderstate: promisor
    return Promise.finalizePromises();
}
module.exports.finalize = finalize;
    
/**
 * Extract the function name from its arguments
 *
 * @function functionNameFromArguments
 *
 * @param {object} functionArguments - pass in the current `arguments` to the function. This is used to determine the function's name
 * @returns {string} function name
 */

function functionNameFromArguments(functionArguments) {
// coderstate: function
    let functionName;
    try {
        functionName = functionArguments.callee.toString().match(/function ([^\(]+)/)[1];
    }
    catch (err) {
        functionName = "[anonymous function]";
    }

    return functionName;

}
module.exports.functionNameFromArguments = functionNameFromArguments;

/**
 * Interpret a value extracted from some INI data as a boolean. Things like y, n, yes, no, true, false, t, f, 0, 1
 * Default if missing is 'false'
 *
 * @function getBooleanFromINI
 *
 * @param {string} in_value - ini value
 * @param {string} in_default - value to use if `undefined` or `""`
 * @returns {boolean} value
 */

function getBooleanFromINI(in_value, in_default) {
// coderstate: function
    let retVal = false;

    try {
        if (! in_value) {
            retVal = in_default ? true : false;
        }
        else {
            const value = (in_value + "").replace(REGEXP_TRIM, REGEXP_TRIM_REPLACE);
            if (! value) {
                retVal = in_default ? true : false;
            }
            else {
                const firstChar = value.charAt(0).toLowerCase();
                const firstValue = parseInt(firstChar, 10);
                retVal = firstChar == "y" || firstChar == "t" || (! isNaN(firstValue) && firstValue != 0);
            }
        }
    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return retVal;
}
module.exports.getBooleanFromINI = getBooleanFromINI;

/**
 * Query the daemon to see whether some software is currently activated or not
 *
 * @function getCapability
 *
 * @param {string} issuer - a GUID identifier for the developer account as seen in the PluginInstaller
 * @param {string} capabilityCode - a code for the software features to be activated (as determined by the developer who owns the account).
 * `capabilityCode` is not the same as `orderProductCode` - there can be multiple `orderProductCode` associated with 
 * a single `capabilityCode` (e.g. `capabilityCode` 'XYZ', `orderProductCode` 'XYZ_1YEAR', 'XYZ_2YEAR'...).
 * @param {string} encryptionKey - the secret encryption key (created by the developer) needed to decode the capability data. You want to make
 * sure this password is obfuscated and contained within encrypted script code.
 * @returns {Promise<string|undefined>} a JSON-encoded object with meta object (containing customer GUID, seatIndex, decrypted developer-provided data from the activation file).
 * The decrypted developer data is embedded as a string, so might be two levels of JSON-encoding to be dealt with to get to any JSON-encoded decrypted data
 */
function getCapability(issuer, capabilityCode, encryptionKey) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            const responsePromise = 
                evalTQL(
                    "getCapability(" + 
                        dQ(issuer) + ", " + 
                        dQ(capabilityCode) + ", " + 
                        dQ(encryptionKey) + 
                    ")"
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text;
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };
            
            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.getCapability = getCapability;

/**
 * Determine the license level for CRDT: 0 = not, 1 = basic, 2 = full
 *
 * Some functions, marked with "Only available to paid developer accounts" 
 * will only work with level 2. Licensing function only work with level 1
 *
 * @function getCreativeDeveloperToolsLevel
 *
 * @returns {Promise<Number|undefined>} - 0, 1 or 2. -1 means: error
 */
function getCreativeDeveloperToolsLevel() {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {
            const responsePromise = 
                evalTQL(
                    "getCreativeDeveloperToolsLevel()"
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = parseInt(response.text, 10);
                    if (isNaN(retVal)) {
                        crdtuxp.logError(arguments, "not a number " + response.text);
                        retVal = undefined;
                        break;
                    }
            }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.getCreativeDeveloperToolsLevel = getCreativeDeveloperToolsLevel;

/**
 * Get the path of the current script of the caller (_not_ the path of this file)
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function getCurrentScriptPath
 *
 * @returns {string|undefined} file path of the script file containing the caller of getCurrentScriptPath
 */

function getCurrentScriptPath() {

    let retVal = undefined;

    do {

        try {
            // Intentionally throw an error to capture the stack trace
            throw new Error();
        } catch (err) {
            // Parse the stack trace to extract the script path
            const stackLines = err.stack.split("\n");

            // We are interested in the script path for the caller of this function, not the path for crdtuxp.js::getCurrentScriptPath
            const NUM_STEPS_FROM_STACK_TOP = 2;
            const scriptPathLine = stackLines[NUM_STEPS_FROM_STACK_TOP];
            const scriptPathMatch = scriptPathLine.match(/(\/.*?|[A-Za-z]:\\.*?|\\\\.*?\\.*?):\d+:\d+/); 
            if (scriptPathMatch) {
                retVal = scriptPathMatch[1];
            }
        }
        
    }    
    while (false);

    return retVal;
}
module.exports.path.getCurrentScriptPath = getCurrentScriptPath;

/**
 * Get the path of a system directory
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function getDir
 *
 * @param {string} dirTag - a tag representing the dir:
 * ```
 *    DESKTOP_DIR
 *    DOCUMENTS_DIR
 *    HOME_DIR
 *    LOG_DIR
 *    SYSTEMDATA_DIR
 *    TMP_DIR
 *    USERDATA_DIR
 * ```
 * @returns {Promise<string|undefined>} file path of dir or undefined. Directory paths include a trailing slash or backslash.
 */
function getDir(dirTag) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {
            if (crdtuxp.context) {

                if (dirTag == module.exports.DESKTOP_DIR && crdtuxp.context.PATH_DESKTOP) {
                    retVal = Promise.resolve(crdtuxp.context.PATH_DESKTOP);
                    break;
                }

                if (dirTag == module.exports.DOCUMENTS_DIR && crdtuxp.context.PATH_DOCUMENTS) {
                    retVal = Promise.resolve(crdtuxp.context.PATH_DOCUMENTS);
                    break;
                }

                if (dirTag == module.exports.HOME_DIR && crdtuxp.context.PATH_HOME) {
                    retVal = Promise.resolve(crdtuxp.context.PATH_HOME);
                    break;
                }

                if (dirTag == module.exports.LOG_DIR && crdtuxp.context.PATH_LOG) {
                    retVal = Promise.resolve(crdtuxp.context.PATH_LOG);
                    break;
                }

                if (dirTag == module.exports.SYSTEMDATA_DIR && crdtuxp.context.PATH_SYSTEMDATA) {
                    retVal = Promise.resolve(crdtuxp.context.PATH_SYSTEMDATA);
                    break;
                }

                if (dirTag == module.exports.TMP_DIR && crdtuxp.context.PATH_TMP) {
                    retVal = Promise.resolve(crdtuxp.context.PATH_TMP);
                    break;
                }

                if (dirTag == module.exports.USERDATA_DIR && crdtuxp.context.PATH_USERDATA) {
                    retVal = Promise.resolve(crdtuxp.context.PATH_USERDATA);
                    break;
                }
            }

            const sysInfoPromise = getSysInfo__();
            if (! sysInfoPromise) {
                crdtuxp.logError(arguments, "no sysInfoPromise");
                break;
            }

            function evalTQLResolveFtn(sysInfo) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! sysInfo || sysInfo.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + sysInfo?.error);
                        break;
                    }

                    if (! (dirTag in sysInfo)) {
                        crdtuxp.logError(arguments, "unknown tag " + dirTag);
                        break;
                    }

                    retVal = sysInfo[dirTag];
                }
                while (false);

                return retVal;
            };
            
            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = sysInfoPromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.getDir = getDir;

/**
 * Access the environment as available to the daemon program
 *
 * Not restricted by the UXP security sandbox.
 *
 * @function getEnvironment
 *
 * @param {string} envVarName - name of environment variable
 * @returns {Promise<string>} environment variable value
 */
function getEnvironment(envVarName) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            const responsePromise = 
                evalTQL(
                    "getEnv(" + dQ(envVarName) + ")"
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text;
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.getEnvironment = getEnvironment;

/**
 * Interpret a string extracted from some INI data as a floating point value, followed by an optional unit
 * If there is no unit, then no conversion is performed.
 *
 * @function getFloatWithUnitFromINI
 *
 * @param {string} in_valueStr - ini value
 * @param {string=} in_convertToUnit - default to use if no match is found
 * @returns {number} value
 */

function getFloatWithUnitFromINI(in_valueStr, in_convertToUnit) {
// coderstate: function
    let retVal = 0.0;

    do {

        try {

            if (! in_valueStr) {
                break;
            }

            let convertToUnit;
            if (in_convertToUnit) {
                convertToUnit = in_convertToUnit;
            }
            else {
                convertToUnit = crdtuxp.UNIT_NAME_NONE;
            }

            let sign = 1.0;

            let valueStr = in_valueStr.replace(REGEXP_DESPACE, REGEXP_DESPACE_REPLACE).toLowerCase();

            const firstChar = valueStr.charAt(0);
            if (firstChar == '-') {
                valueStr = valueStr.substring(1);
                sign = -1.0;
            }
            else if (firstChar == '+') {
                valueStr = valueStr.substring(1);
            }

            let picas = undefined;
            let ciceros = undefined;
            if (valueStr.match(REGEXP_PICAS)) {
                picas = parseInt(valueStr.replace(REGEXP_PICAS, REGEXP_PICAS_REPLACE), 10);
                valueStr = valueStr.replace(REGEXP_PICAS, REGEXP_PICAS_POINTS_REPLACE);
            }
            else if (valueStr.match(REGEXP_CICEROS)) {
                ciceros = parseInt(valueStr.replace(REGEXP_CICEROS, REGEXP_CICEROS_REPLACE), 10);
                valueStr = valueStr.replace(REGEXP_CICEROS, REGEXP_CICEROS_POINTS_REPLACE);
            }

            const numberOnlyStr = valueStr.replace(REGEXP_NUMBER_ONLY, REGEXP_NUMBER_ONLY_REPLACE);
            let numberOnly = parseFloat(numberOnlyStr);
            if (isNaN(numberOnly)) {
                numberOnly = 0.0;
            }

            let fromUnit;
            if (picas !== undefined) {
                fromUnit = crdtuxp.UNIT_NAME_PICA;
                numberOnly = picas + numberOnly / 6.0;
            }
            else if (ciceros !== undefined) {
                fromUnit = crdtuxp.UNIT_NAME_CICERO;
                numberOnly = ciceros + numberOnly / 6.0;
            }
            else {
                let unitOnly = valueStr.replace(REGEXP_UNIT_ONLY, REGEXP_UNIT_ONLY_REPLACE);
                fromUnit = getUnitFromINI(unitOnly, crdtuxp.UNIT_NAME_NONE);
            }

            let conversion = 1.0;
            if (fromUnit != crdtuxp.UNIT_NAME_NONE && convertToUnit != crdtuxp.UNIT_NAME_NONE) {
                conversion = unitToInchFactor(fromUnit) / unitToInchFactor(convertToUnit);
            }

            retVal = sign * numberOnly * conversion;
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.getFloatWithUnitFromINI = getFloatWithUnitFromINI;

/**
 * Interpret a string extracted from some INI data as an array with float values (e.g. "[ 255, 128.2, 1.7]" )
 *
 * @function getFloatValuesFromINI
 *
 * @param {string} in_valueStr - ini value
 * @returns {array|undefined} array of numbers or undefined
 */

function getFloatValuesFromINI(in_valueStr) {
// coderstate: function
    let retVal = undefined;

    do {

        try {

            if (! in_valueStr) {
                break;
            }

            let floatValues = undefined;
            const values = in_valueStr.split(",");
            for (let idx = 0; idx < values.length; idx++) {
                const value = values[idx].replace(REGEXP_TRIM, REGEXP_TRIM_REPLACE);
                let numValue = 0;
                if (value) {
                    numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                        floatValues = undefined;
                        break;
                    }
                }

                if (! floatValues) {
                    floatValues = [];
                }
                floatValues.push(numValue);
            }

            retVal = floatValues;
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.getFloatValuesFromINI = getFloatValuesFromINI;

/**
 * Interpret a string extracted from some INI data as an array with int values (e.g. "[ 255, 128, 1]" )
 *
 * @function getIntValuesFromINI
 *
 * @param {string} in_valueStr - ini value
 * @returns {array|undefined} array of ints or undefined
 */

function getIntValuesFromINI(in_valueStr) {
// coderstate: function
    let retVal = undefined;

    do {

        try {

            if (! in_valueStr) {
                break;
            }

            let intValues = undefined;
            const values = in_valueStr.split(",");
            for (let idx = 0; idx < values.length; idx++) {
                const valueStr = values[idx].replace(REGEXP_TRIM, REGEXP_TRIM_REPLACE);
                let value = 0;
                if (! valueStr) {
                    value = 0;
                }
                else {
                    value = parseInt(valueStr, 10);
                    if (isNaN(value)) {
                        intValues = undefined;
                        break;
                    }
                }
                if (! intValues) {
                    intValues = [];
                }
                intValues.push(value);
            }

            retVal = intValues;
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.getIntValuesFromINI = getIntValuesFromINI;

/**
 * Query the daemon for persisted data
 *
 * Only available to paid developer accounts
 *
 * @function getPersistData
 *
 * @param {string} issuer - a GUID identifier for the developer account as seen in the PluginInstaller
 * @param {string} attribute - an attribute name for the data
 * @param {string} password - the password (created by the developer) needed to decode the persistent data
 * @returns {Promise<any>} whatever persistent data is stored for the given attribute
 */
function getPersistData(issuer, attribute, password) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            const responsePromise = 
                evalTQL(
                    "getPersistData(" + 
                        dQ(issuer) + "," + 
                        dQ(attribute) + "," + 
                        dQ(password) + 
                    ")"
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text;
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.getPersistData = getPersistData;

/**
 * Get file path to PluginInstaller if it is installed
 *
 * @function getPluginInstallerPath
 * @returns {Promise<string>} file path
*/
function getPluginInstallerPath() {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            const responsePromise = 
                evalTQL(
                    "getPluginInstallerPath()"
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text;
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.getPluginInstallerPath = getPluginInstallerPath;

/**
 * Internal function. Query the Tightener daemon for system information
 *
 * @function getSysInfo__
 *
 * @returns {object} system info
 */

function getSysInfo__() {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            if (SYS_INFO) {
                retVal = Promise.resolve(SYS_INFO);
                break;
            }

            const responsePromise = 
                evalTQL(
                    "enquote(sysInfo())"
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    let responseWrapperStr = response.text;
                    if (! responseWrapperStr) {
                        crdtuxp.logError(arguments, "no response text");
                        break;
                    }

                    let responseData = deQuote(responseWrapperStr);
                    if (! responseData) {
                        crdtuxp.logError(arguments, "no responseData");
                        break;
                    }

                    let responseStr = binaryUTF8ToStr(responseData);
                    if (! responseStr) {
                        crdtuxp.logError(arguments, "no responseStr");
                        break;
                    }

                    SYS_INFO = JSON.parse(responseStr);
                    retVal = SYS_INFO;
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}

/**
 * Interpret a string extracted from some INI data as a unit name
 *
 * @function getUnitFromINI
 *
 * @param {string} in_value - ini value
 * @param {string} in_defaultUnit - default to use if no match is found
 * @returns {string} value
 */

function getUnitFromINI(in_value, in_defaultUnit) {
// coderstate: function
    const defaultUnit = (in_defaultUnit !== undefined) ? in_defaultUnit : crdtuxp.UNIT_NAME_NONE;
    let retVal = defaultUnit;

    try {

        const value = (in_value + "").replace(REGEXP_TRIM, REGEXP_TRIM_REPLACE).toLowerCase();

        if (value == "\"" || value.substring(0,2) == "in") {
            retVal = crdtuxp.UNIT_NAME_INCH;
        }
        else if (value == "cm" || value == "cms" || value.substr(0,4) == "cent") {
            retVal = crdtuxp.UNIT_NAME_CM;
        }
        else if (value == "mm" || value == "mms" || value.substr(0,4) == "mill") {
            retVal = crdtuxp.UNIT_NAME_MM;
        }
        else if (value.substring(0,3) == "cic") {
            retVal = crdtuxp.UNIT_NAME_CICERO;
        }
        else if (value.substring(0,3) == "pic") {
            retVal = crdtuxp.UNIT_NAME_PICA;
        }
        else if (value.substring(0,3) == "pix" || value == "px") {
            retVal = crdtuxp.UNIT_NAME_PIXEL;
        }
        else if (value.substring(0,3) == "poi" || value == "pt") {
            retVal = crdtuxp.UNIT_NAME_POINT;
        }
    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return retVal;
}
module.exports.getUnitFromINI = getUnitFromINI;

/**
 * Get our bearings and figure out what operating system context we're operating in. 
 *
 * @function getContext
 *
 * @returns {object} context
 */

function getContext() {
// coderstate: function
    let retVal;

    do {

        try {

            // context can be pre-populated by a calling script, in which case we look if there is any missing 
            // data that we can add
            
            let context = crdtuxp.context;
            if (! context) {
                context = {};
                crdtuxp.context = context;
            }

            if (context.areDefaultGetContextPathsInitialized) {
                retVal = context;
                break;
            }

            context.areDefaultGetContextPathsInitialized = true;

            let uxpContext = getUXPContext();

            if (! context.PATH_HOME) {
                context.PATH_HOME = uxpContext.os.homedir() + crdtuxp.path.SEPARATOR;
            }

            if (! context.PATH_DOCUMENTS) {
                // This is an educated guess which will be correct most of the time
                context.PATH_DOCUMENTS = context.PATH_HOME + "Documents" + crdtuxp.path.SEPARATOR;
            }

            if (! context.PATH_DESKTOP) {
                // This is an educated guess which will be correct most of the time
                context.PATH_DESKTOP = context.PATH_HOME + "Desktop" + crdtuxp.path.SEPARATOR;
            }

            if (! context.PATH_USERDATA) {
                // This is an educated guess which will be correct most of the time
                if (crdtuxp.IS_MAC) {
                    context.PATH_USERDATA = context.PATH_HOME + "Library/Application Support/";
                }
                else {
                    context.PATH_USERDATA = context.PATH_HOME + "AppData\\Roaming\\";
                }
            }

            if (! context.PATH_TIGHTENER_STORAGE) {
                context.PATH_TIGHTENER_STORAGE = context.PATH_USERDATA + "net.tightener" + crdtuxp.path.SEPARATOR;
            }

            if (! context.PATH_APP_STORAGE) {
                context.PATH_APP_STORAGE = context.PATH_TIGHTENER_STORAGE + "Licensing" + crdtuxp.path.SEPARATOR;
            }

            if (! context.PATH_EVAL_TQL) {
                context.PATH_EVAL_TQL = context.PATH_APP_STORAGE + "EvalTQL" + crdtuxp.path.SEPARATOR;
            }

            retVal = context;
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.getContext = getContext;

/**
 * Get our bearings and figure out what context we're operating in. Depending on the context
 * we will or won't have access to certain features
 *
 * @function getUXPContext
 *
 * @returns {object} context
 */

function getUXPContext() {
// coderstate: function
    let retVal;

    do {

        try {

            if (crdtuxp.uxpContext) {
                retVal = crdtuxp.uxpContext;
                break;
            }

            let uxpContext = {};
            crdtuxp.uxpContext = uxpContext;

            uxpContext.fs = require("fs");
            uxpContext.os = require("os");
            uxpContext.uxp = require("uxp"); 
            uxpContext.path = require("path");
            
            let storage = uxpContext.uxp.storage;
            uxpContext.lfs = storage.localFileSystem;
            uxpContext.sessionID = window.crypto.randomUUID().replace(/-/g,"");

            try {
                // @ts-ignore
                uxpContext.indesign = require("indesign");
                uxpContext.app = uxpContext.indesign.app;
                if (uxpContext.app.name.indexOf("Server") >= 0) {
                    uxpContext.uxpVariant = UXP_VARIANT_INDESIGN_SERVER_UXPSCRIPT;
                    uxpContext.hasDirectFileAccess = true;
                    uxpContext.hasNetworkAccess = true;
                }
                else {
                    uxpContext.uxpVariant = UXP_VARIANT_INDESIGN_UXPSCRIPT;
                    let commandId = uxpContext.uxp?.script?.executionContext?.commandInfo?._manifestCommand?.commandId;
                    if (commandId == "scriptMainCommand") {
                        uxpContext.uxpVariant = UXP_VARIANT_INDESIGN_UXPSCRIPT;
                        uxpContext.hasDirectFileAccess = true;
                        uxpContext.hasNetworkAccess = true;
                    }
                    else {
                        uxpContext.uxpVariant = UXP_VARIANT_INDESIGN_UXP;
                        uxpContext.hasDirectFileAccess = false;
                        uxpContext.hasNetworkAccess = true;
                    }
                }
            }
            catch (err) {
                crdtuxp.logTrace(arguments, "throws " + err);
            }

            try {
                // @ts-ignore
                uxpContext.photoshop = require("photoshop");
                uxpContext.app = uxpContext.photoshop.app;
                let commandId = uxpContext.uxp?.script?.executionContext?.commandInfo?._manifestCommand?.commandId;
                if (commandId == "scriptMainCommand") {
                    uxpContext.uxpVariant = UXP_VARIANT_PHOTOSHOP_UXPSCRIPT;
                    uxpContext.hasDirectFileAccess = true;
                    uxpContext.hasNetworkAccess = false;
                }
                else {
                    uxpContext.uxpVariant = UXP_VARIANT_PHOTOSHOP_UXP;
                    uxpContext.hasDirectFileAccess = false;
                    uxpContext.hasNetworkAccess = true;
                }
            }
            catch (err) { 
                crdtuxp.logTrace(arguments, "throws " + err);
            }

            retVal = uxpContext;
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.getUXPContext = getUXPContext;

/**
 * Initialize crdtuxp
 *
 * @function init
 * @returns {Promise<boolean|undefined>} when true: valid issuer has made CRDT_UXP extra features available
 * 
 */

function init(context) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    try {

        if (! crdtuxp.isProxyPromiseInjected) {
            injectProxyPromiseClass();
        }

        if (! context) {
            context = {};
        }

        if (! crdtuxp.context) {
            crdtuxp.context = context;
        }
        else {
            for (attr in context) {
                crdtuxp.context[attr] = context[attr];
            }
            context = crdtuxp.context;
        }

        if (! context.RUNPATH_ROOT) {
            context.RUNPATH_ROOT = "." + module.exports.path.SEPARATOR;
        }

        if (! context.RUNPATH_ROOT_RESOLVED) {
            // crdtuxp_js_path is the path to crdtuxp.js
            let crdtuxp_js_path = crdtuxp.path.getCurrentScriptPath();
            // crdtuxp_folder is the folder containing crdtuxp.js
            let crdtuxp_folder = crdtuxp.path.dirName(crdtuxp_js_path);            
            // Assume one level above crdtuxp_folder
            context.RUNPATH_ROOT_RESOLVED = 
                crdtuxp.path.dirName(
                    crdtuxp_folder, 
                    { addTrailingSeparator: true }
                );
        }

        if (context.ISSUER_GUID && context.ISSUER_EMAIL) {
            retVal = crdtuxp.setIssuer(context.ISSUER_GUID, context.ISSUER_EMAIL);
        }
        else {
            retVal = RESOLVED_PROMISE_TRUE;
        }
    }
    catch (err) {
        consoleLog("init throws " + err);
    }

    return retVal;
}
module.exports.init = init;

/**
 * Wrap the system Promise with a new Promise class that allows us to track pending promises
 *
 * @function injectProxyPromiseClass
 */

function injectProxyPromiseClass() {
// coderstate: procedure
    try {
        // Save the original Promise class
        const SystemPromise = global.Promise;

        let PROMISES_PENDING = {};
        let LAST_PROMISE_UNIQUE_ID = 0;

        crdtuxp.isProxyPromiseInjected = true;

        // Define the new Promise class
        class Promise {
            constructor(executor) {
        
            let curThis = this;
                curThis._state = 'pending';
                curThis._value = undefined;
                curThis._id = ++LAST_PROMISE_UNIQUE_ID;
                PROMISES_PENDING[curThis._id] = curThis;

                // Create a new instance of the original Promise
                this._promise = new SystemPromise((resolve, reject) => {
                    executor(
                        (value) => {
                            curThis._state = 'resolved';
                            curThis._value = value;
                            curThis.untracked();
                            resolve(value);
                        },
                        (reason) => {
                            curThis._state = 'rejected';
                            curThis._value = reason;
                            curThis.untracked();
                            reject(reason);
                        });
                });
            }

            // Proxy static methods
            static pendingPromises() {
            // coderstate: function

                let retVal = [];
                for (let id in PROMISES_PENDING) {
                let promise = PROMISES_PENDING[id];
                if (promise._state == 'pending') {
                    retVal.push(promise);
                }
                }
                return retVal;
            }

            static finalizePromises() {
                // coderstate: promisor
                
                function finalizeExecutorFtn(resolveFtn, rejectFtn)  {
                
                    setImmediate(
                        () => {
                            let retVal;
                        
                            let pendingPromises = Promise.pendingPromises();
                            if (pendingPromises.length == 0) {
                                resolveFtn();
                            }
                            else {
                                retVal = Promise.allSettled(pendingPromises).then(
                                    () => {
                                        // coderstate: resolver
                                        return Promise.finalizePromises().
                                            then(resolveFtn, rejectFtn);
                                    },
                                    (reason) => {
                                        // coderstate: rejector
                                        return Promise.finalizePromises().
                                            then(resolveFtn, rejectFtn);
                                    }
                                );
                            }
                            return retVal;
                        }
                    );
                }       
                
                let finalizingPromise = new Promise(finalizeExecutorFtn);
                finalizingPromise.untracked();
                
                return finalizingPromise;
            }
            
            static resolve(value) {
                return new Promise((resolve) => resolve(value));
            }

            static reject(reason) {
                return new Promise((_, reject) => reject(reason));
            }

            static all(promises) {
                return SystemPromise.all(promises);
            }

            static allSettled(promises) {
                return SystemPromise.allSettled(promises)
            }

            static race(promises) {
                return SystemPromise.race(promises);
            }

            // Proxy instance methods
            then(onFulfilled, onRejected) {
                return this._promise.then(onFulfilled, onRejected);
            }

            untracked() {
                if (this._id in PROMISES_PENDING) {
                    delete PROMISES_PENDING[this._id];            
                }
            }

            catch(onRejected) {
                return this._promise.catch(onRejected);
            }

            finally(onFinally) {
                return this._promise.finally(onFinally);
            }
            
            isPending() {
                return this._state === 'pending';
            }

            isResolved() {
                return this._state === 'resolved';
            }

            isRejected() {
                return this._state === 'rejected';
            }

            getValue() {
                return this._value;
            }    
        }

        global.Promise = Promise;
    }
    catch (err) {
        consoleLog("injectProxyPromiseClass throws " + err);
    }
}
module.exports.injectProxyPromiseClass = injectProxyPromiseClass;

/**
 * Calculate an integer power of an int value. Avoids using floating point, so
 * should not have any floating-point round-off errors. `Math.pow()` will probably
 * give the exact same result, but I am doubtful that some implementations might internally use `log` and `exp`
 * to handle `Math.pow()`
 *
 * @function intPow
 *
 * @param {number} i - Integer base
 * @param {number} intPower - integer power
 * @returns {number|undefined} i ^ intPower
 */

function intPow(i, intPower) {
// coderstate: function
    let retVal;

    do {

        try {

            if (Math.floor(intPower) != intPower) {
                // Must be integer
                retVal = undefined;
                break;
            }

            if (intPower == 0) {
                // Handle power of 0: 0^0 is not a number
                if (i == 0) {
                    retVal = NaN;
                }
                else {
                    retVal = 1;
                }
                break;
            }

            if (intPower > 0 && i == 0) {
                retVal = 0;
                break;
            }

            if (intPower < 0 && i == 0) {
                retVal = NaN;
                break;
            }

            if (i == 1) {
                // Multiplying 1 with itself is 1
                retVal = 1;
                break;
            }

            if (intPower == 1) {
                // i ^ 1 is i
                retVal = i;
                break;
            }

            if (intPower < 0) {
                // i^-x is 1/(i^x)
                let intermediate = intPow(i, -intPower);
                if (intermediate) {
                    retVal = 1 / intermediate;
                }
                break;
            }

            // Divide and conquer
            const halfIntPower = intPower >> 1;
            const otherHalfIntPower = intPower - halfIntPower;
            const part1 = intPow(i, halfIntPower);
            if (! part1) {
                break;
            }

            let part2;
            if (halfIntPower == otherHalfIntPower) {
                part2 = part1;
            }
            else {
                part2 =  intPow(i, otherHalfIntPower);
                if (! part2) {
                    break;
                }
            }

            retVal = part1 * part2;
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.intPow = intPow;

/**
 * Extend or shorten a string to an exact length, adding `padChar` as needed
 *
 * @function leftPad
 *
 * @param {string} s - string to be extended or shortened
 * @param {string} padChar - string to append repeatedly if length needs to extended
 * @param {number} len - desired result length
 * @returns {string} padded or shortened string
 */

function leftPad(s, padChar, len) {
// coderstate: function
    let retVal = "";

    do {

        try {

            retVal = s + "";
            if (retVal.length == len) {
                break;
            }

            if (retVal.length > len) {
                retVal = retVal.substring(retVal.length - len);
                break;
            }

            const padLength = len - retVal.length;

            const padding = new Array(padLength + 1).join(padChar)
            retVal = padding + retVal;
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.leftPad = leftPad;

/**
 * Make a log entry of the call of a function. Pass in the `arguments` keyword as a parameter.
 *
 * @function logEntry
 *
 * @param {array} reportingFunctionArguments - pass in the current `arguments` to the function. This is used to determine the function's name for the log
 * @returns {Promise} - a promise that can be used to await the log call completion
 */

function logEntry(reportingFunctionArguments) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    if (LOG_ENTRY_EXIT) {
        retVal = logTrace(reportingFunctionArguments, "Entry");
    }

    return retVal;
}
module.exports.logEntry = logEntry;

/**
 * Make a log entry of an error message. Pass in the `arguments` keyword as the first parameter
 * If the error level is below `LOG_LEVEL_ERROR` nothing happens
 *
 * @function logError
 *
 * @param {any} reportingFunctionArguments - pass in the current `arguments` to the function. This is used to determine the function's name for the log
 * @param {any} message - error message
 * @returns {Promise} - a promise that can be used to await the log call completion
 */
function logError(reportingFunctionArguments, message) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    if (LOG_LEVEL >= LOG_LEVEL_ERROR) {
        if (! message) {
            message = reportingFunctionArguments;
            reportingFunctionArguments = undefined;
        }
        retVal = logMessage(reportingFunctionArguments, LOG_LEVEL_ERROR, message);
    }

    return retVal;
}
module.exports.logError = logError;

/**
 * Make a log entry of the exit of a function. Pass in the `arguments` keyword as a parameter.
 *
 * @function logExit
 *
 * @param {any} reportingFunctionArguments - pass in the current `arguments` to the function. This is used to determine the function's name for the log
 * @returns {Promise} - a promise that can be used to await the log call completion
 */

function logExit(reportingFunctionArguments) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    if (LOG_ENTRY_EXIT) {
        retVal = logTrace(reportingFunctionArguments, "Exit");
    }

    return retVal;
}
module.exports.logExit = logExit;

/**
 * Output a log message. Pass in the `arguments` keyword as the first parameter.
 * 
 * @function logMessage
 *
 * @param {any} reportingFunctionArguments - pass in the current `arguments` to the function. This is used to determine the function's name for the log
 * @param {number} logLevel - log level 0 - 4
 * @param {string} message - the note to output
 * @returns {Promise} - a promise that can be used to await the log call completion
 */

function logMessage(reportingFunctionArguments, logLevel, message) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    let savedInLogger = IN_LOGGER;

    do {
        try {

            IN_LOGGER = true;

            let functionPrefix = "";
            let functionName = "";

            if (! message) {

                message = reportingFunctionArguments;
                reportingFunctionArguments = undefined;

            }
            else if (reportingFunctionArguments) {

                if ("string" == typeof reportingFunctionArguments) {
                    functionName = reportingFunctionArguments;
                }
                else {
                    functionName = functionNameFromArguments(reportingFunctionArguments);
                }

                functionPrefix += functionName + ": ";

            }

            let now = new Date();
            let timePrefix =
                leftPad("" + now.getUTCDate(), "0", 2) +
                "-" +
                leftPad("" + (now.getUTCMonth() + 1), "0", 2) +
                "-" +
                leftPad("" + now.getUTCFullYear(), "0", 4) +
                " " +
                leftPad("" + now.getUTCHours(), "0", 2) +
                ":" +
                leftPad("" + now.getUTCMinutes(), "0", 2) +
                ":" +
                leftPad("" + now.getUTCSeconds(), "0", 2) +
                "+00 ";

            let platformPrefix = "U ";

            let logLevelPrefix = "";
            switch (logLevel) {
                case LOG_LEVEL_ERROR:
                    logLevelPrefix = "ERROR";
                    break;
                case LOG_LEVEL_WARNING:
                    logLevelPrefix = "WARN ";
                    break;
                case LOG_LEVEL_NOTE:
                    logLevelPrefix = "NOTE ";
                    break;
                case LOG_LEVEL_TRACE:
                    logLevelPrefix = "TRACE";
                    break;
                default:
                    logLevelPrefix = "     ";
                    break;
            }

            let logLine = platformPrefix + timePrefix + "- " + logLevelPrefix + ": " + functionPrefix + message;

            let uxpContext = getUXPContext();

            if (LOG_TO_UXPDEVTOOL_CONSOLE) {
                consoleLog(logLine);
            }
            else {
                if (SYNC_LOG_TO_FILEPATH) {
                    fileAppend_(SYNC_LOG_TO_FILEPATH, logLine + "\n");
                }
            }

            if (savedInLogger) {
                // Don't try to use async stuff when nested in logger
                break;
            }

            // Only wait for it to resolve if we have network access
            // Otherwise logging slows down to a crawl because of the polling
            // mechanism used to communicate with the daemon
            let waitForLogConfirmation;
            if (uxpContext && uxpContext.hasNetworkAccess) {
                waitForLogConfirmation = true;
            }

            let evalTQLOptions = { 
                wait: waitForLogConfirmation,
                fromLogger: true
            };

            let promises = [];
            if (LOG_TO_CRDT) {
                let logCRDTPromise = 
                    evalTQL(
                        "logMessage(" + 
                            logLevel + "," + 
                            dQ(functionName) + "," + 
                            dQ(message) + 
                        ")",
                        evalTQLOptions
                    );
                if (waitForLogConfirmation) {
                    promises.push(logCRDTPromise);
                }
            }

            if (LOG_TO_FILEPATH) {
                let appendPromise = 
                    fileAppendString(
                        LOG_TO_FILEPATH, 
                        logLine + "\n",
                        evalTQLOptions);
                if (waitForLogConfirmation) {
                    promises.push(appendPromise);
                }
            }

            if (promises.length) {
                retVal = Promise.all(promises);
            }

        }
        catch (err) {
        }
    }
    while (false);

    IN_LOGGER = savedInLogger;

    return retVal;
}
module.exports.logMessage = logMessage;

/**
 * Make a log entry of a note. Pass in the `arguments` keyword as the first parameter.
 * If the error level is below `LOG_LEVEL_NOTE` nothing happens
 *
 * @function logNote
 *
 * @param {any} reportingFunctionArguments - pass in the current `arguments` to the function. This is used to determine the function's name for the log
 * @param {any} message - the note to output
 * @returns {Promise} - a promise that can be used to await the log call completion
 */
function logNote(reportingFunctionArguments, message) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    if (LOG_LEVEL >= LOG_LEVEL_NOTE) {
        if (! message) {
            message = reportingFunctionArguments;
            reportingFunctionArguments = undefined;
        }
        retVal = logMessage(reportingFunctionArguments, LOG_LEVEL_NOTE, message);
    }

    return retVal;
}
module.exports.logNote = logNote;

/**
 * Emit a trace messsage into the log. Pass in the `arguments` keyword as the first parameter.
 * If the error level is below `LOG_LEVEL_TRACE` nothing happens
 *
 * @function logTrace
 *
 * @param {any} reportingFunctionArguments - pass in the current `arguments` to the function. This is used to determine the function's name for the log
 * @param {any} message - the trace message to output
 * @returns {Promise} - a promise that can be used to await the log call completion
 */
function logTrace(reportingFunctionArguments, message) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    if (LOG_LEVEL >= LOG_LEVEL_TRACE) {
        if (! message) {
            message = reportingFunctionArguments;
            reportingFunctionArguments = undefined;
        }
        retVal = logMessage(reportingFunctionArguments, LOG_LEVEL_TRACE, message);
    }

    return retVal;
}
module.exports.logTrace = logTrace;

/**
 * Emit a warning messsage into the log. Pass in the `arguments` keyword as the first parameter.
 * If the error level is below `LOG_LEVEL_WARNING` nothing happens
 *
 * @function logWarning
 *
 * @param {any} reportingFunctionArguments - pass in the current `arguments` to the function. This is used to determine the function's name for the log
 * @param {any} message - the warning message to output
*/
function logWarning(reportingFunctionArguments, message) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    if (LOG_LEVEL >= LOG_LEVEL_WARNING) {
        if (! message) {
            message = reportingFunctionArguments;
            reportingFunctionArguments = undefined;
        }
        retVal = logMessage(reportingFunctionArguments, LOG_LEVEL_WARNING, message);
    }

    return retVal;
}
module.exports.logWarning = logWarning;

/**
 * The unique `GUID` of this computer
 *
 * Only available to paid developer accounts
 * 
 * @function machineGUID
 *
 * @returns {Promise<string | undefined>} a `GUID` string
 */
function machineGUID() {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            const responsePromise = 
                evalTQL(
                    "machineGUID()"
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text;
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.machineGUID = machineGUID;

/**
 * Launch the PluginInstaller if it is installed and configured
 *
 * @function pluginInstaller
 * 
 * @returns {Promise<boolean|undefined>} success or failure
*/

function pluginInstaller() {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            const responsePromise = 
                evalTQL(
                    "pluginInstaller() ? \"true\" : \"false\""
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // coderstate: resolver
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text == "true";
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.pluginInstaller = pluginInstaller;

/**
 * Restore the log level to what it was when pushLogLevel was called
 *
 * @function popLogLevel
 *
 * @returns {number} log level that was popped off the stack
 */

function popLogLevel() {
// coderstate: function
    let retVal;

    retVal = LOG_LEVEL;
    if (LOG_LEVEL_STACK.length > 0) {
        LOG_LEVEL = LOG_LEVEL_STACK.pop();
    }
    else {
        LOG_LEVEL = LOG_LEVEL_OFF;
    }

    return retVal;
}
module.exports.popLogLevel = popLogLevel;

/**
 * Convert a callback-based function into a Promise
 *
 * @function promisify
 *
 * @param {function} ftn - callback-based function
 * @returns {function} promisified function
 */

function promisify(ftn) {
// coderstate: function
   return (...args) => {

     return new Promise(
        function executorFtn(resolveFtn, rejectFtn) {
        // coderstate: executor

        args.push(
            (err, ...results) => {
                if (err) {
                    return rejectFtn(err)
                }
                return resolveFtn(results.length === 1 ? results[0] : results);
            }
        );
        ftn.call(this, ...args)
      })

   }
}
module.exports.promisify = promisify;

/**
 * Convert a callback-based member function into a Promise
 *
 * @function promisifyWithContext
 *
 * @param {function} ftn - callback-based function
 * @returns {function} promisified function
 */

function promisifyWithContext(ftn, context) {
// coderstate: function
   return (...args) => {

     return new Promise(
        function executorFtn(resolveFtn, rejectFtn) {
        // coderstate: executor

        args.push(
            (err, ...results) => {
                if (err) {
                    return rejectFtn(err)
                }
                return resolveFtn(results.length === 1 ? results[0] : results);
            }
        );
        ftn.call(context, ...args)
      })

   }
}
module.exports.promisifyWithContext = promisifyWithContext;

/**
 * Save the previous log level and set a new log level
 *
 * @function pushLogLevel
 *
 * @param {number} newLogLevel - new log level to set
 * @returns {number} previous log level
 */

function pushLogLevel(newLogLevel) {
// coderstate: function
    let retVal;

    retVal = LOG_LEVEL;
    LOG_LEVEL_STACK.push(LOG_LEVEL);
    LOG_LEVEL = newLogLevel;

    return retVal;
}
module.exports.pushLogLevel = pushLogLevel;

/**
 * Make a 'fake string' into a byte array. Not UTF8-aware
 *
 * @function rawStringToByteArray
 *
 * @param {string} in_str - a raw string (possibly invalid UTF-8)
 * @returns {array|undefined} an array of bytes
 */
function rawStringToByteArray(in_str) {
// coderstate: function
    let retVal = [];

    try {

        for (let idx = 0; idx < in_str.length; idx++) {
            let c = in_str.charCodeAt(idx);
            if (c > 255) {
                retVal = undefined;
                break;
            }
            retVal.push(c);
        }

    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return retVal;
}
module.exports.rawStringToByteArray = rawStringToByteArray;

/**
 * Read a bunch of text and try to extract structured information in .INI format
 *
 * This function is lenient and is able to extract slightly mangled INI data from the text frame
 * content of an InDesign text frame.
 *
 * This function knows how to handle curly quotes should they be present.
 *
 * The following flexibilities have been built-in:
 *
 * - Attribute names are case-insensitive and anything not `a-z 0-9` is ignored.
 * Entries like `this or that = ...` or `thisOrThat = ...` or `this'orThat = ...` are
 * all equivalent. Only letters and digits are retained, and converted to lowercase.
 *
 * - Attribute values can be quoted with either single, double, curly quotes.
 * This often occurs because InDesign can be configured to convert normal quotes into
 * curly quotes automatically.
 * Attribute values without quotes are trimmed (e.g. `bla =    x  ` is the same as `bla=x`)
 * Spaces are retained in quoted attribute values.
 *
 * - Any text will be ignore if not properly formatted as either a section name or an attribute-value
 * pair with an equal sign
 *
 * - Hard and soft returns are equivalent
 *
 * The return value is an object with the section names at the top level, and attribute names
 * below that. The following .INI
 * ```
 * [My data]
 * this is = " abc "
 * that =      abc
 * ```
 * returns
 * ```
 * {
 *   "mydata": {
 *      "__rawSectionName": "My data",
 *      "thisis": " abc ",
 *      "that": "abc"
 *   }
 * }
 * ```
 *
 * Duplicated sections and entries are automatically suffixed with a counter suffix - e.g.
 * 
 * [main]
 * a=1
 * a=2
 * a=3
 * 
 * is equivalent with 
 * 
 * [main]
 * a=1
 * a_2=2
 * a_3=3
 * 
 * [a]
 * a=1
 * [a]
 * a=2
 * 
 * is equivalent with
 * 
 * [a]
 * a=1
 * [a_2]
 * a=2
 * 
 * @function readINI
 *
 * @param {string} in_text - raw text, which might or might not contain some INI-formatted data mixed with normal text
 * @returns {object} either the ini data or `undefined`.
 */

function readINI(in_text) {
// coderstate: function
    let retVal = undefined;

    do {

        try {

            if (! in_text) {
                break;
            }

            if ("string" != typeof in_text) {
                break;
            }

            let text = in_text + "\r";
            let state = STATE_IDLE;
            let attr = "";
            let value = "";
            let attrSpaceCount = 0;
            let rawSectionName = "";
            let sectionName = "";
            let section = undefined;
            let attrCounters = {};
            let sectionCounters = {};

            for (let idx = 0; state != STATE_ERROR && idx < text.length; idx++) {
                const c = text.charAt(idx);
                switch (state) {
                    default:
                        state = STATE_ERROR;
                        break;
                    case STATE_IDLE:
                        if (c == '[') {
                            state = STATE_SEEN_OPEN_SQUARE_BRACKET;
                            rawSectionName = "";
                        }
                        else if (c == '#') {
                            state = STATE_IN_COMMENT;
                        }
                        else if (c > ' ') {
                            attr = c;
                            attrSpaceCount = 0;
                            state = STATE_SEEN_NON_WHITE;
                        }
                        break;
                    case STATE_IN_COMMENT:
                    case STATE_SEEN_CLOSE_SQUARE_BRACKET:
                        if (c == '\r' || c == '\n') {
                            state = STATE_IDLE;
                        }
                        break;
                    case STATE_SEEN_OPEN_SQUARE_BRACKET:
                        if (c == ']') {
                            state = STATE_SEEN_CLOSE_SQUARE_BRACKET;
                            sectionName = rawSectionName.toLowerCase();
                            sectionName = sectionName.replace(REGEXP_DESPACE, REGEXP_DESPACE_REPLACE);
                            sectionName = sectionName.replace(REGEXP_SECTION_NAME_ONLY, REGEXP_SECTION_NAME_ONLY_REPLACE);
                            if (sectionName) {

                                if (! retVal) {
                                    retVal = {};
                                }

                                let sectionSuffix = "";
                                let sectionCounter = 1;
                                if (sectionName in sectionCounters) {
                                    sectionCounter = sectionCounters[sectionName];
                                    sectionCounter++;
                                    sectionSuffix = "_" + sectionCounter;
                                }
                                sectionCounters[sectionName] = sectionCounter;
                                sectionName += sectionSuffix;
                                section = {};
                                retVal[sectionName] = section;
                                // @ts-ignore
                                section.__rawSectionName = rawSectionName;
                                attrCounters = {};
                            }
                        }
                        else {
                            rawSectionName += c;
                        }
                        break;
                    case STATE_SEEN_NON_WHITE:
                        if (c == "=") {
                            value = "";
                            state = STATE_SEEN_EQUAL;
                        }
                        else if (c == '\r' || c == '\n') {
                            state = STATE_IDLE;
                        }
                        else if (c != " ") {
                            while (attrSpaceCount > 0) {
                                attr += " ";
                                attrSpaceCount--;
                            }
                            attr += c;
                        }
                        else {
                            attrSpaceCount++;
                        }
                        break;
                    case STATE_SEEN_EQUAL:
                        if (c != '\r' && c != '\n') {
                            value += c;
                        }
                        else {
                            value = value.replace(REGEXP_TRIM, REGEXP_TRIM_REPLACE);
                            if (value.length >= 2) {
                                let firstChar = value.charAt(0);
                                let lastChar = value.charAt(value.length - 1);
                                if (
                                    (firstChar == "\"" || firstChar == "“" || firstChar == "”")
                                &&
                                    (lastChar == "\"" || lastChar == "“" || lastChar == "”")
                                ) {
                                    value = value.substring(1, value.length - 1);
                                }
                                else if (
                                    (firstChar == "'" || firstChar == "‘" || firstChar == "’")
                                &&
                                    (lastChar == "'" || lastChar == "‘" || lastChar == "’")
                                ) {
                                    value = value.substring(1, value.length - 1);
                                }
                            }

                            if (section) {
                                attr = attr.replace(REGEXP_DESPACE, REGEXP_DESPACE_REPLACE).toLowerCase();
                                attr = attr.replace(REGEXP_ALPHA_ONLY, REGEXP_ALPHA_ONLY_REPLACE);
                                if (attr) {

                                    let attrSuffix = "";
                                    let attrCounter = 1;
                                    if (attr in attrCounters) {
                                        attrCounter = attrCounters[attr];
                                        attrCounter++;
                                        attrSuffix = "_" + attrCounter;
                                    }
                                    attrCounters[attr] = attrCounter;
                                    attr += attrSuffix;

                                    section[attr] = value;
                                }
                            }

                            state = STATE_IDLE;
                        }
                        break;
                }
            }
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.readINI = readINI;

/**
 * Extend or shorten a string to an exact length, adding `padChar` as needed
 *
 * @function rightPad
 *
 * @param {string} s - string to be extended or shortened
 * @param {string} padChar - string to append repeatedly if length needs to extended
 * @param {number} len - desired result length
 * @returns {string} padded or shortened string
 */

function rightPad(s, padChar, len) {
// coderstate: function
    let retVal = "";

    do {
        try {

            retVal = s + "";

            if (retVal.length == len) {
                break;
            }

            if (retVal.length > len) {
                retVal = retVal.substring(0, len);
                break;
            }

            const padLength = len - retVal.length;

            const padding = new Array(padLength + 1).join(padChar)
            retVal = retVal + padding;
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.rightPad = rightPad;

/**
 * Fetch a localized string.
 *
 * @function s
 *
 * @param {string} stringCode - a token for the string to be localized (e.g. BTN_OK)
 * @param {string=} locale - a locale. Optional - defaults to "en_US"
 * @returns {string} a localized string. If the stringCode is not found, returns the stringCode itself.
 */
function S(stringCode, locale) {
// coderstate: function
    let retVal = stringCode;

    do {

        try {
            if (! locale) {
                locale = DEFAULT_LOCALE;
            }

            if (! (stringCode in LOCALE_STRINGS)) {
                break;
            }

            const localeStrings = LOCALE_STRINGS[stringCode];
            if (locale in localeStrings) {
                retVal = localeStrings[locale]; 
            }
            else if (LOCALE_EN_US in localeStrings) {
                retVal = localeStrings[LOCALE_EN_US];
            }

        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.S = S;

/**
 * Send in activation data so the daemon can determine whether some software is currently activated or not.
 *
 * Needs to be followed by a `sublicense()` call
 *
 * @function setIssuer
 *
 * @param {string} issuerGUID - a GUID identifier for the developer account as seen in the PluginInstaller
 * @param {string} issuerEmail - the email for the developer account as seen in the PluginInstaller
 * @returns {Promise<boolean|undefined>} - success or failure
 */
function setIssuer(issuerGUID, issuerEmail) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {
            const responsePromise = 
                evalTQL(
                    "setIssuer(" + dQ(issuerGUID) + "," + dQ(issuerEmail) + ") ? \"true\" : \"false\""
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // codestate: resolver 
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text == "true";
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.setIssuer = setIssuer;

/**
 * Wrap a string or a byte array into single quotes, encoding any
 * binary data as a string. Knows how to handle Unicode characters
 * or binary zeroes.
 *
 * When the input is a string, high Unicode characters are
 * encoded as `\uHHHH`
 *
 * When the input is a byte array, all bytes are encoded as `\xHH` escape sequences.
 *
 * @function sQ
 *
 * @param {string} s_or_ByteArr - a Unicode string or an array of bytes
 * @returns {string} a string enclosed in double quotes. This string is pure 7-bit
 * ASCII and can be used into generated script code
 * Example:
 * `let script = "a=b(" + sQ(somedata) + ");";`
 */
function sQ(s_or_ByteArr) {
// coderstate: function
    let retVal;

    try {
        retVal = enQuote__(s_or_ByteArr, "'");
    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return retVal;
}
module.exports.sQ = sQ;

/**
 * Store some persistent data (e.g. a time stamp to determine a demo version lapsing)
 *
 * Only available to paid developer accounts
 *
 * @function setPersistData
 *
 * @param {string} issuer - a GUID identifier for the developer account as seen in the PluginInstaller
 * @param {string} attribute - an attribute name for the data
 * @param {string} password - the password (created by the developer) needed to decode the persistent data
 * @param {string} data - any data to persist
 * @returns {Promise<boolean|undefined>} success or failure
 */
function setPersistData(issuer, attribute, password, data) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            const responsePromise = 
                evalTQL(
                    "setPersistData(" + 
                        dQ(issuer) + "," + 
                        dQ(attribute) + "," + 
                        dQ(password) + "," + 
                        dQ(data) + 
                    ") ? \"true\" : \"false\""
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // codestate: resolver 
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text == "true";
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.setPersistData = setPersistData;

/**
 * Remove a trailing separator, if any, from a path
 *
 * @function stripTrailingSeparator
 *
 * @param {string} filePath - a file path 
 * @param {string=} separator - the separator to use. If omitted, will try 
 * guess the separator.
 * @returns the file path without trailing separator
 */

function stripTrailingSeparator(filePath, separator) {
// coderstate: function
    let retVal = filePath;

    do {

        try {

            if (! filePath) {
                break; 
            }

            const lastChar = filePath.substr(-1); 
            if (! separator) {
                if (lastChar == crdtuxp.path.SEPARATOR || lastChar == crdtuxp.path.OTHER_PLATFORM_SEPARATOR) {
                    retVal = filePath.substr(0, filePath.length - 1); 
                }
            }
            else {
                if (lastChar == separator) {
                    retVal = filePath.substr(0, filePath.length - 1);
                }
            }

        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.stripTrailingSeparator = stripTrailingSeparator;

/**
 * Encode a string into an byte array using UTF-8
 *
 * @function strToUTF8
 *
 * @param {string} in_s - a string
 * @returns {array|undefined} a byte array
 */
function strToUTF8(in_s) {
// coderstate: function
    let retVal = undefined;

    try {

        let idx = 0;
        let len = in_s.length;
        let cCode;
        while (idx < len) {
            cCode = in_s.charCodeAt(idx);
            idx++;
            let bytes = charCodeToUTF8__(cCode);
            if (! bytes) {
                retVal = undefined;
                break;
            }
            else {
                for (let byteIdx = 0; byteIdx < bytes.length; byteIdx++) {
                    if (! retVal) {
                        retVal = [];
                    }
                    retVal.push(bytes[byteIdx]);
                }
            }
        }

    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return retVal;
}
module.exports.strToUTF8 = strToUTF8;

/**
 * Send in sublicense info generated in the PluginInstaller so the daemon can determine whether some software is currently activated or not.
 *
 * Needs to be preceded by a `setIssuer()` call.
 *
 * @function sublicense
 *
 * @param {string} key - key needed to decode activation data
 * @param {string} activation - encrypted activation data
 * @returns { Promise<boolean|undefined> } success or failure
 */
function sublicense(key, activation) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {

        try {

            const responsePromise = 
                evalTQL(
                    "sublicense(" + dQ(key) + "," + dQ(activation) + ") ? \"true\" : \"false\""
                );
            if (! responsePromise) {
                break;
            }

            function evalTQLResolveFtn(response) {
                // codestate: resolver 
                let retVal;

                do {
                    if (! response || response.error) {
                        crdtuxp.logError(arguments, "bad response, error = " + response?.error);
                        break;
                    }

                    retVal = response.text == "true";
                }
                while (false);

                return retVal;
            };

            function evalTQLRejectFtn(reason) {
                // coderstate: rejector
                crdtuxp.logError(arguments, "rejected for " + reason);
                return undefined;
            };

            retVal = responsePromise.then(
                evalTQLResolveFtn,
                evalTQLRejectFtn
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.sublicense = sublicense;

/**
 * Test if we can access the path-based file I/O APIs
 *
 * @function testDirectFileAccess
 *
 * @returns {boolean} whether APIs are accessible
 */
function testDirectFileAccess() {
// coderstate: function
    let retVal = false;

    do {
        try {
            let uxpContext = crdtuxp.getUXPContext();
            if (! uxpContext) {
                crdtuxp.logError(arguments, "failed to get uxpContext");
                break;
            }

            let homeDir = uxpContext.os.homedir(); 
            if (! homeDir) {
                crdtuxp.logError(arguments, "failed to os.homedir()");
                break;
            }

            // https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/fs/
            const stats = uxpContext.fs.lstatSync(homeDir);
            if (stats && stats.isDirectory()) {
                retVal = true;
            }
        }
        catch (err) {
        }
    }
    while (false);

    return retVal;
}
module.exports.testDirectFileAccess = testDirectFileAccess;
    
/**
 * Test if we can access the network APIs
 *
 * @function testNetworkAccess
 *
 * @returns {Promise<boolean|undefined>} whether APIs are accessible
 */

function testNetworkAccess() {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_FALSE;

    try {

        let context = crdtuxp.getContext();        
        let savedForceUseDaemon = context.IS_FORCE_USE_DAEMON;
        let savedForceDaemonFileBasedAPI = context.IS_FORCE_DAEMON_FILE_BASED_API;

        let uxpContext = crdtuxp.getUXPContext();        
        let savedHasNetworkAccess = uxpContext.hasNetworkAccess;

        context.IS_FORCE_USE_DAEMON = true;
        context.IS_FORCE_DAEMON_FILE_BASED_API = false;
        uxpContext.hasNetworkAccess = true;

        try {

            return crdtuxp.base64encode("abc").then(
                function blowPipesResolveFtn(result) {
                    return result == "YWJj";
                }
            ).catch(
                function blowPipesRejectFtn(reason) {
                    return false;
                }
            );
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }

        uxpContext.hasNetworkAccess = savedHasNetworkAccess;
        context.IS_FORCE_USE_DAEMON = savedForceUseDaemon;
        context.IS_FORCE_DAEMON_FILE_BASED_API = savedForceDaemonFileBasedAPI;
    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return retVal;
}
module.exports.testNetworkAccess = testNetworkAccess;

/**
 * Convert an integer into a hex representation with a fixed number of digits.
 * Negative numbers are converted using 2-s complement (so `-15` results in `0x01`)
 *
 * @function toHex
 *
 * @param {number} i - integer to convert to hex
 * @param {number} numDigits - How many digits. Defaults to 4 if omitted.
 * @returns { string } hex-encoded integer
 */

let TO_HEX_BUNCH_OF_ZEROES = "";
function toHex(i, numDigits) {
// coderstate: function
    let retVal = "";

    do {

        try {

            if (! numDigits) {
                numDigits = 4;
            }

            if (i < 0) {
                let upper = intPow(2, numDigits*4);
                if (! upper) {
                    break;
                }

                // Calculate 2's complement with numDigits if negative
                i = (upper + i) & (upper - 1);
            }

            // Calculate and cache a long enough string of zeroes
            let zeroes = TO_HEX_BUNCH_OF_ZEROES;
            if (! zeroes) {
                zeroes = "0";
            }
            if (zeroes.length < numDigits) {
                while (zeroes.length < numDigits) {
                    zeroes += zeroes;
                }
                TO_HEX_BUNCH_OF_ZEROES = zeroes;
            }

            retVal = i.toString(16).toLowerCase(); // Probably always lowercase by default, but just in case...
            if (retVal.length > numDigits) {
                retVal = retVal.substring(retVal.length - numDigits);
            }
            else if (retVal.length < numDigits) {
                retVal = zeroes.substring(0, numDigits - retVal.length) + retVal;
            }

        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}
module.exports.toHex = toHex;

/**
 * Conversion factor from a length unit into inches
 *
 * @function unitToInchFactor
 *
 * @param {string} in_unit - unit name (`crdtes.UNIT_NAME...`)
 * @returns {number} conversion factor or 1.0 if unknown/not applicable
 */

function unitToInchFactor(in_unit) {
// coderstate: function
    let retVal = 1.0;

    try {
        switch (in_unit) {
            case crdtuxp.UNIT_NAME_CM:
                retVal = 1.0/2.54;
                break;
            case crdtuxp.UNIT_NAME_MM:
                retVal = 1.0/25.4;
                break;
            case crdtuxp.UNIT_NAME_CICERO:
                retVal = 0.17762;
                break;
            case crdtuxp.UNIT_NAME_PICA:
                retVal = 1.0/12.0;
                break;
            case crdtuxp.UNIT_NAME_PIXEL:
                retVal = 1.0/72.0;
                break;
            case crdtuxp.UNIT_NAME_POINT:
                retVal = 1.0/72.0;
                break;
        }
    }
    catch (err) {
        crdtuxp.logError(arguments, "throws " + err);
    }

    return retVal;
}
module.exports.unitToInchFactor = unitToInchFactor;

/**
 * Wait for a file to appear. Only works in UXP contexts with direct file access
 *
 * @function waitForFile
 *
 * @param {string} filePath - file that needs to appear
 * @param {number=} interval - how often to check for file (milliseconds)
 * @param {number=} timeout - how long to wait for file (milliseconds)
 * @returns {Promise<boolean|undefined>} whether file appeared or not
 */

function waitForFile(
    filePath, 
    interval = DEFAULT_WAIT_FILE_INTERVAL_MILLISECONDS, 
    timeout = DEFAULT_WAIT_FILE_TIMEOUT_MILLISECONDS) {
// coderstate: promisor
    let retVal = RESOLVED_PROMISE_UNDEFINED;

    do {
        try {

            var uxpContext = getUXPContext();

            if (! uxpContext.hasDirectFileAccess) {
                crdtuxp.logError(arguments, "need direct file access");
                break;
            }

            let endTime = (new Date()).getTime() + timeout;

             function checkFile() {
                 // coderstate: promisor

                function checkFileExecutor(resolveFtn, rejectFtn) {
                    // coderstate: executor
                    const now = Date.now();

                    if (endTime < now) {
                        crdtuxp.logNote(arguments, "already timed out");
                        resolveFtn(undefined);
                    } else {
                        try {
                            // https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/fs/
                            const stats = uxpContext.fs.lstatSync(filePath);
                            if (stats) {
                                crdtuxp.logTrace(arguments, "file appeared");
                                resolveFtn(true);
                            } else {
                                crdtuxp.logNote(arguments, "no stats returned");
                                delayFunction(interval, checkFile).
                                    then(
                                        resolveFtn,
                                        rejectFtn
                                    );
                            }
                        } 
                        catch (err) {
                            if (err != FILE_NOT_EXIST_ERROR) {
                                crdtuxp.logNote(arguments, "throws " + err);
                            }
                            else {
                                crdtuxp.logTrace(arguments, "file not present yet");
                            }
                            delayFunction(interval, checkFile).
                                then(
                                    resolveFtn,
                                    rejectFtn
                                );
                        }
                    }
                };

                return new Promise(checkFileExecutor);
            };

            retVal = checkFile();
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;

}
module.exports.waitForFile = waitForFile;