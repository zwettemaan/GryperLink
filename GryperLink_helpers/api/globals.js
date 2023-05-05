(function() {

function declareAPI() {

    GrpL.C.APP_ID               = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.C.APP_NAME             = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.C.DIRNAME_PREFERENCES  = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.C.FILENAME_PREFERENCES = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.C.LOG_NONE             = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.C.LOG_ERROR            = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.C.LOG_WARN             = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.C.LOG_NOTE             = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.C.LOG_TRACE            = GrpL.VALUE_NOT_INITIALIZED;

}

//------------------- Tests

GrpL.tests.checkGlobals = function checkGlobals() {

    var retVal = false;

    GrpL.logEntry(arguments);

    do {
        
        try {

            if (! GrpL.C) {
                GrpL.logError(arguments, "GrpL.C should exist");
                break;
            }

            retVal = true;  
            for (var constantName in GrpL.C) {
                if (GrpL.C[constantName] == GrpL.VALUE_NOT_INITIALIZED) {
                    GrpL.logError(arguments, "GrpL.C." + constantName + " should exist");
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

//-------------------

if (! GrpL.C) {
    GrpL.C = {}; // stash constants here   
}

if (! GrpL.IMPLEMENTATION_MISSING) {
    GrpL.IMPLEMENTATION_MISSING = function IMPLEMENTATION_MISSING() {
        GrpL.logError("Implementation is missing");        
    };
}

if (! GrpL.VALUE_NOT_INITIALIZED) {
    GrpL.VALUE_NOT_INITIALIZED = { VALUE_NOT_INITIALIZED: true };
}

declareAPI();

})();


