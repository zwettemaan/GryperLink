(function() {

if (! GrpL.path) {
	GrpL.path = {};
}

if (! GrpL.tests.path) {
    GrpL.tests.path = {};
}

GrpL.path.REGEXP_KEEP_SLASH = /[^\/]*/g;
GrpL.path.REGEXP_KEEP_BACKSLASH = /[^\\]*/g;

GrpL.path.addTrailingSeparator = function addTrailingSeparator(filePath, separator) {

    var retVal = filePath;
    
    GrpL.logEntry(arguments);

    do {

        if (! filePath) {
            break;            
        }

        if (! separator) {
            separator = GrpL.path.SEPARATOR;
        }

        if (separator == GrpL.path.GUESS_SEPARATOR) {
            separator = GrpL.path.guessSeparator(filePath);
        }

        var lastChar = filePath.substr(-1);        
        if (lastChar == separator) {
            break;
        }

        retVal += separator;
    }
    while (false);

    GrpL.logExit(arguments);

    return retVal;
};

GrpL.path.basename = function basename(filePath, separator) {
    
    var endSegment;

    GrpL.logEntry(arguments);

    if (! separator) {
        separator = GrpL.path.SEPARATOR;
    }

    if (separator == GrpL.path.GUESS_SEPARATOR) {
        separator = GrpL.path.guessSeparator(filePath);
    }

    // toString() handles cases where filePath is an ExtendScript File/Folder object
    var splitPath = filePath.toString().split(separator);
    do {
        endSegment = splitPath.pop();   
    }
    while (splitPath.length > 0 && endSegment == "");

    GrpL.logExit(arguments);

    return endSegment;
}

GrpL.path.dirname = function dirname(filePath, separator) {
    
    var retVal;

    GrpL.logEntry(arguments);

    if (! separator) {
        separator = GrpL.path.SEPARATOR;
    }

    if (separator == GrpL.path.GUESS_SEPARATOR) {
        separator = GrpL.path.guessSeparator(filePath);
    }

    // toString() handles cases where filePath is an ExtendScript File/Folder object
    var splitPath = filePath.toString().split(separator);
    do {
        var endSegment = splitPath.pop();   
    }
    while (splitPath.length > 0 && endSegment == "");

    retVal = splitPath.join(separator);

    GrpL.logExit(arguments);

    return retVal;
}

GrpL.path.filenameExtension = function filenameExtension(filePath) {
    
    var retVal;

    GrpL.logEntry(arguments);

    var splitName = GrpL.path.basename(filePath).split(".");
    var extension = "";
    if (splitName.length > 1) {
        extension = splitName.pop();
    }

    retVal = extension.toLowerCase();

    GrpL.logExit(arguments);

    return retVal;
}

GrpL.path.guessSeparator = function addTrailingSeparator(filePath, likelySeparator) {

    var retVal = GrpL.path.SEPARATOR;
    
    GrpL.logEntry(arguments);

    do {

        if (! filePath) {
            break;            
        }

        if (! likelySeparator) {
            likelySeparator = GrpL.path.SEPARATOR;
        }

        var lastChar = filePath.substr(-1);        
        if (lastChar == GrpL.path.SEPARATOR || lastChar == GrpL.path.OTHER_PLATFORM_SEPARATOR) {
            retVal = lastChar;
            break;
        }

        var slashCount = filePath.replace(GrpL.path.REGEXP_KEEP_SLASH, "").length;
        var backSlashCount = filePath.replace(GrpL.path.REGEXP_KEEP_BACKSLASH, "").length;
        if (backSlashCount < slashCount) {
            retVal = "/";
        }
        else if (backSlashCount > slashCount) {
            retVal = "\\";
        }
        else if (likelySeparator != GrpL.path.GUESS_SEPARATOR) {
            retVal = likelySeparator;
        }
        else {
            retVal = GrpL.path.SEPARATOR;
        }

    }
    while (false);

    GrpL.logExit(arguments);

    return retVal;
};

})();
