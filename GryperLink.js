//
// Gryperlink.jsx - a script for Adobe InDesign
//
// v 1.0.8, May 5, 2021
//
// by Kris Coppieters 
// kris@rorohiko.com
// https://www.linkedin.com/in/kristiaan/
//
// ----------------
// Do not run this code directly. 
// Instead, this code can be launched either in ExtendScript or in UXPScript,
// by double-clicking either the run_as_ExtendScript.jsx or the run_as_UXPScript.idjs 
// scripts from the InDesign Scripts Panel
// ------
//
// About Rorohiko:
//
// Rorohiko specialises in making printing, publishing and web workflows more efficient.
//
// This script is a free sample of the custom solutions we create for our customers.
//
// If your workflow is hampered by boring or repetitive tasks, inquire at
//
//   sales@rorohiko.com
//
// The scripts we write for our customers repay for themselves within weeks or 
// months.
//
// ---------------
//
// About this script:
//
// This script will search the current document for one or more 
// GREP patterns, and each time a match is found, it will assign a
// specific hyperlink to the matching text. 
//
// For licensing and copyright information: see end of the script
//
// For installation info and documentation: visit 
//
// https://www.rorohiko.com/wordpress/use-indesign-find-and-replace-to-assign-hyperlinks-to-text
//
// The sample below will search for a pattern of six digits, a dash, 2 digits. Each time
// the pattern is found, a hyperlink of the form https://coppieters.nz/?p=123456-12 will 
// be assigned to it.
//
// The searchPattern should use the 'g' flag (i.e. the pattern ends with the letter
// g, which means 'Global'): '/.../g').
// 
// That way, the GREP expression will search for all matches, instead of just one match.
//
// In addition to matching the text against a GREP pattern you can optionally also
// match any or all of the names of the paragraph style, character style 
// or font. If you don't want such matching, keep the corresponding 
// search patterns set to 'undefined'.
//
// These additional patterns do not need the 'g' flag
//
// Also note that you can always append an 'i' flag to any GREP expressions
// to make them case-insensitive
//
// This additional matching is helpful if matching against the text leads
// to too many 'false positives' and the text match alone is not specific
// enough to designate the hyperlink locations.
//
// To use this script, you must configure it - the pattern and link below are merely
// samples. Carefully make sensible adjustments between the two lines
// 'CONFIFURATION' - 'END OF CONFIGURATION' below
//

var gPatternList = [
// CONFIGURATION 
{

    // Make sure to add the 'g' flag after the GREP expression
    // Add an 'i' flag to make the search case-insensitive
    
    searchPattern: /(\d{6}-\d{2})/g,
    link: "https://coppieters.nz/?p=$1",
    charStyleName: "linkstyle",
    
    // Additional match options below. Either delete them or 
    // leave these set to 
    //
    //   undefined 
    //
    // if you don't need them.
    //
    // Add an 'i' flag to a GREP expression to make the matches 
    // case-insensitive
    // There is no need for a 'g' flag here
    
    paraStyleNameSearchPattern: undefined,
    charStyleNameSearchPattern: undefined,
    fontNameSearchPattern: undefined
}

// You can add additional patterns to the list here...
// END CONFIGURATION
];

GrpL.main = main;

function getTextParentId(in_text) {

    var textElement = in_text.characters.item(0).parent;

    if (GrpL.instanceof(textElement, "Array")) {
        textElement = textElement[0];
    }

    if (GrpL.instanceof(textElement, "Cell")) {
        textParentId = textElement.parent.id + "*" + textElement.index;
    }
    else if (GrpL.instanceof(textElement, "Story")) {
        textParentId = textElement.id;
    }
    else {
        textParentId = in_text.parentStory.id;
    }

    return "H" + textParentId;
}

function getTextId(in_text) {

    var textFromIdx = in_text.characters.firstItem().index;
    var textToIdx = in_text.characters.lastItem().index;

    var textId = "K|" + textFromIdx + "|" + textToIdx;

    return textId;
}

