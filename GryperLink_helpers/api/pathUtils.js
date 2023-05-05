//
// This is the utils API. It is available in ExtendScript, CEP/JavaScript and UXPScript 
//

(function(){


function declareAPI() {

    if (! GrpL.path) {
        GrpL.path = {};
    }

    GrpL.path.addTrailingSeparator = GrpL.IMPLEMENTATION_MISSING;
    GrpL.path.basename             = GrpL.IMPLEMENTATION_MISSING;
    GrpL.path.dirname              = GrpL.IMPLEMENTATION_MISSING;
    GrpL.path.exists               = GrpL.IMPLEMENTATION_MISSING;
    GrpL.path.filenameExtension    = GrpL.IMPLEMENTATION_MISSING;
    GrpL.path.guessSeparator       = GrpL.IMPLEMENTATION_MISSING;
    GrpL.path.isDir                = GrpL.IMPLEMENTATION_MISSING;
    GrpL.path.mkdir                = GrpL.IMPLEMENTATION_MISSING;

}

//----------- Tests

if (! GrpL.tests.path) {
    GrpL.tests.path = {};
}

GrpL.tests.path.basename = function test_basename() {

    var retVal = true;

    do {
        var expected;
        var filePath;

        if (GrpL.isMac) {
            expected = "kris";
            filePath = "/Users/kris";
        }
        else {
            expected = "kris";
            filePath = "C:\\Users\\kris";
        }
        if (expected != GrpL.path.basename(filePath)) {
            retVal = false;
        }

        if (GrpL.isMac) {
            expected = "kris";
            filePath = "/Users/kris/";
        }
        else {
            expected = "kris";
            filePath = "C:\\Users\\kris\\";
        }
        if (expected != GrpL.path.basename(filePath)) {
            retVal = false;
        }

        expected = "kris";
        filePath = "/Users/kris";
        if (expected != GrpL.path.basename(filePath, GrpL.path.GUESS_SEPARATOR)) {
            retVal = false;
        }

        expected = "kris";
        filePath = "/Users/kris/";
        if (expected != GrpL.path.basename(filePath, GrpL.path.GUESS_SEPARATOR)) {
            retVal = false;
        }

    }
    while (false);

    return retVal;
}

GrpL.tests.path.checkLowLevelPathFunctions = function checkLowLevelPathFunctions() {

    var retVal = false;

    GrpL.logEntry(arguments);

    do {
        
        try {

            if (GrpL.isWindows) {

                // Directory
                if (! GrpL.path.exists(GrpL.dirs.DRIVE_PREFIX + "/Users")) {
                    GrpL.logError(arguments, GrpL.dirs.DRIVE_PREFIX + "/Users should exist");
                    break;
                }

                // Directory with trailing separator
                if (! GrpL.path.exists(GrpL.dirs.DRIVE_PREFIX + "/Users/")) {
                    GrpL.logError(arguments, GrpL.dirs.DRIVE_PREFIX + "/Users/ should exist");
                    break;
                }

                // Directory with spaces in the name
                if (! GrpL.path.exists(GrpL.dirs.DRIVE_PREFIX + "/Program Files")) {
                    GrpL.logError(arguments, "'" + GrpL.dirs.DRIVE_PREFIX + "/Program Files' should exist");
                    break;
                }

                // Directory with spaces in the name and trailing slash
                if (! GrpL.path.exists(GrpL.dirs.DRIVE_PREFIX + "/Program Files/")) {
                    GrpL.logError(arguments, "'" + GrpL.dirs.DRIVE_PREFIX + "/Program Files/' should exist");
                    break;
                }

                // A file
                if (! GrpL.path.exists(GrpL.dirs.DRIVE_PREFIX + "/Windows/System32/Drivers/etc/hosts")) {
                    GrpL.logError(arguments, GrpL.dirs.DRIVE_PREFIX + "/Windows/System32/Drivers/etc/hosts should exist");
                    break;
                }

                // A file with a trailing slash should exist
                if (! GrpL.path.exists(GrpL.dirs.DRIVE_PREFIX + "/Windows/System32/Drivers/etc/hosts/")) {
                    GrpL.logError(arguments, GrpL.dirs.DRIVE_PREFIX + "/Windows/System32/Drivers/etc/hosts/ should exist");
                    break;
                }

                // A non-existent file
                if (GrpL.path.exists(GrpL.dirs.DRIVE_PREFIX + "/Users/file_does_not_exist_no_way.txt")) {
                    GrpL.logError(arguments, GrpL.dirs.DRIVE_PREFIX + "/Users/file_does_not_exist_no_way.txt should not exist");
                    break;
                }
            }

            if (GrpL.isMac) {

                // Directory
                if (! GrpL.path.exists("/Users")) {
                    GrpL.logError(arguments, "/Users should exist");
                    break;
                }

                // Directory with trailing separator
                if (! GrpL.path.exists("/Users/")) {
                    GrpL.logError(arguments, "/Users/ should exist");
                    break;
                }

                // Directory with spaces in the name
                if (! GrpL.path.exists("/Library/Application Support")) {
                    GrpL.logError(arguments, "/Library/Application Support should exist");
                    break;
                }

                // Directory with spaces in the name and trailing slash
                if (! GrpL.path.exists("/Library//Application Support/")) {
                    GrpL.logError(arguments, "/Library/Application Support/ should exist");
                    break;
                }

                // A file
                if (! GrpL.path.exists("/etc/hosts")) {
                    GrpL.logError(arguments, "/etc/hosts should exist");
                    break;
                }

                // A file with a trailing slash should exist
                if (! GrpL.path.exists("/etc/hosts/")) {
                    GrpL.logError(arguments, "/etc/hosts/ should exist");
                    break;
                }

                // A non-existent file
                if (GrpL.path.exists("/etc/file_does_not_exist_no_way.txt")) {
                    GrpL.logError(arguments, "/etc/file_does_not_exist_no_way.txt should not exist");
                    break;
                }
            }

            retVal = true;      
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

declareAPI();

})();