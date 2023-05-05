//
// This code is exclusively ExtendScript. It provides ExtendScript-specific 
// implementations of the pathutils API.
//
// utils.js depends on these functions being implemented
// When adding new functionality here, make sure to also 
// add corresponding tests to the utils_verifyDependencies()
//

(function() {

if (! GrpL.path) {
    GrpL.path = {};
}

GrpL.path.exists = function exists(filePath) {
    
    GrpL.logEntry(arguments);

    var f = File(filePath);
    var retVal = f.exists;

    GrpL.logExit(arguments);

    return retVal;
}

GrpL.path.isDir = function isDir(folderPath) {
    
    GrpL.logEntry(arguments);

    // This casts to a File instead of a Folder if the
    // path references a file

    var folder = Folder(folderPath);

    var retVal = (folder instanceof Folder);

    GrpL.logExit(arguments);

    return retVal;
}

GrpL.path.mkdir = function mkdir(folderPath, separator) {

    var success = false;

    GrpL.logEntry(arguments);
    
    do {
        try {
            if (! folderPath) {
                GrpL.logError(arguments, "no folderPath");
                break;
            }

            if (GrpL.path.exists(folderPath)) {
                success = true;
                break;
            }

            var parentFolderPath = GrpL.path.dirname(folderPath, separator);
            success = GrpL.path.mkdir(parentFolderPath, separator);
            if (! success) {
                GrpL.logError(arguments, "cannot create parent folder");
                break;
            }

            var folder = Folder(folderPath);
            folder.create();
            success = folder.exists;
        }
        catch (err) {
            GrpL.logError(arguments, "throws" + err);       
        }
    }
    while (false);

    GrpL.logExit(arguments);
    
    return success;
}

})();