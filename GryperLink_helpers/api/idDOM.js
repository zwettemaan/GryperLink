//
// This is the idDOM API. It is available in ExtendScript, CEP/JavaScript and UXPScript 
//

(function(){

function declareAPI() {

    GrpL.instanceof = GrpL.IMPLEMENTATION_MISSING;

}

//----------- Tests

GrpL.tests.instanceof = function test_instanceof() {

    var retVal = true;

    var tempDoc;

    do {
        try {

            if (! GrpL.instanceof(app, "Application")) {
                retVal = false;
            }

            var tempDoc = app.documents.add(false);
            if (! GrpL.instanceof(tempDoc, "Document")) {
                retVal = false;
            }

            var tf = tempDoc.textFrames.add();
            if (! GrpL.instanceof(tf, "TextFrame")) {
                retVal = false;
            }

            var pi = tempDoc.pageItems.firstItem();
            if (! GrpL.instanceof(pi, "PageItem")) {
                retVal = false;
            }

            // PageItem is not a JavaScript subclass, but it is an InDesign subclass 
            // of TextFrame
            if (GrpL.instanceof(pi, "TextFrame")) {
                retVal = false;
            }

            if (! GrpL.instanceof(pi.getElements()[0], "TextFrame")) {
                retVal = false;
            }
        }
        catch (err) {            
            retVal = false;
        }

    }
    while (false);

    if (tempDoc) {
        tempDoc.close(SaveOptions.NO);
    }
    
    return retVal;
}

//-------------------

declareAPI();

})();