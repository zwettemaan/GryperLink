//
// This is the compat API. It is available in ExtendScript, CEP/JavaScript and UXPScript 
//

(function(){


function declareAPI() {

    GrpL.clearImmediate         = GrpL.IMPLEMENTATION_MISSING;
    GrpL.clearInterval          = GrpL.IMPLEMENTATION_MISSING;
    GrpL.clearTimeout           = GrpL.IMPLEMENTATION_MISSING;
    GrpL.setImmediate           = GrpL.IMPLEMENTATION_MISSING;
    GrpL.setInterval            = GrpL.IMPLEMENTATION_MISSING;
    GrpL.setTimeout             = GrpL.IMPLEMENTATION_MISSING;

}

//----------- Tests


//-------------------

declareAPI();

})();