function getSourceParentId(in_source) {

    var sourceText = in_source.sourceText;

    var sourceParentId = getTextParentId(sourceText);

    return sourceParentId;
}

function adjustHyperlinksCache(io_hyperlinksCacheBySourceId, in_parentId, in_startIdx, in_endIdx, in_oldEndIdx) {

    do {
        var parentCache = io_hyperlinksCacheBySourceId[in_parentId];
        if (! parentCache) {
            break;
        }

        var shift = in_endIdx - in_oldEndIdx;
        if (shift == 0) {
            break;
        }

        var newParentCache = {};
        for (var textId in parentCache) {

            var keys = textId.split("|");
            var fromIdx = parseInt(keys[1], 10);
            if (fromIdx >= in_oldEndIdx) {
                fromIdx += shift;
            }

            var toIdx = parseInt(keys[2], 10);
            if (toIdx >= in_oldEndIdx) {
                toIdx += shift;
            }

            var newTextId = "K|" + fromIdx + "|" + toIdx;
            newParentCache[newTextId] = parentCache[textId];
        }

        io_hyperlinksCacheBySourceId[in_parentId] = newParentCache;
    }
    while (false);

}

function addToHyperlinksCache(io_hyperlinksCacheBySourceId, in_hyperLink) {

    var source = in_hyperLink.source;
    if (GrpL.instanceof(source, "HyperlinkTextSource")) {
        var destination = in_hyperLink.destination;
        if (GrpL.instanceof(destination, "HyperlinkURLDestination")) {
            var parentId = getSourceParentId(source);
            var parentCache = io_hyperlinksCacheBySourceId[parentId];
            if (! parentCache) {
                parentCache = {};
                io_hyperlinksCacheBySourceId[parentId] = parentCache;
            }

            var textId = getTextId(source.sourceText);
            
            parentCache[textId] = in_hyperLink;
        }
    }
}

