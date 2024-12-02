(function() {

if (! GrpL.fileio) {
    GrpL.fileio = {};
}

// No logging in these functions - they are themselves used by the logging functions

GrpL.fileio.appendUTF8TextFile = function appendUTF8TextFile(filePath, str, handleNewLine) {

    try {
        var textFile = File(filePath);
        textFile.open('a');
        textFile.encoding = 'UTF8';
        if (handleNewLine == GrpL.fileio.FILEIO_APPEND_NEWLINE) {
            textFile.writeln(str);
        }
        else {
            textFile.write(str);
        }
        textFile.close();
    }
    catch (err) {       
    }
}

GrpL.fileio.readUTF8TextFile = function readUTF8TextFile(filePath) {

	var retVal = "";

    try {
        var textFile = File(filePath);
        textFile.open('r');
        textFile.encoding = 'UTF8';
        retVal = textFile.read();
        textFile.close();
    }
    catch (err) {        
    }

    return retVal;
}

GrpL.fileio.writeUTF8TextFile = function writeUTF8TextFile(filePath, text, handleNewLine) {

    try {
        var textFile = File(filePath);
        textFile.open('w');
        textFile.encoding = 'UTF8';
        if (handleNewLine == GrpL.fileio.FILEIO_APPEND_NEWLINE) {
            textFile.writeln(str);
        }
        else {
            textFile.write(str);
        }
        textFile.close();
    }
    catch (err) {        
    }
}

})();
