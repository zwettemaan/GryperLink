(function() {

// Don't use `var GrpL`
// By using `var` we will end up defining this in the wrong scope

if ("undefined" == typeof GrpL) {
    GrpL = {};
}

GrpL.instanceof = function _instanceof(object, domClassName) {
  
    var retVal;

    GrpL.logEntry(arguments);

    var esScript = "object instanceof " + domClassName;

    try {
        retVal = eval(esScript);
    }
    catch (err) {
        GrpL.logError(arguments, "throws " + err);
    }

    GrpL.logExit(arguments);

    return retVal;
}

})();
