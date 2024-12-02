
if (! module.exports) {
    module.exports = {};
}
let crdtuxpIDSN = module.exports;

/**
 * Convert an InDesign collection into a pure JavaScript array
 *
 * @function collectionToArray
 *
 * @param {Collection} coll - an InDesign collection
 * @returns array with the collection elements
 */

function collectionToArray(coll) {
// coderstate: function
    let retVal = undefined;

    do {

        try {

            if (! coll) {
                break; 
            }

            if (coll instanceof Array) {
                retVal = coll.slice(0);
            }
            else {
                retVal = coll.everyItem().getElements().slice(0); 
            }

        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    return retVal;
}

module.exports.collectionToArray = collectionToArray;
