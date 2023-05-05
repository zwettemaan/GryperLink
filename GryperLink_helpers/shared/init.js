(function() {

if (GrpL.checkMac()) {
    GrpL.path.SEPARATOR = "/";
    GrpL.isMac = true;
    GrpL.isWindows = false;
}
else {
    GrpL.path.SEPARATOR = "\\";
    GrpL.isMac = false;
    GrpL.isWindows = true;
}
GrpL.path.GUESS_SEPARATOR = "?";

GrpL.sharedInitScript = function sharedInitScript() {

    do {
        try {

            GrpL.C.APP_NAME = GrpL.mapAppId(GrpL.C.APP_ID);

            if (! GrpL.dirs.HOME) {
                GrpL.criticalError("sharedInitScript needs dirs.HOME");
                break;
            }

            if (! GrpL.dirs.TEMP) {
                GrpL.criticalError("sharedInitScript needs dirs.TEMP");
                break;
            }

            // Do a quick check if the home directory is plausible

            if (GrpL.isMac) {
                if (! GrpL.path.exists(GrpL.dirs.HOME + "Library")) {
                    GrpL.criticalError("Could not find ~/Library");
                    break;
                }
            }
            else {
                if (! GrpL.path.exists(GrpL.dirs.HOME + "Application Data")) {
                    GrpL.criticalError("Could not find ~/Application Data");
                    break;
                }
            }

            if (! GrpL.dirs.DESKTOP) {
                GrpL.dirs.DESKTOP = 
                    GrpL.dirs.HOME + 
                    "Desktop" + 
                    GrpL.path.SEPARATOR;
            }


            if (! GrpL.dirs.DOCUMENTS) {
                GrpL.dirs.DOCUMENTS = 
                    GrpL.dirs.HOME + 
                    "Documents" + 
                    GrpL.path.SEPARATOR;
            }

            if (! GrpL.dirs.ADOBE_SCRIPTS) {
                GrpL.dirs.ADOBE_SCRIPTS = 
                    GrpL.dirs.DOCUMENTS + 
                    "Adobe Scripts" + 
                    GrpL.path.SEPARATOR;
            }

            if (! GrpL.dirs.APP_SCRIPTS) {
                GrpL.dirs.APP_SCRIPTS = 
                    GrpL.dirs.ADOBE_SCRIPTS + 
                    GrpL.C.APP_NAME + 
                    GrpL.path.SEPARATOR;
            }
        }
        catch (err) {
            GrpL.logError(arguments, "throws " + err);
        }
    }
    while (false);


}

})();