function linkatStory(context, storyOrCell) {

    do {
        try {
            if (
                ! (
                    GrpL.instanceof(storyOrCell, "Story") 
                ||
                    GrpL.instanceof(storyOrCell, "Cell")
                )
            ) {
                break;
            }

            var document = context.document;

            var hyperlinksCacheBySourceId = context.hyperlinksCacheBySourceId;
            if (! hyperlinksCacheBySourceId) {

                hyperlinksCacheBySourceId = {};
                context.hyperlinksCacheBySourceId = hyperlinksCacheBySourceId;
                var hyperlinks = document.hyperlinks.everyItem().getElements().slice(0);
                for (var idx = 0; idx < hyperlinks.length; idx++) {
                    try {
                        var hyperlink = hyperlinks[idx];
                        addToHyperlinksCache(context.hyperlinksCacheBySourceId, hyperlink);
                    }
                    catch (err) {          
                    }
                }
            }

            for (var patternIdx = 0; patternIdx < gPatternList.length; patternIdx++) {

                var pattern = gPatternList[patternIdx];

                var searchPattern = pattern.searchPattern;
                var link = pattern.link;
                var text = pattern.text;
                var charStyle = findCharStyle(context, pattern.charStyleName);

                var matchFound = false;

                var storyOrCellContents = storyOrCell.contents;
                var matchList = [];
                var match;
                var contents = storyOrCell.contents;
                searchPattern.lastIndex = 0;
                while (match = searchPattern.exec(contents)) {
                    var matchIdx = match.index;
                    var matchedString = match[0];
                    matchList.push({
                        matchIdx: matchIdx,
                        matchedString: matchedString
                    });
                }
                for (var matchIdx = 0; matchIdx < matchList.length; matchIdx++) {
                    var match = matchList[matchIdx];
                    var matchedLink = match.matchedString.replace(searchPattern, link);
                    match.matchedLink = matchedLink;
                }
                if (text) {
                    for (var matchIdx = 0; matchIdx < matchList.length; matchIdx++) {
                        var match = matchList[matchIdx];
                        var matchedText = match.matchedString.replace(searchPattern, text);
                        match.matchedText = matchedText;
                    }
                }

                for (var idx = matchList.length - 1; idx >= 0; idx--) {
                    try {
                        var match = matchList[idx];
                        var startIdx = match.matchIdx;
                        var endIdx = startIdx + match.matchedString.length - 1;
                        var firstChar = storyOrCell.characters.item(startIdx);
                      
                        var replace = true;                      

                        if (replace && pattern.paraStyleNameSearchPattern) {
                            try {
                                replace = false;
                                var paraStyleName = firstChar.appliedParagraphStyle.name;
                                if (pattern.paraStyleNameSearchPattern.exec(paraStyleName)) {
                                    replace = true;
                                }
                            }
                            catch (err) {
                            }
                        }

                        if (replace && pattern.charStyleNameSearchPattern) {
                            try {
                                replace = false;
                                var charStyleName = firstChar.appliedCharacterStyle.name;
                                if (pattern.charStyleNameSearchPattern.exec(charStyleName)) {
                                    replace = true;
                                }
                            }
                            catch (err) {
                            }
                        }

                        if (replace && pattern.fontNameSearchPattern) {
                            try {
                                replace = false;
                                var font = firstChar.appliedFont;
                                if (GrpL.instanceof(font, "Font")) {
                                    font = font.name;
                                }
                                if (pattern.fontNameSearchPattern.exec(font)) {
                                    replace = true;
                                }
                            }
                            catch (err) {
                            }
                        }
                      
                        if (replace) {
                            try {
                                var characters = storyOrCell.characters.itemByRange(startIdx, endIdx);
                                var hyperlink = undefined;
                                var parentId = getTextParentId(characters);
                                var parentCache = hyperlinksCacheBySourceId[parentId];
                                if (parentCache) {
                                    var textId = getTextId(characters);
                                    hyperlink = parentCache[textId];
                                }

                                var matchingHyperlink = undefined;
                                if (hyperlink) {
                                    var destinationURL = hyperlink.destination.destinationURL;
                                    if (destinationURL == match.matchedLink) {
                                        matchingHyperlink = hyperlink;
                                    }
                                    else {
                                        hyperlink.remove();
                                        delete parentCache[textId];
                                        var parentCacheEmpty = true;
                                        for (var child in parentCache) {
                                            parentCacheEmpty = false;
                                            break;
                                        }
                                        if (parentCacheEmpty) {
                                            hyperlinksCacheBySourceId[parentId] = undefined;
                                        }
                                    }
                                }
                            
                                if (! matchingHyperlink) {
                                    var source = addHyperlinkTextSource(context, characters, match.matchedString);
                                    var hyperLinkDestination = addHyperlinkDestination(context, match.matchedLink, match.matchedString);
                                    try {
                                        matchingHyperlink = document.hyperlinks.add(source, hyperLinkDestination);
                                        addToHyperlinksCache(hyperlinksCacheBySourceId, matchingHyperlink);
                                        assignUniqueName(matchingHyperlink, document.hyperlinks, match.matchedString);
                                    }
                                    catch (err) {
                                    }
                                }

                                if (matchedText) {
                                    var existingText = storyOrCell.contents.substr(startIdx, endIdx - startIdx + 1);
                                    if (existingText != match.matchedText) {                                    

                                        var parentId = getTextParentId(characters);

                                        storyOrCell.characters.itemByRange(startIdx + 1, endIdx).remove();
                                        storyOrCell.characters.item(startIdx).contents = match.matchedText;
                                        var oldEndIdx = endIdx;
                                        endIdx = startIdx + match.matchedText.length - 1;
                                        characters = storyOrCell.characters.itemByRange(startIdx, endIdx);

                                        adjustHyperlinksCache(hyperlinksCacheBySourceId, parentId, startIdx, endIdx, oldEndIdx);                                      
                                    }
                                }
                            
                                if (charStyle) {
                                    characters.appliedCharacterStyle = charStyle;
                                }
                            }
                            catch (err) {
                            }
                        }
                    }
                    catch (err) {
                    }
                 }
            }
        }
        catch (err) {
        }
    }
    while (false);
}

