//
// Gryperlink.jsx - a script for Adobe InDesign
//
// v 1.0.9, Jun 24, 2023
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
// https://rorohiko.com/wordpress/use-indesign-find-and-replace-to-assign-hyperlinks-to-text
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
    
    searchPattern: /\b(\d{1,3})\s/g,
    link: "https://www.selman.com/cgi-bin/start.cgi/auction2003/index.html?lot=$1",
    charStyleName: "HL",
    
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
    charStyleNameSearchPattern: /^(Number|HL)$/i,
    fontNameSearchPattern: undefined
},
{
    imageLinkSearchPattern: /^0*(\d{1,3}).tif$/,
    link: "https://www.selman.com/cgi-bin/start.cgi/auction2003/index.html?lot=$1",    
}

// You can add additional patterns to the list here...
// END CONFIGURATION
];

function linkatImageLink(document, imageLink) {

    do {
        try {
            if ( ! ((imageLink instanceof Link))
            ) {
                break;
            }

            var parentImage = imageLink.parent;
            if (! (parentImage instanceof Image)) {
                break
            }

            var imageFileName = imageLink.name;
            for (var patternIdx = 0; patternIdx < gPatternList.length; patternIdx++) {

                var pattern = gPatternList[patternIdx];

                var imageLinkSearchPattern = pattern.imageLinkSearchPattern;
                if (imageLinkSearchPattern) {

                    var link = pattern.link;

                    if (match = imageLinkSearchPattern.exec(imageFileName)) {

                        var matchedString = match[0];
                        var matchedLink = matchedString.replace(imageLinkSearchPattern, link);
                        var hyperLinkDestination = addHyperlinkDestination(document, matchedLink);                        
                        var source = addHyperlinkImageSource(document, parentImage);

                        var hyperLinks = app.activeDocument.hyperlinks;                        
                        var hyperlinkIdx = hyperLinks.length - 1;
                        while (hyperlinkIdx >= 0) {
                            var hyperLink = hyperLinks[hyperlinkIdx];
                            if (hyperLink.source == source) {
                                hyperLink.remove();
                                break;
                            }
                            hyperlinkIdx--;
                        }

                        try {
                            var link = app.activeDocument.hyperlinks.add(source, hyperLinkDestination);
                        }
                        catch (err) {                            
                        }
                    }                    
                }
            }

        }
        catch (err) {
        }
    }
    while (false);

}

