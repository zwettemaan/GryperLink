//
// This is the utils API. It is available in ExtendScript, CEP/JavaScript and UXPScript 
//

(function(){

function declareAPI() {

    GrpL.alert        = GrpL.IMPLEMENTATION_MISSING;
    GrpL.checkMac     = GrpL.IMPLEMENTATION_MISSING;
    GrpL.checkWindows = GrpL.IMPLEMENTATION_MISSING;
    GrpL.deepClone    = GrpL.IMPLEMENTATION_MISSING;
    GrpL.dQ           = GrpL.IMPLEMENTATION_MISSING;
    GrpL.logError     = GrpL.IMPLEMENTATION_MISSING;
    GrpL.logExit      = GrpL.IMPLEMENTATION_MISSING;
    GrpL.logMessage   = GrpL.IMPLEMENTATION_MISSING;
    GrpL.logNote      = GrpL.IMPLEMENTATION_MISSING;
    GrpL.logTrace     = GrpL.IMPLEMENTATION_MISSING;
    GrpL.logWarning   = GrpL.IMPLEMENTATION_MISSING;
    GrpL.popLogLevel  = GrpL.IMPLEMENTATION_MISSING;
    GrpL.pushLogLevel = GrpL.IMPLEMENTATION_MISSING;
    GrpL.randomGUID   = GrpL.IMPLEMENTATION_MISSING;
    GrpL.shallowClone = GrpL.IMPLEMENTATION_MISSING;
    GrpL.sQ           = GrpL.IMPLEMENTATION_MISSING;
    GrpL.toHex        = GrpL.IMPLEMENTATION_MISSING;

}

//--------- Tests

var GUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

GrpL.tests.checkMacWindows = function checkMacWindows() {

    var retVal = false;

    GrpL.logEntry(arguments);

    do {
        
        try {

            if (GrpL.isMac && GrpL.isWindows) {
                GrpL.logError(arguments, "both isMac and isWindows are true");
                break;
            }

            if (! GrpL.isMac && ! GrpL.isWindows) {
                GrpL.logError(arguments, "both isMac and isWindows are false");
                break;
            }

            if (GrpL.checkMac() && GrpL.checkWindows()) {
                GrpL.logError(arguments, "both checkMac and checkWindows return true");
                break;
            }

            if (! GrpL.checkMac() && ! GrpL.checkWindows()) {
                GrpL.logError(arguments, "neither checkMac nor checkWindows return true");
                break;
            }  

            retVal = true;      
            GrpL.logNote(arguments, "test passed");
        }
        catch (err) {
            GrpL.logError(arguments, "throws " + err);
            retVal = false;
        }
    }
    while (false);

    GrpL.logExit(arguments);

    return retVal;
}

GrpL.tests.deepClone = function deepClone() {

    var retVal = false;

    GrpL.logEntry(arguments);

    do {
        try {

            if (GrpL.deepClone(null) !== null) {
                GrpL.logError(arguments, "null should clone to itself")
                break;
            }

            if (GrpL.deepClone(undefined) !== undefined) {
                GrpL.logError(arguments, "undefined should clone to itself")
                break;
            }

            if (GrpL.deepClone(false) !== false) {
                GrpL.logError(arguments, "false should clone to itself")
                break;
            }

            if (GrpL.deepClone(true) !== true) {
                GrpL.logError(arguments, "true should clone to itself")
                break;
            }

            if (GrpL.deepClone(12) !== 12) {
                GrpL.logError(arguments, "12 should clone to itself")
                break;
            }

            if (GrpL.deepClone(12.12) !== 12.12) {
                GrpL.logError(arguments, "12.12 should clone to itself")
                break;
            }
            
            if (! isNaN(GrpL.deepClone(NaN))) {
                GrpL.logError(arguments, "NaN should clone to itself")
                break;
            }

            var f = function f(x) {
                return x + 1;
            }

            if (GrpL.deepClone(f) !== f) {
                GrpL.logError(arguments, "function should clone to itself")
                retVal = false;
                break;
            }

            var obj1 = {
                a: "a", 
                b: {
                    c: 12,
                    dddd: null,
                    eee: undefined,
                    fff: "",
                    ggg: false
                },
                c: [ 1, 2, 3]
            };

            var obj2 = GrpL.deepClone(obj1);

            if (obj2 == obj1) {
                GrpL.logError(arguments, "objects should be different")
                break;
            }

            if (obj2.a !== obj1.a) {
                GrpL.logError(arguments, "string member a should be the same")
                break;
            }

            if (obj2.b === obj1.b) {
                GrpL.logError(arguments, "nested object b should be a different object")
                break;
            }

            if (obj2.b.c != obj1.b.c) {
                GrpL.logError(arguments, "numeric member b.c should be the same")
                break;
            }

            if (obj2.b.dddd !== obj1.b.dddd) {
                GrpL.logError(arguments, "numeric member b.dddd should be the same")
                break;
            }

            if (obj2.b.eee !== obj1.b.eee) {
                GrpL.logError(arguments, "numeric member b.eee should be the same")
                break;
            }

            if (obj2.b.fff !== obj1.b.fff) {
                GrpL.logError(arguments, "string member b.fff should be the same")
                break;
            }

            if (obj2.b.ggg !== obj1.b.ggg) {
                GrpL.logError(arguments, "boolean member b.ggg should be the same")
                break;
            }

            if (obj2.c == obj1.c) {
                GrpL.logError(arguments, "array member c should be different")
                break;
            }

            if (obj2.c.length != obj1.c.length) {
                GrpL.logError(arguments, "array member c should be same length")
                break;
            }

            if (obj2.c[1] != obj1.c[1]) {
                GrpL.logError(arguments, "array member c[1] should be the same")
                break;
            }

            var arr1 = [
                "a", 
                {
                    c: 12,
                    d: [ {x:1} ],
                    dddd: null,
                    eee: undefined,
                    fff: "",
                    ggg: false
                }
            ];

            var arr2 = GrpL.deepClone(arr1);

            if (arr2 == arr1) {
                GrpL.logError(arguments, "arrays should be different")
                break;
            }

            if (arr2[0] != arr1[0]) {
                GrpL.logError(arguments, "string member [0] should be the same")
                break;
            }

            if (arr2[1] === arr2[0]) {
                GrpL.logError(arguments, "nested object [1] should be a different object")
                break;
            }

            if (arr2[1].c != arr1[1].c) {
                GrpL.logError(arguments, "numeric member [1].c should be the same")
                break;
            }

            if (arr2[1].d === arr1[1].d) {
                GrpL.logError(arguments, "numeric member [1].d should be a different array")
                break;
            }

            if (arr2[1].d[0] === arr1[1].d[0]) {
                GrpL.logError(arguments, "numeric member [1].d[0] should be a different object")
                break;
            }

            if (arr2[1].dddd !== arr1[1].dddd) {
                GrpL.logError(arguments, "numeric member [1].dddd should be the same")
                break;
            }

            if (arr2[1].eee !== arr1[1].eee) {
                GrpL.logError(arguments, "numeric member [1].eee should be the same")
                break;
            }

            if (arr2[1].fff !== arr1[1].fff) {
                GrpL.logError(arguments, "string member [1].fff should be the same")
                break;
            }

            if (arr2[1].ggg !== arr1[1].ggg) {
                GrpL.logError(arguments, "boolean member [1].ggg should be the same")
                break;
            }

            retVal = true;      
            GrpL.logNote(arguments, "test passed");

        }
        catch (err) {
            GrpL.logError(arguments, "throws " + err);
            retVal = false;
        }
    } 
    while (false);

    GrpL.logExit(arguments);

    return retVal;
}

GrpL.tests.randomGUID = function randomGUID() {

    var retVal = false;

    GrpL.logEntry(arguments);

    do {
        
        try {

            var guid1 = GrpL.randomGUID();
            var guid2 = GrpL.randomGUID();
            if (guid1 == guid2) {
                GrpL.logError(arguments, "guids should be different");
                break;                
            }

            if (! guid1.match(GUID_REGEX)) {
                GrpL.logError(arguments, "guid1 wrong format");
                break;                
            }

            if (! guid2.match(GUID_REGEX)) {
                GrpL.logError(arguments, "guid2 wrong format");
                break;                
            }

            retVal = true;      
            GrpL.logNote(arguments, "test passed");
        }
        catch (err) {
            GrpL.logError(arguments, "throws " + err);
            retVal = false;
        }
    }
    while (false);

    GrpL.logExit(arguments);

    return retVal;
}

GrpL.tests.toHex = function toHex() {

    var retVal = false;

    GrpL.logEntry(arguments);

    do {
        
        try {

            var tests = [
                {
                    value: 0,
                    digits: 0,
                    expected: ""
                },
                {
                    value: 0,
                    digits: 1,
                    expected: "0"
                },
                {
                    value: 0,
                    digits: 2,
                    expected: "00"
                },
                {
                    value: 0,
                    digits: 3,
                    expected: "000"
                },
                {
                    value: 0,
                    digits: 4,
                    expected: "0000"
                },
                {
                    value: 0,
                    digits: 16,
                    expected: "0000000000000000"
                },
                {
                    value: 12345678,
                    digits: 0,
                    expected: ""
                },
                {
                    value: 12345678,
                    digits: 1,
                    expected: "E"
                },
                {
                    value: 12345678,
                    digits: 2,
                    expected: "4E"
                },
                {
                    value: 12345678,
                    digits: 3,
                    expected: "14E"
                },
                {
                    value: 12345678,
                    digits: 4,
                    expected: "614E"
                },
                {
                    value: 12345678,
                    digits: 16,
                    expected: "0000000000BC614E"
                },
                {
                    value: -12345678,
                    digits: 16,
                    expected: undefined
                },
                {
                    value: 0.1,
                    digits: 4,
                    expected: undefined
                },
                {
                    value: NaN,
                    digits: 4,
                    expected: undefined
                },
                {
                    value: "123",
                    digits: 4,
                    expected: undefined
                },
                {
                    value: undefined,
                    digits: 4,
                    expected: undefined
                },
                {
                    value: null,
                    digits: 4,
                    expected: undefined
                },
                {
                    value: {a:1},
                    digits: 4,
                    expected: undefined
                }
            ];


            retVal = true;      
            for (var idx = 0; idx < tests.length; idx++) {
                var test = tests[idx];
                try {
                    GrpL.pushLogLevel(GrpL.C.LOG_NONE);
                    var calculated = GrpL.toHex(test.value, test.digits);
                    GrpL.popLogLevel();
                    if (calculated !== test.expected) {
                        GrpL.logError(arguments, "test #" + idx + " fails");
                        retVal = false;
                        break;
                    }
                }
                catch (err) {
                    GrpL.logError(arguments, "tests throw " + err);
                    retVal = false;
                }
            }


            GrpL.logNote(arguments, "test passed");
        }
        catch (err) {
            GrpL.logError(arguments, "throws " + err);
            retVal = false;
        }
    }
    while (false);

    GrpL.logExit(arguments);

    return retVal;
}

//------------

declareAPI();

})();