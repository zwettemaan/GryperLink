//
// This is the fileio API. It is available in ExtendScript, CEP/JavaScript and UXPScript 
//

(function(){


function declareAPI() {

    if (! GrpL.fileio) {
        GrpL.fileio = {};
    }
    
    GrpL.fileio.FILEIO_APPEND_NEWLINE      = GrpL.VALUE_NOT_INITIALIZED;
    GrpL.fileio.FILEIO_DONT_APPEND_NEWLINE = GrpL.VALUE_NOT_INITIALIZED;

    GrpL.fileio.appendUTF8TextFile         = GrpL.IMPLEMENTATION_MISSING;
    GrpL.fileio.readUTF8TextFile           = GrpL.IMPLEMENTATION_MISSING;
    GrpL.fileio.writeUTF8TextFile          = GrpL.IMPLEMENTATION_MISSING;

}

//----------- Tests

if (! GrpL.tests.fileio) {
    GrpL.tests.fileio = {};
}

//-------------------

declareAPI();

})();