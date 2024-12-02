const indesign = require("indesign");
const app = indesign.app;

const SAMPLE_FILE_NAME_NO_EXTENSION = "GryperLinkDemo";
const FILENAME_EXTENSION_IDML       = ".idml";
const FILENAME_EXTENSION_DOCUMENT   = ".indd";

const SAMPLE_DOCUMENT               = SAMPLE_FILE_NAME_NO_EXTENSION + FILENAME_EXTENSION_DOCUMENT;
const SAMPLE_IDML_TEMPLATE          = SAMPLE_FILE_NAME_NO_EXTENSION + FILENAME_EXTENSION_IDML;

async function main() {

    crdtuxp.logEntry(arguments);

    do {
        
        try {


            const installedFolder = 
                crdtuxp.path.dirName(
                    crdtuxp.path.getCurrentScriptPath(),
                    { addTrailingSeparator: true });

            const installerSampleIDMLTemplate = installedFolder + SAMPLE_IDML_TEMPLATE;
            const templateExists = await crdtuxp.fileExists(installerSampleIDMLTemplate);
            if (! templateExists) {
                crdtuxp.alert("Cannot find sample file " + installerSampleIDMLTemplate);
                break;
            }

            const desktopDir = await crdtuxp.getDir(crdtuxp.DESKTOP_DIR);
            const desktopSampleFile = desktopDir + SAMPLE_DOCUMENT;

            let desktopSampleFileExists = await crdtuxp.fileExists(desktopSampleFile);
            if (desktopSampleFileExists) {
                crdtuxp.alert("There is already a sample file " + SAMPLE_DOCUMENT + " on the desktop. Opening this document if it's not already open.");
                app.open(desktopSampleFile);
                break;
            }

            const doc = app.open(installerSampleIDMLTemplate);
            doc.save(desktopSampleFile);

            desktopSampleFileExists = await crdtuxp.fileExists(desktopSampleFile);

            if (! desktopSampleFileExists) {
                crdtuxp.alert("Copy operation unexpectedly failed. :-(");
            }
            else {
                crdtuxp.alert("Sample file " + SAMPLE_DOCUMENT + " has been copied to your desktop.");
            }
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }        
    }
    while (false);

    crdtuxp.logExit(arguments);

}
module.exports.main = main;

