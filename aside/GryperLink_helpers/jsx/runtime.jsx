(function() {

// Don't use `var GrpL`
// By using `var` we will end up defining this in the wrong scope

if ("undefined" == typeof GrpL) {
    GrpL = {};
}

GrpL.relativeFilePathsToLoad = [

    "../shared/appMapper.js",

    "../api/globals.js",
    "../shared/globals.js",
    "./globals.jsx",

    "../api/tweakableSettings.js",
    "../shared/tweakableSettings.js",

    "../api/utils.js",
    "../shared/utils.js",
    "./utils.jsx",

    "../api/pathUtils.js",
    "../shared/pathUtils.js",
    "./pathUtils.jsx",

    "../api/fileio.js",
    "../shared/fileio.js",
    "./fileio.jsx",
    
    "../api/idDOM.js",
    "./idDOM.jsx",

    "../api/compat.js",
    "./compat.jsx",

    "./promiscuous-browser.jsx",

    "../shared/init.js",
    "../../GryperLink.js"
];

if (! GrpL.tests) {
    GrpL.tests = {};
}

GrpL.initDirsScript = function initDirsScript() {

    var retVal = false;

    do {
        try {

            if (! GrpL.dirs) {
                GrpL.dirs = {};
            }

            GrpL.dirs.HOME = GrpL.path.addTrailingSeparator(Folder("~").fsName);
            GrpL.dirs.DESKTOP = GrpL.path.addTrailingSeparator(Folder.desktop.fsName);
            GrpL.dirs.TEMP = GrpL.path.addTrailingSeparator(Folder.temp.fsName);


            if (GrpL.isMac) {
                GrpL.dirs.DRIVE_PREFIX = "";
            }
            else {
                var splitHomePath = GrpL.dirs.HOME.split(GrpL.path.SEPARATOR);
                if (splitHomePath.length > 0) {
                    GrpL.dirs.DRIVE_PREFIX = splitHomePath[0] + GrpL.path.SEPARATOR;
                }
            }

        }
        catch (err) { 
            GrpL.criticalError("initScript throws " + err);
        }
    }
    while (false);
}

GrpL.criticalError = function criticalError(error) {

    if (GrpL.logError) {
        GrpL.logError(error);
    }
    
    if (GrpL.S.LOG_CRITICAL_ERRORS && GrpL.S.CRITICAL_LOG_FILE_ON_DESKTOP) {

        try {
            var logFile = File(Folder.desktop.fsName + "/" + GrpL.S.CRITICAL_LOG_FILE_ON_DESKTOP);
            logFile.open("a");
            logFile.encoding = "UTF8";
            logFile.writeln(error);   
            logFile.close();         
        }
        catch (err) {

            try {
                alert(error);
            }
            catch (err) {   
            }

        }
    }
}

})();

GrpL.loadModules = function loadModules(nameSpace, completionCallback) {

    var failedTests = 0;
    var missingImplementations = 0;

    function verifyImplementationsAvailable(apiCollection) {
        if (apiCollection) {
            for (var entryName in apiCollection) {
                var entry = apiCollection[entryName];
                if ("function" == typeof entry && entry == GrpL.IMPLEMENTATION_MISSING && entryName != "IMPLEMENTATION_MISSING") {
                    missingImplementations++;
                    GrpL.criticalError("Missing implementation " + entryName);
                }
            }
        }
    }

    function runTests(testCollection) {
        if (testCollection) {
            for (var testEntryName in testCollection) {
                var testEntry = testCollection[testEntryName];
                if ("function" == typeof testEntry) {
                    if (! testEntry()) {
                        GrpL.criticalError("Failed test " + testEntryName);
                        failedTests++;
                    }
                }
                else if ("object" == typeof testEntry) {
                    runTests(testEntry);
                }
            }
        }
    }

    var basePath = File($.fileName).parent.fsName + "/";
    for (var pathIdx = 0; pathIdx < GrpL.relativeFilePathsToLoad.length; pathIdx++) {
        var path = basePath + GrpL.relativeFilePathsToLoad[pathIdx];
        $.evalFile(path);
    }

    GrpL.initDirsScript();
    GrpL.sharedInitScript();

    for (var member in GrpL) {
        nameSpace[member] = GrpL[member];        
    }

    if (GrpL.S.RUN_TESTS) {
        verifyImplementationsAvailable(GrpL);
        runTests(GrpL.tests);
    }

    GrpL.main();

}
