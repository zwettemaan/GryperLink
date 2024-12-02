//
// This code can be shared between CEP/JavaScript, ExtendScript and UXPScript
//

(function(){

/**
* Make a copy of an object or array so it is equivalent, but does not share any references.
* Do this recursively on all nested objects 
* 
* @function GrpL.deepClone
* 
* @param {any} obj - What we want to clone
* @return a deep clone of the object
*/

var logLevelStack = [];

GrpL.deepClone = function deepClone(obj) {

    var retVal = undefined;

    GrpL.logEntry(arguments);

    do {
        try {
            
            if ("object" != typeof obj) {
                retVal = obj;
                break;
            }

            if (! obj) {
                retVal = obj;
                break;
            }

            var clone;
            if (obj instanceof Array) {
                clone = [];
            }
            else {
                clone = {};        
            }

            for (var x in obj) 
            {
                var val = obj[x];
                if (typeof val == "object")
                {
                    clone[x] = GrpL.deepClone(val);
                }
                else
                {
                    clone[x] = val;
                }
            }

            retVal = clone;
        }
        catch (err) {
            GrpL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    GrpL.logExit(arguments);

    return retVal;
}

/**
* Wrap a string in double quotes, so that eval(GrpL.dQ(x)) == x 
* 
* @function GrpL.dQ
* 
* @param {string} s - string to be quoted
* @return a copy of s wrapped in quotes
*/

GrpL.dQ = function(s) {
    return '"' + s.toString().replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r") + '"';
}


GrpL.leftPad = function leftPad(s, padChar, len) {

    var retVal = undefined;

    GrpL.logEntry(arguments);

    do {
        try {

            retVal = s + "";

            if (retVal.length > len) {
                retVal = retVal.substring(retVal.length - len);
                break;
            }

            var padLength = len - retVal.length;

            var padding = new Array(padLength + 1).join(padChar)
            retVal = padding + retVal;
        }
        catch (err) {
            GrpL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    GrpL.logExit(arguments);

    return retVal;
}

/**
* Call this function when entering any function. A typical usage is 
*   function myFunction()
*   {
*    var retVal = defaultValue;
*    GrpL.logEntry(arguments);
* ...
*    GrpL.logExit(arguments);
*    return retVal;
*   }
* 
* @function GrpL.logEntry
* 
* @param {array} arguments - pass in the arguments of the calling function
*/

GrpL.logEntry = function(reportingFunctionArguments) {
    if (GrpL.S.LOG_ENTRY_EXIT) {
        GrpL.logTrace(reportingFunctionArguments, "Entry");
    }
}

/**
* Call this function when reporting an error condition 
* ...
*    if (somethingBad) {
*      GrpL.logError(arguments,"Something bad happened");
*    }
* 
* @function GrpL.logError
* 
* @param {array} arguments - pass in the arguments of the calling function
* @param {string} message - an error message
*/

GrpL.logError = function(reportingFunctionArguments, s) {
    if (GrpL.S.LOG_LEVEL >= GrpL.C.LOG_ERROR) {
        if (! s) {
            s = reportingFunctionArguments;
            reportingFunctionArguments = undefined;
        }
        GrpL.logMessage(reportingFunctionArguments, "ERROR", s);
    }
}

/**
* Call this function when exiting any function. A typical usage is 
*   function myFunction()
*   {
*    var retVal = defaultValue;
*    GrpL.logEntry(arguments);
* ...
*    GrpL.logExit(arguments);
*    return retVal;
*   }
* 
* @function GrpL.logExit
* 
* @param {array} arguments - pass in the arguments of the calling function
*/

GrpL.logExit = function(reportingFunctionArguments) {
    if (GrpL.S.LOG_ENTRY_EXIT) {
        GrpL.logTrace(reportingFunctionArguments, "Exit");
    }
}

/**
* Call this function when reporting some interesting condition 
* ...
*    if (somethingNoteworthy) {
*      GrpL.logNote(arguments,"Something bad happened");
*    }
* 
* @function GrpL.logNote
* 
* @param {array} arguments - pass in the arguments of the calling function
* @param {string} message - an note
*/

GrpL.logNote = function(reportingFunctionArguments, s) {
    if (GrpL.S.LOG_LEVEL >= GrpL.C.LOG_NOTE) {
        if (! s) {
            s = reportingFunctionArguments;
            reportingFunctionArguments = undefined;
        }
        GrpL.logMessage(reportingFunctionArguments, "NOTE", s);
    }
}

/**
* Call this function when reporting some verbose, tracing info
*    
* ...
*    GrpL.logTrace(arguments,"About to call some doodad");
* ...
* 
* @function GrpL.logTrace
* 
* @param {array} arguments - pass in the arguments of the calling function
* @param {string} message - an trace message
*/

GrpL.logTrace = function(reportingFunctionArguments, s) {
    if (GrpL.S.LOG_LEVEL >= GrpL.C.LOG_TRACE) {
        if (! s) {
            s = reportingFunctionArguments;
            reportingFunctionArguments = undefined;
        }
        GrpL.logMessage(reportingFunctionArguments, "TRACE", s);
    }
}

/**
* Call this function when reporting an unexpected condition
*    
*    if (someStringIsUnexpectedlyEmpty) {
*      GrpL.logWarning(arguments,"Did not expect to get an empty string");
*    }
* 
* @function GrpL.logWarning
* 
* @param {array} arguments - pass in the arguments of the calling function
* @param {string} message - an trace message
*/

GrpL.logWarning = function(reportingFunctionArguments, s) {
    if (GrpL.S.LOG_LEVEL >= GrpL.C.LOG_WARN) {
        if (! s) {
            s = reportingFunctionArguments;
            reportingFunctionArguments = undefined;
        }
        GrpL.logMessage(reportingFunctionArguments, "WARN", s);
    }
}

/**
* Change the log level and restore what it was set to before the preceding call to pushLogLevel()
*
* @function GrpL.popLogLevel
* 
* @return the previous log level before the popLogLevel()
*          
*/

GrpL.popLogLevel = function popLogLevel() {

    var retVal;

    retVal = GrpL.S.LOG_LEVEL;
    if (logLevelStack.length > 0) {
        GrpL.S.LOG_LEVEL = logLevelStack.pop();
    }
    else {
        GrpL.S.LOG_LEVEL = GrpL.C.LOG_NONE;
    }
    
    return retVal;
}

/**
* Change the log level and save the previous log level on a
* stack.
*
* @function GrpL.pushLogLevel
* 
* @param {integer} newLogLevel  - new log level
* @return the previous log level
*          
*/

GrpL.pushLogLevel = function pushLogLevel(newLogLevel) {

    var retVal;

    retVal = GrpL.S.LOG_LEVEL;
    logLevelStack.push(GrpL.S.LOG_LEVEL);
    GrpL.S.LOG_LEVEL = newLogLevel;

    return retVal;
}

/**
* Generate some GUID. This is not really a 'proper' GUID generator, 
* but for our needs it'll do.
*
* @function GrpL.randomGUID
* 
* @return a random GUID in XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX format
* XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
*           111 1111 1222 222222333333
* 01234567 9012 4567 9012 456789012345
*          
*/

GrpL.randomGUID = function randomGUID() 
{
    var retVal = "";

    GrpL.logEntry(arguments);

    for (var wordIdx = 0; wordIdx < 8; wordIdx++)
    {
        var r = Math.round(Math.random() * 65536);
        var r = GrpL.toHex(r,4);
        retVal = retVal + r;
        if (wordIdx >= 1 && wordIdx <= 4)
        {
            retVal = retVal + "-";
        }
    }
    
    GrpL.logExit(arguments);

    return retVal;
}

GrpL.rightPad = function rightPad(s, padChar, len) {

    var retVal = undefined;

    GrpL.logEntry(arguments);

    do {
        try {

            retVal = s + "";

            if (retVal.length > len) {
                retVal = retVal.substring(0,len);
                break;
            }

            var padLength = len - retVal.length;

            var padding = new Array(padLength + 1).join(padChar)
            retVal += padding;
        }
        catch (err) {
            GrpL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    GrpL.logExit(arguments);

    return retVal;
}

/**
* Make a copy of an object so it is equivalent, but does not share any references. 
* Do not apply this on any nested objects
* 
* @function GrpL.shallowClone
* 
* @param {any} obj - What we want to clone
* @return a shallow clone of the object
*/

GrpL.shallowClone = function shallowClone(obj) {

    var retVal = undefined;

    GrpL.logEntry(arguments);

    do {
        try {

            if ("object" != typeof obj) {
                retVal = obj;
                break;
            }

            if (! obj) {
                retVal = obj;
                break;
            }

            var clone;
            if (obj instanceof Array) {
                clone = [];
            }
            else {
                clone = {};        
            }

            for (var x in obj) 
            {
                clone[x] = obj[x];
            }

            retVal = clone;
        }
        catch (err) {
            GrpL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    GrpL.logExit(arguments);

    return retVal;
}

/**
* Wrap a string in single quotes, so that eval(GrpL.sQ(x)) == x 
* 
* @function GrpL.sQ
* 
* @param {string} s - string to be quoted
* @return a copy of s wrapped in quotes
*/

GrpL.sQ = function(s) {
    return "'" + s.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\n/g,"\\n").replace(/\r/g,"\\r") + "'";
}

/**
* Convert a positive integer to a fixed-length hexadecimal number
* 
* @function GrpL.toHex
* 
* @param {number} value - value to be converted
* @param {number} numDigits - how many digits
* @return a hexadecimal string or undefined
*/

GrpL.toHex = function toHex(value, numDigits) 
{
    var retVal = undefined;

    GrpL.logEntry(arguments);

    do {
        try {

            if ("number" != typeof(value)) {
                GrpL.logError(arguments, "value is not a number");
                break;
            }

            if (isNaN(value)) {
                GrpL.logError(arguments, "value is NaN");
                break;
            }

            if (value < 0) {
                GrpL.logError(arguments, "negative value");
                break;
            }

            if (Math.floor(value) != value) {
                GrpL.logError(arguments, "value has decimals");
                break;
            }

            var hexString = value.toString(16);
            if (hexString.length > numDigits) {
                hexString = hexString.substring(hexString.length - numDigits);
            }
            else if (hexString.length < numDigits) {
                hexString = Array(numDigits - hexString.length + 1).join("0") + hexString;
            }

            retVal = hexString.toUpperCase();
        }
        catch (err) {
            GrpL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    GrpL.logExit(arguments);

    return retVal;
}

})();