//
// This code is exclusively ExtendScript. It provides ExtendScript-specific 
// implementations of the utils API.
//
// utils.js depends on these functions being implemented
// When adding new functionality here, make sure to also 
// add corresponding tests to the utils_verifyDependencies()
//

(function() {

GrpL.alert = function _alert(msg) {  // Use `_alert`, instead of `alert` to avoid infinite recursion

    GrpL.logEntry(arguments);

    alert(msg); // Built-in should not match function name of this function - that's why we use `_alert`
    
    GrpL.logExit(arguments);

}

GrpL.checkMac = function checkMac() {    

    GrpL.logEntry(arguments);

    var retVal = $.os.substr(0,3) == "Mac";

    GrpL.logExit(arguments);

    return retVal;
};

GrpL.checkWindows = function checkWindows() {    

    var retVal = undefined;

    GrpL.logEntry(arguments);

    retVal = $.os.substr(0,3) == "Win";

    GrpL.logExit(arguments);

    return retVal;
}

GrpL.logMessage = function(reportingFunctionArguments, levelPrefix, message) {

    var savedInLogger = GrpL.inLogger;

    do {
        try {

            if (GrpL.inLogger) {
                break;
            }
            
            GrpL.inLogger = true;
            
            var functionPrefix = "";

            if (! message) {

                  message = reportingFunctionArguments;
                  reportingFunctionArguments = undefined;

            }
            else if (reportingFunctionArguments) {

                if ("string" == typeof reportingFunctionArguments) {

                    functionPrefix += reportingFunctionArguments + ": ";
                    
                }
                else {

                    var reportingFunctionName;
                    try {
                        reportingFunctionName = reportingFunctionArguments.callee.toString().match(/function ([^\(]+)/)[1];
                    }
                    catch (err) {
                        reportingFunctionName = "[anonymous function]";
                    }
                    functionPrefix += reportingFunctionName + ": ";

                }
            }
            
            var now = new Date();
            var timePrefix = 
                GrpL.leftPad(now.getUTCDate(), "0", 2) + 
                "-" + 
                GrpL.leftPad(now.getUTCMonth() + 1, "0", 2) + 
                "-" + 
                GrpL.leftPad(now.getUTCFullYear(), "0", 4) + 
                " " + 
                GrpL.leftPad(now.getUTCHours(), "0", 2) + 
                ":" + 
                GrpL.leftPad(now.getUTCMinutes(), "0", 2) + 
                ":" + 
                GrpL.leftPad(now.getUTCSeconds(), "0", 2) + 
                "+00 ";

            var platformPrefix = "E ";

            var logLine = platformPrefix + timePrefix + "- " + levelPrefix + ": " + functionPrefix + message;

            if (GrpL.S.LOG_TO_FILEPATH) {
                GrpL.fileio.appendUTF8TextFile(
                    GrpL.S.LOG_TO_FILEPATH, 
                    logLine, 
                    GrpL.fileio.FILEIO_APPEND_NEWLINE);
            }
                    
            if (GrpL.S.LOG_TO_ESTK_CONSOLE) {
                $.writeln(logLine); 
            }

        }
        catch (err) {
        }
    }
    while (false);

    GrpL.inLogger = savedInLogger;
}

})();