function assignUniqueName(element, collection, baseName) {
    var uniqueName = baseName;
    var instanceNumber = 1;
    do {
        var existingElement = collection.itemByName(uniqueName);
        if (! existingElement.isValid) {
            existingElement = undefined;
        }
        else {
            instanceNumber++;
            uniqueName = baseName + " # " + instanceNumber;
        }
    }
    while (existingElement);
    element.name = uniqueName;
}

function addHyperlinkTextSource(context, text, linkName) {

    var retVal = undefined;
    do {

        try {

            var document = context.document;

            var parentId = getTextParentId(text);

            var hyperlinkTextSourceCacheByParentId = context.hyperlinkTextSourceCacheByParentId;
            if (! hyperlinkTextSourceCacheByParentId) {
                hyperlinkTextSourceCacheByParentId = {};
                context.hyperlinkTextSourceCacheByParentId = hyperlinkTextSourceCacheByParentId;
                var hyperlinkTextSources = document.hyperlinkTextSources.everyItem().getElements().slice(0);
                for (var idx = 0; idx < hyperlinkTextSources.length; idx++) {
                    try {
                        var source = hyperlinkTextSources[idx];
                        addSourceToCache(hyperlinkTextSourceCacheByParentId, source);
                    }
                    catch (err) {            
                    }
                }
            }

            var fromIdx = text.characters.item(0).index[0];
            var toIdx = text.characters.item(text.characters.length - 1).index[0];
            var sourcesInsideParent = hyperlinkTextSourceCacheByParentId[parentId];
            var newSourcesInsideParent = undefined;
            if (sourcesInsideParent) {
                var toRemove = [];
                for (var idx = 0; idx < sourcesInsideParent.length; idx++) {
                    try {
                        var source = sourcesInsideParent[idx];
                        var sourceText = source.sourceText;
                        var sourceFromIdx = sourceText.characters.firstItem().index;
                        var sourceToIdx = sourceText.characters.lastItem().index;
                        if (sourceToIdx >= fromIdx && toIdx >= sourceFromIdx) {
                            toRemove.push(source);
                        }
                        else {
                            if (! newSourcesInsideParent) {
                                newSourcesInsideParent = [];
                            }
                            newSourcesInsideParent.push(source);
                        }
                    }
                    catch (err) {            
                    }
                }

                for (var idx = 0; idx < toRemove.length; idx++) {
                    toRemove[idx].remove();
                }

                if (! newSourcesInsideParent && sourcesInsideParent) {
                    delete hyperlinkTextSourceCacheByParentId[parentId];
                }
                else {
                    hyperlinkTextSourceCacheByParentId[parentId] = newSourcesInsideParent;
                }
            }

            retVal = document.hyperlinkTextSources.add(text);
            addSourceToCache(hyperlinkTextSourceCacheByParentId, retVal);            
            assignUniqueName(retVal, document.hyperlinkTextSources, linkName);
        }
        catch (err) {            
        }
    }
    while (false);

    function addSourceToCache(io_hyperlinkTextSourceCacheByParentId, in_source) {

        var sourceParentId = getSourceParentId(in_source);

        var sourceList = io_hyperlinkTextSourceCacheByParentId[sourceParentId];
        if (! sourceList) {
            sourceList = [];
            io_hyperlinkTextSourceCacheByParentId[sourceParentId] = sourceList;
        }
        sourceList.push(in_source);

    }

    return retVal;
}