function linkatStory(document, storyOrCell) {

    do {
        try {
            if (
                ! (
                    (storyOrCell instanceof Story) 
                ||
                    (storyOrCell instanceof Cell)
                )
            ) {
                break;
            }

            for (var patternIdx = 0; patternIdx < gPatternList.length; patternIdx++) {

                var pattern = gPatternList[patternIdx];

                var searchPattern = pattern.searchPattern;
                if (searchPattern) {
                    var link = pattern.link;
                    var text = pattern.text;
                    var charStyle = findCharStyle(document, pattern.charStyleName);

                    var matchList = [];
                    var match;
                    var contents = storyOrCell.contents;
                    searchPattern.lastIndex = 0;

                    while (match = searchPattern.exec(contents)) {
                        var matchIdx = match.index;
                        var matchedString = match[0];
                        var matchedLink = matchedString.replace(searchPattern, link);
                        if (text) {
                            var matchedText = matchedString.replace(searchPattern, text);
                        }
                        else {
                            matchedText = "";
                        }
                        matchList.push({
                            matchIdx: matchIdx,
                            matchedString: matchedString,
                            matchedLink: matchedLink,
                            matchedText: matchedText
                        });
                    }

                    for (var matchListIdx = matchList.length - 1; matchListIdx >= 0; matchListIdx--) {
                        try {
                            var match = matchList[matchListIdx];
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
                                    if (font instanceof Font) {
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
                                if (matchedText) {
                                    storyOrCell.characters.itemByRange(startIdx + 1, endIdx).remove();
                                    storyOrCell.characters.item(startIdx).contents = match.matchedText;
                                    endIdx = startIdx + match.matchedText.length - 1;
                                }
                                try {
                                    var hyperLinkDestination = addHyperlinkDestination(document, match.matchedLink);
                                    var characters = storyOrCell.characters.itemByRange(startIdx, endIdx);
                                    var source = addHyperlinkTextSource(document, characters);

                                    var hyperLinks = app.activeDocument.hyperlinks;                        
                                    var hyperlinkIdx = hyperLinks.length - 1;
                                    while (hyperlinkIdx >= 0) {
                                        var hyperLink = hyperLinks[hyperlinkIdx];
                                        if (hyperLink.source == source) {
                                            hyperLink.remove();
                                            break;
                                        }
                                        hyperlinkIdx--;
                                    }
            debugger;
                                    try {
                                        var link = app.activeDocument.hyperlinks.add(source, hyperLinkDestination);
                                    }
                                    catch (err) {                            
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
        }
        catch (err) {
        }
    }
    while (false);
}

function addHyperlinkImageSource(document, image) {
    
    var retVal = undefined;

    do {
        try {
            var sourceCount = document.hyperlinkPageItemSources.length;
            var parentId = image.id;
            for (var sourceIdx = 0; sourceIdx < sourceCount; sourceIdx++) {
                try {
                    var source = document.hyperlinkPageItemSources.item(sourceIdx);
                    var sourceId = source.sourcePageItem.id;
                    if (parentId == sourceId) {
                        retVal = source;
                        break;
                    }
                }
                catch (err) {            
                }
            }

            if (retVal) {
                break;
            }

            retVal = document.hyperlinkPageItemSources.add(image); 
        }
        catch (err) {            
        }
    }
    while (false);

    return retVal;
}

function addHyperlinkTextSource(document, text) {
    var retVal = undefined;
    do {
        try {
            var parentId;
            var parentElement = text.characters.item(0).parent[0];
            var isCell = parentElement instanceof Cell;
            if (isCell) {                
                parentId = parentElement.parent.id + "*" + parentElement.index;
            }
            else {
                parentId = text.characters.item(0).parentStory[0].id;
            }
            var fromIdx = text.characters.item(0).index[0];
            var toIdx = text.characters.item(text.characters.length - 1).index[0];
            var sourceCount = document.hyperlinkTextSources.length;
            var toRemove = [];
            for (var sourceIdx = 0; sourceIdx < sourceCount; sourceIdx++) {
                try {
                    var source = document.hyperlinkTextSources.item(sourceIdx);
                    var sourceText = source.sourceText;
                    var sourceElement = sourceText.characters.item(0).parent;
                    var sourceIsCell = sourceElement instanceof Cell;
                    var sourceId;
                    if (sourceIsCell) {
                        sourceId = sourceElement.parent.id + "*" + sourceElement.index;
                    }
                    else {
                        sourceId = sourceText.parentStory.id;
                    }
                    if (sourceId == parentId) {
                        var sourceFromIdx = sourceText.characters.firstItem().index;
                        var sourceToIdx = sourceText.characters.lastItem().index;
                        if (sourceToIdx >= fromIdx && toIdx >= sourceFromIdx) {
                            toRemove.push(source);
                        }
                    }
                }
                catch (err) {            
                }
            }

            for (var removeIdx = 0; removeIdx < toRemove.length; removeIdx++) {
                toRemove[removeIdx].remove();
            }

            retVal = document.hyperlinkTextSources.add(text); 
        }
        catch (err) {            
        }
    }
    while (false);

    return retVal;
}

function addHyperlinkDestination(document, url) {
    var retVal = undefined;
    do {
        try {
            var linkCount = document.hyperlinkURLDestinations.length;
            for (var linkIdx = 0; linkIdx < linkCount; linkIdx++) {
                try {
                    var destination = document.hyperlinkURLDestinations.item(linkIdx);
                    if (destination.destinationURL == url) {
                        retVal = destination;
                        break; // for
                    }
                }
                catch (err) {            
                }
            }
            if (! retVal) {
                retVal = document.hyperlinkURLDestinations.add(url);
            }
        }
        catch (err) {            
        }
    }
    while (false);

    return retVal;
}

function findCharStyle(document, styleName) {

    var retVal = null;

    do {        
        try {
            if (! (document instanceof Document)) {
                break;
            }
            if (! styleName) {
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

            if (! (document instanceof Document)) {
                break;
            }

            var linkCount = document.links.length;
            for (var linkIdx = 0; linkIdx < linkCount; linkIdx++) {
                
                var imageLink = document.links.item(linkIdx);
                
                linkatImageLink(document, imageLink);                               
           }    

            var storyCount = document.stories.length;
            for (var storyIdx = 0; storyIdx < storyCount; storyIdx++) {
                
                var story = document.stories.item(storyIdx);
                
                linkatStory(document, story)               
                
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
                        linkatStory(document, cell);                    
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
        if (app.documents.length && app.activeDocument instanceof Document) {
            linkat(app.activeDocument);
        }
    }
    catch (err) {
    }
}

main();
//app.doScript("main()", ScriptLanguage.JAVASCRIPT, [], UndoModes.ENTIRE_SCRIPT);

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

