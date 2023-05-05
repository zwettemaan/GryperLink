(function() {

function declareAPI() {

    GrpL.S.LOG_ENTRY_EXIT                = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.S.LOG_CRITICAL_ERRORS           = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.S.LOG_LEVEL                     = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.S.LOG_TO_CHROME_CONSOLE         = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.S.LOG_TO_ESTK_CONSOLE           = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.S.LOG_TO_UXPDEVTOOL_CONSOLE     = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.S.RUN_TESTS                     = GrpL.VALUE_NOT_INITIALIZED;

}

//--------------- Tests

GrpL.tests.checkTweakableSettings = function checkTweakableSettings() {

    var retVal = false;

    GrpL.logEntry(arguments);

    do {
        
        try {

            if (! GrpL.S) {
                GrpL.logError(arguments, "GrpL.S should exist");
                break;
            }

            retVal = true;  
            for (var settingName in GrpL.S) {
                if (GrpL.S[settingName] == GrpL.VALUE_NOT_INITIALIZED) {
                    GrpL.logError(arguments, "GrpL.S." + settingName + " should exist");
                    retVal = false;                    
                }
            }

            if (! retVal) {
                break;
            }
            
            GrpL.logNote(arguments, "test passed");
        }
        catch (err) {
            GrpL.logError(arguments, "throws " + err);
            retVal = false;
        }
    }
    while (false);

    GrpL.logExit(arguments);

    return retVal;
}

//------------

if (! GrpL.S) {
    GrpL.S = {}; // stash global settings here
}

if (! GrpL.VALUE_NOT_INITIALIZED) {
    GrpL.VALUE_NOT_INITIALIZED = { VALUE_NOT_INITIALIZED: true };
}

declareAPI();

})();