function addHyperlinkDestination(context, url, linkName) {

    var retVal = undefined;
    
    do {
        try {
            var document = context.document;

            var hyperlinkURLDestinationCacheByURL = context.hyperlinkTextDestinationCacheByURL;
            if (! hyperlinkURLDestinationCacheByURL) {
                hyperlinkURLDestinationCacheByURL = {};
                context.hyperlinkURLDestinationCacheByURL = hyperlinkURLDestinationCacheByURL;
                var hyperlinkURLDestinations = document.hyperlinkURLDestinations.everyItem().getElements().slice(0);
                for (var idx = 0; idx < hyperlinkURLDestinations.length; idx++) {
                    try {
                        var destination = hyperlinkURLDestinations[idx];
                        addDestinationToCache(hyperlinkURLDestinationCacheByURL, destination);
                    }
                    catch (err) {            
                    }
                }
            }

            var destination = hyperlinkURLDestinationCacheByURL[url];
            if (destination) {
                retVal = destination[0];
                break;
            }

            retVal = document.hyperlinkURLDestinations.add(url);
            addDestinationToCache(hyperlinkURLDestinationCacheByURL, retVal);
            assignUniqueName(retVal, document.hyperlinkURLDestinations, linkName);
        }
        catch (err) {            
        }
    }
    while (false);

    return retVal;

    function addDestinationToCache(io_hyperlinkURLDestinationCacheByURL, in_destination) {

        var destinationURL = in_destination.destinationURL;
        var destinationList = io_hyperlinkURLDestinationCacheByURL[destinationURL];
        if (! destinationList) {
            destinationList = [];
            io_hyperlinkURLDestinationCacheByURL[destinationURL] = destinationList;
        }
        destinationList.push(in_destination);

    }

}

function findCharStyle(context, styleName) {

    var retVal = null;

    do {        
        try {

            var document = context.document;
            if (! GrpL.instanceof(document, "Document")) {
                break;
            }

            if (! styleName) {
                break;
            }            

            var styleCache = context.styleCache;
            if (styleCache && styleCache[styleName]) {
                retVal = styleCache[styleName];
                break;
            }

            var searchStyleString = styleName.replace(/\s/g,"").toLowerCase();
            var styleCount = document.characterStyles.length;
            for (var styleIdx = 0; styleIdx < styleCount; styleIdx++) {
                var charStyle = document.characterStyles.item(styleIdx);
                var charStyleName = charStyle.name;
                var compareStyleString = charStyleName.replace(/\s/g,"").toLowerCase();
                if (compareStyleString == searchStyleString) {
                    retVal = charStyle;
                    break; // for
                }
            }

            if (! styleCache) {
                styleCache = {};
                context.styleCache = styleCache;
            }

            styleCache[styleName] = retVal;
        }
        catch (err) {
        }
    }
    while (false);

    return retVal;
}

function linkat(document) {
    
    do {
        try {

            if (! GrpL.instanceof(document, "Document")) {
                break;
            }

            var context = {
                document: document
            };

            var storyCount = document.stories.length;
            for (var storyIdx = 0; storyIdx < storyCount; storyIdx++) {
                
                var story = document.stories.item(storyIdx);
                
                linkatStory(context, story);              
                
                //
                // We need to work around a bug in InDesign: when adding a hyperlink 
                // into a cell, the link most often ends up in the wrong cell: there is an 
                // error in how InDesign handles character positions in cells.
                //
                // To work around it, we move the cell contents to a dummy text frame,
                // apply the link, then move the cell contents back.
                //

                var tableCount = story.tables.length;
                for (var tableIdx = 0; tableIdx < tableCount; tableIdx++) {
                    var table = story.tables.item(tableIdx);
                    var cellCount = table.cells.length;
                    for (var cellIdx = --cellCount; cellIdx >= 0; cellIdx--) {
                        var cell = table.cells.item(cellIdx);
                        linkatStory(context, cell);                    
                    }
                }
           }    
        }
        catch (err) {
        }
    
    }
    while (false);
}

function main() {
    try {
        if (app.documents.length && GrpL.instanceof(app.activeDocument, "Document")) {
            linkat(app.activeDocument);
        }
    }
    catch (err) {
    }

}

/*************************************************************

Gryperlink.jsx

(c) 2018-2019 Rorohiko Ltd. - Kris Coppieters - kris@rorohiko.com

File: Gryperlink.jsx

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Rorohiko Ltd., nor the names of its contributors
  may be used to endorse or promote products derived from this software without
  specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
THE POSSIBILITY OF SUCH DAMAGE.

==============================================
*/

