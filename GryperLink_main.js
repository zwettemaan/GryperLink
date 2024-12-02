const indesign = require("indesign");
const app = indesign.app;

const crdtuxpIDSN = require("./CreativeDeveloperTools_UXP/crdtuxpIDSN.js");

const SECTION_CONFIG_MAIN          = "gryperlink";
const SECTION_CONFIG_IMAGE_LINK    = "imagelink";
const SECTION_CONFIG_TEXT_LINK     = "textlink";

const DEFAULT_RUN_CRDT_UXP_TESTS   = true;

let PATTERN_LIST = undefined;

async function main() {

    crdtuxp.logEntry(arguments);

    do {
        
        try {

            const context = crdtuxp.getContext();

            const config = {};
            const doc = getTargetDocAndConfig(config);
            if (! doc) {
                crdtuxp.logError(arguments, "failed to get target doc");
                break;
            }

            context.doc = doc;
            context.config = config;

            try {
                linkat(context);
            }
            catch (err) {
                crdtuxp.logError(arguments, "failed to search-and-replace");
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

function addHyperlinkImageSource(context, image) {
    
    let retVal = undefined;

    crdtuxp.logEntry(arguments);

    do {
        try {

            if (! context) {
                crdtuxp.logError(arguments, "needs context");
                break;
            }

            let doc = context.doc;
            if (! doc || ! doc.isValid || doc.constructor.name != "Document") {
                crdtuxp.logError(arguments, "need valid document");
                break;
            }

            let sourceCount = doc.hyperlinkPageItemSources.length;
            let parentId = image.id;

            for (let sourceIdx = 0; sourceIdx < sourceCount; sourceIdx++) {
                try {
                    let source = doc.hyperlinkPageItemSources.item(sourceIdx);
                    let sourceId = source.sourcePageItem.id;
                    if (parentId == sourceId) {
                        retVal = source;
                        break;
                    }
                }
                catch (err) {            
                    crdtuxp.logError(arguments, "loop throws " + err);
                }
            }

            if (retVal) {
                break;
            }

            retVal = doc.hyperlinkPageItemSources.add(image); 
        }
        catch (err) {            
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtuxp.logExit(arguments);

    return retVal;
}

function addHyperlinkTextSource(context, text) {

    let retVal = undefined;

    crdtuxp.logEntry(arguments);

    do {

        try {

            if (! context) {
                crdtuxp.logError(arguments, "needs context");
                break;
            }

            let doc = context.doc;
            if (! doc || ! doc.isValid || doc.constructor.name != "Document") {
                crdtuxp.logError(arguments, "need valid document");
                break;
            }

            let parentId;
            let parentElement = text.characters.item(0).parent[0];

            let isCell = parentElement && parentElement.isValid && parentElement.constructor.name == "Cell";
            if (isCell) {                
                parentId = parentElement.parent.id + "*" + parentElement.index;
            }
            else {
                parentId = text.characters.item(0).parentStory[0].id;
            }

            let fromIdx = text.characters.item(0).index[0];
            let toIdx = text.characters.item(text.characters.length - 1).index[0];
            let sourceCount = doc.hyperlinkTextSources.length;
            let toRemove = [];
            for (let sourceIdx = 0; sourceIdx < sourceCount; sourceIdx++) {

                try {
                    let source = doc.hyperlinkTextSources.item(sourceIdx);
                    let sourceText = source.sourceText;
                    let sourceElement = sourceText.characters.item(0).parent;
                    let sourceIsCell = sourceElement && sourceElement.isValid && sourceElement.constructor.name == "Cell";
                    let sourceId;
                    if (sourceIsCell) {
                        sourceId = sourceElement.parent.id + "*" + sourceElement.index;
                    }
                    else {
                        sourceId = sourceText.parentStory.id;
                    }
                    if (sourceId == parentId) {
                        let sourceFromIdx = sourceText.characters.firstItem().index;
                        let sourceToIdx = sourceText.characters.lastItem().index;
                        if (sourceToIdx >= fromIdx && toIdx >= sourceFromIdx) {
                            toRemove.push(source);
                        }
                    }
                }
                catch (err) {            
                    crdtuxp.logError(arguments, "loop throws " + err);
                }
            }

            for (let removeIdx = 0; removeIdx < toRemove.length; removeIdx++) {
                toRemove[removeIdx].remove();
            }

            retVal = doc.hyperlinkTextSources.add(text); 
        }
        catch (err) {            
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtuxp.logExit(arguments);

    return retVal;
}

function addHyperlinkDestination(context, url) {

    let retVal = undefined;

    crdtuxp.logEntry(arguments);

    do {
        try {

            if (! context) {
                crdtuxp.logError(arguments, "needs context");
                break;
            }

            let doc = context.doc;
            if (! doc || ! doc.isValid || doc.constructor.name != "Document") {
                crdtuxp.logError(arguments, "need valid document");
                break;
            }

            let linkCount = doc.hyperlinkURLDestinations.length;
            for (let linkIdx = 0; linkIdx < linkCount; linkIdx++) {
                try {
                    let destination = doc.hyperlinkURLDestinations.item(linkIdx);
                    if (destination.destinationURL == url) {
                        retVal = destination;
                        break; // for
                    }
                }
                catch (err) {            
                    crdtuxp.logError(arguments, "loop throws " + err);
                }
            }

            if (! retVal) {
                retVal = doc.hyperlinkURLDestinations.add(url);
            }
        }

        catch (err) {            
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtuxp.logExit(arguments);

    return retVal;
}

function defaultConfig(config) {

    let retVal = false;

    crdtuxp.logEntry(arguments);

    do {

        try {

            if (! config) {
                crdtuxp.logError(arguments, "need config");
                break;
            }

            // Default values - can be overridden by user config extracted from doc INI            
            config.runCRDTUXPTests         = DEFAULT_RUN_CRDT_UXP_TESTS;
            
            retVal = true;
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtuxp.logExit(arguments);

    return retVal;
}

function extractDocINIConfig(doc, config) {

    let retVal = false;

    crdtuxp.logEntry(arguments);

    do {

        try {

            if (! doc || ! doc.isValid || doc.constructor.name != "Document") {
                crdtuxp.logError(arguments, "need valid document");
                break;
            }

            if (! config) {
                crdtuxp.logError(arguments, "need config");
                break;
            }

            if (! defaultConfig(config)) {
                crdtuxp.logError(arguments, "failed to set defaults");
                break;
            }
            
            let docINIConfig = findINIConfig(doc);
            if (! docINIConfig) {
                break;
            }

            let docConfig = docINIConfig[SECTION_CONFIG_MAIN];
            if (! docConfig) {
                break;
            }

            // Note: the raw attributes in docConfig are all lowercase (e.g. maxsteps vs maxSteps)

            if (docConfig.runcrdtuxptests) {
                config.runCRDTUXPTests = crdtuxp.getBooleanFromINI(docConfig.runcrdtuxptests);
            }

            let textLinkRawPatternTable = extractRawTable(docINIConfig, SECTION_CONFIG_TEXT_LINK);
            let textLinkPatternTable = [];
            for (let textLinkIdx = 0; textLinkIdx < textLinkRawPatternTable.length; textLinkIdx++) {
                let rawTextLinkPattern = textLinkRawPatternTable[textLinkIdx];
                if (rawTextLinkPattern) {
                    let textLinkPattern = {};
                    let caseSensitiveRegExpFlag = crdtuxp.getBooleanFromINI(rawTextLinkPattern.casesensitive) ? "" : "i";
                    textLinkPattern.matchText = new RegExp(rawTextLinkPattern.matchtext, caseSensitiveRegExpFlag);
                    textLinkPattern.link = rawTextLinkPattern.link;
                    textLinkPattern.applyCharStyleName = rawTextLinkPattern.applycharstylename;
                    textLinkPattern.matchCharStyleName = rawTextLinkPattern.matchcharstylename;
                    textLinkPattern.matchParaStyleName = rawTextLinkPattern.matchparastylename;
                    textLinkPattern.matchFontName = rawTextLinkPattern.matchfontname;
                    textLinkPatternTable.push(textLinkPattern);
                }
            }
            config.textLinkPatternTable = textLinkPatternTable;

            let imageLinkRawPatternTable = extractRawTable(docINIConfig, SECTION_CONFIG_IMAGE_LINK);
            let imageLinkPatternTable = [];
            for (let imageLinkIdx = 0; imageLinkIdx < imageLinkRawPatternTable.length; imageLinkIdx++) {
                let rawImageLinkPattern = imageLinkRawPatternTable[imageLinkIdx];
                if (rawImageLinkPattern) {
                    let imageLinkPattern = {};
                    let caseSensitiveRegExpFlag = crdtuxp.getBooleanFromINI(rawImageLinkPattern.casesensitive) ? "" : "i";
                    imageLinkPattern.matchFilePath = new RegExp(rawImageLinkPattern.matchfilepath, caseSensitiveRegExpFlag);
                    imageLinkPattern.link = rawImageLinkPattern.link;
                    imageLinkPatternTable.push(imageLinkPattern);
                }
            }
            config.imageLinkPatternTable = imageLinkPatternTable;

            retVal = true;
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtuxp.logExit(arguments);

    return retVal;
}

function extractRawTable(docINIConfig, rawSectionName) {

    let retVal = null;

    crdtuxp.logEntry(arguments);

    do {        
        try {

            if (! docINIConfig) {
                crdtuxp.logError(arguments, "needs docINIConfig");
                break;
            }

            if (! rawSectionName) {
                crdtuxp.logError(arguments, "needs rawSectionName");
                break;
            }

            let idx = 0;
            let tableSectionName;

            do {

                idx++;
                if (idx == 1) {
                    tableSectionName = rawSectionName;
                }
                else {
                    tableSectionName = rawSectionName + "_" + idx;
                }

                if (tableSectionName in docINIConfig) {
                    if (! retVal) {
                        retVal = [];
                    }
                    retVal.push(docINIConfig[tableSectionName]);
                }

            }
            while (tableSectionName in docINIConfig)
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtuxp.logExit(arguments);

    return retVal;
}

function findCharStyle(context, styleName) {

    let retVal = null;

    crdtuxp.logEntry(arguments);

    do {        
        try {

            if (! context) {
                crdtuxp.logError(arguments, "needs context");
                break;
            }

            let doc = context.doc;
            if (! doc || ! doc.isValid || doc.constructor.name != "Document") {
                crdtuxp.logError(arguments, "need valid document");
                break;
            }

            if (! styleName) {
                crdtuxp.logError(arguments, "needs styleName");
                break;
            }

            let searchStyleString = styleName.replace(/\s/g,"").toLowerCase();
            let styleCount = doc.characterStyles.length;

            for (let styleIdx = 0; styleIdx < styleCount; styleIdx++) {
                let charStyle = doc.characterStyles.item(styleIdx);
                let charStyleName = charStyle.name;
                let compareStyleString = charStyleName.replace(/\s/g,"").toLowerCase();
                if (compareStyleString == searchStyleString) {
                    retVal = charStyle;
                    break; // for
                }
            }

        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtuxp.logExit(arguments);

    return retVal;
}

function findINIConfig(doc) {

    let retVal = undefined;

    crdtuxp.logEntry(arguments);

    do
    {
        try
        {
            if (! doc || ! doc.isValid || doc.constructor.name != "Document") {
                crdtuxp.logError(arguments, "need valid document");
                break;
            }

            let stories = crdtuxpIDSN.collectionToArray(doc.stories);
            for (let idx = 0; idx < stories.length; idx++) {
                const story = stories[idx];
                const contents = story.contents;
                if (
                    contents.toLowerCase().indexOf("[" + SECTION_CONFIG_MAIN + "]") >= 0
                ||
                    contents.toLowerCase().indexOf("[" + SECTION_CONFIG_TEXT_LINK + "]") >= 0
                ||
                    contents.toLowerCase().indexOf("[" + SECTION_CONFIG_IMAGE_LINK + "]") >= 0
                ) {
                    const config = crdtuxp.readINI(contents);
                    if (
                        config 
                    && 
                        (
                            config[SECTION_CONFIG_MAIN] 
                        ||
                            config[SECTION_CONFIG_TEXT_LINK] 
                        ||
                            config[SECTION_CONFIG_IMAGE_LINK] 
                        ) 
                    ) {
                        retVal = config;
                    }
                }
            }
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtuxp.logExit(arguments);

    return retVal;
}

function getTargetDocAndConfig(config) {

    let retVal = undefined;

    crdtuxp.logEntry(arguments);

    do {
        
        try {

            if (! config) {
                crdtuxp.logError(arguments, "need config");
                break;
            }

            let doc = undefined;
            try {
                doc = app.activeDocument;
                if (! doc || ! doc.isValid || doc.constructor.name != "Document") {
                    doc = undefined;
                }
                else {
                    if (! extractDocINIConfig(doc, config)) {
                        doc = undefined;
                    }
                }
            }
            catch (err) {                
                crdtuxp.logWarning(arguments, "trying to find doc throws " + err);
            }

            if (! doc) {

                if (! defaultConfig(config)) {
                    crdtuxp.logError(arguments, "failed to set defaults");
                    break;
                }

                doc = createDefaultDocument(config);
            }

            retVal = doc;
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }        
    }
    while (false);

    crdtuxp.logExit(arguments);

    return retVal;
}

function linkat(context) {
    
    crdtuxp.logEntry(arguments);

    do {
        try {

            if (! context) {
                crdtuxp.logError(arguments, "needs context");
                break;
            }

            let doc = context.doc;
            if (! doc || ! doc.isValid || doc.constructor.name != "Document") {
                crdtuxp.logError(arguments, "need valid document");
                break;
            }

            let config = context.config;
            if (! config) {
                crdtuxp.logError(arguments, "needs config");
                break;
            }

            if (config.imageLinkPatternTable && config.imageLinkPatternTable.length > 0) {

                let linkCount = doc.links.length;
                for (let linkIdx = 0; linkIdx < linkCount; linkIdx++) {
                    
                    let imageLink = doc.links.item(linkIdx);
                    
                    linkatImageLink(context, imageLink);                               
               }
            }

            let storyCount = doc.stories.length;
            for (let storyIdx = 0; storyIdx < storyCount; storyIdx++) {
                
                let story = doc.stories.item(storyIdx);
                
                linkatStory(context, story)               
                
                //
                // We need to work around a bug in InDesign: when adding a hyperlink 
                // into a cell, the link most often ends up in the wrong cell: there is an 
                // error in how InDesign handles character positions in cells.
                //
                // To work around it, we move the cell contents to a dummy text frame,
                // apply the link, then move the cell contents back.
                //

                let tableCount = story.tables.length;
                for (let tableIdx = 0; tableIdx < tableCount; tableIdx++) {
                    let table = story.tables.item(tableIdx);
                    let cellCount = table.cells.length;
                    for (let cellIdx = --cellCount; cellIdx >= 0; cellIdx--) {
                        let cell = table.cells.item(cellIdx);
                        linkatStory(context, cell);                    
                    }
                }
           }    

           
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }    
    }
    while (false);

    crdtuxp.logExit(arguments);    
}

function linkatImageLink(context, imageLink) {

    crdtuxp.logEntry(arguments);

    do {
        try {

            if (! context) {
                crdtuxp.logError(arguments, "needs context");
                break;
            }

            if (! imageLink || ! imageLink.isValid || imageLink.constructor.name != "Link")
                crdtuxp.logError(arguments, "need Link");
                break;
            }

            let doc = context.doc;
            if (! doc || ! doc.isValid || doc.constructor.name != "Document") {
                crdtuxp.logError(arguments, "need valid document");
                break;
            }

            let config = context.config;
            if (! config) {
                crdtuxp.logError(arguments, "needs config");
                break;
            }

            if (! config.imageLinkPatternTable || config.imageLinkPatternTable.length == 0) {
                break;
            }

            let parentImage = imageLink.parent;
            if (! parentImage || ! parentImage.isValid || parentImage.constructor.name != "Image")
                break;
            }

            let imageFileName = imageLink.name;
            for (let imageLinkPatternIdx = 0; imageLinkPatternIdx < config.imageLinkPatternTable.length; imageLinkPatternIdx++) {

                let imageLinkPattern = config.imageLinkPatternTable[imageLinkPatternIdx];

                let matchFilePath = imageLinkPattern.matchFilePath;
                let link = imageLinkPattern.link;
                if (matchFilePath && link) {

                    if (match = matchFilePath.exec(imageFileName)) {

                        let matchedString = match[0];
                        let matchedLink = matchedString.replace(matchFilePath, link);
                        let hyperLinkDestination = addHyperlinkDestination(context, matchedLink);                        
                        let source = addHyperlinkImageSource(context, parentImage);

                        let hyperLinks = doc.hyperlinks;                        
                        let hyperlinkIdx = hyperLinks.length - 1;
                        while (hyperlinkIdx >= 0) {
                            let hyperLink = hyperLinks[hyperlinkIdx];
                            if (hyperLink.source == source) {
                                hyperLink.remove();
                                break;
                            }
                            hyperlinkIdx--;
                        }

                        try {
                            let link = doc.hyperlinks.add(source, hyperLinkDestination);
                        }
                        catch (err) {                            
                            crdtuxp.logError(arguments, "loop throws " + err);
                        }
                    }                    
                }
            }

        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtuxp.logExit(arguments);        
}

function linkatStory(context, storyOrCell) {

    crdtuxp.logEntry(arguments);

    do {
        try {

            if (! context) {
                crdtuxp.logError(arguments, "needs context");
                break;
            }

            if (
                ! storyOrCell
            ||
                ! storyOrCell.isValid
            ||
                (
                    storyOrCell.constructor.name != "Story"
                &&
                    storyOrCell.constructor.name != "Cell"
                )
            ) {
                crdtuxp.logError(arguments, "need Story or Cell");
                break;
            }

            let doc = context.doc;
            if (! doc || ! doc.isValid || doc.constructor.name != "Document") {
                crdtuxp.logError(arguments, "need valid document");
                break;
            }

            let config = context.config;
            if (! config) {
                crdtuxp.logError(arguments, "needs config");
                break;
            }

            if (! config.textLinkPatternTable || config.textLinkPatternTable.length == 0) {
                break;
            }

            for (let textLinkPatternIdx = 0; textLinkPatternIdx < config.textLinkPatternTable.length; textLinkPatternIdx++) {

                let textLinkPattern = config.textLinkPatternTable[textLinkPatternIdx];

                let matchText = textLinkPattern.matchText;
                if (matchText) {
                    let link = textLinkPattern.link;
                    let text = textLinkPattern.text;
                    let charStyle = findCharStyle(context, textLinkPattern.applyCharStyleName);

                    let matchList = [];
                    let match;
                    let contents = storyOrCell.contents;
                    matchText.lastIndex = 0;

                    while (match = matchText.exec(contents)) {
                        let matchIdx = match.index;
                        let matchedString = match[0];
                        let matchedLink = matchedString.replace(matchText, link);
                        if (text) {
                            let matchedText = matchedString.replace(matchText, text);
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

                    for (let matchListIdx = matchList.length - 1; matchListIdx >= 0; matchListIdx--) {
                        try {
                            let match = matchList[matchListIdx];
                            let startIdx = match.matchIdx;
                            let endIdx = startIdx + match.matchedString.length - 1;
                            let firstChar = storyOrCell.characters.item(startIdx);
                        
                            let replace = true;                      

                            if (replace && textLinkPattern.matchParaStyleName) {
                                try {
                                    replace = false;
                                    let paraStyleName = firstChar.appliedParagraphStyle.name;
                                    if (textLinkPattern.matchParaStyleName.exec(paraStyleName)) {
                                        replace = true;
                                    }
                                }
                                catch (err) {
                                    crdtuxp.logWarning(arguments, "para style search throws " + err);
                                }
                            }

                            if (replace && textLinkPattern.matchCharStyleName) {
                                try {
                                    replace = false;
                                    let charStyleName = firstChar.appliedCharacterStyle.name;
                                    if (textLinkPattern.matchCharStyleName.exec(charStyleName)) {
                                        replace = true;
                                    }
                                }
                                catch (err) {
                                    crdtuxp.logWarning(arguments, "char style search throws " + err);
                                }
                            }

                            if (replace && textLinkPattern.matchFontName) {
                                try {
                                    replace = false;
                                    let font = firstChar.appliedFont;
                                    if (font && font.isValid && font.constructor.name == "Font") {
                                        font = font.name;
                                    }
                                    if (textLinkPattern.matchFontName.exec(font)) {
                                        replace = true;
                                    }
                                }
                                catch (err) {
                                    crdtuxp.logWarning(arguments, "font name search throws " + err);
                                }
                            }
                        
                            if (replace) {
                                if (matchedText) {
                                    storyOrCell.characters.itemByRange(startIdx + 1, endIdx).remove();
                                    storyOrCell.characters.item(startIdx).contents = match.matchedText;
                                    endIdx = startIdx + match.matchedText.length - 1;
                                }
                                try {
                                    let hyperLinkDestination = addHyperlinkDestination(context, match.matchedLink);
                                    let characters = storyOrCell.characters.itemByRange(startIdx, endIdx);
                                    let source = addHyperlinkTextSource(context, characters);

                                    let hyperLinks = app.activeDocument.hyperlinks;                        
                                    let hyperlinkIdx = hyperLinks.length - 1;
                                    while (hyperlinkIdx >= 0) {
                                        let hyperLink = hyperLinks[hyperlinkIdx];
                                        if (hyperLink.source == source) {
                                            hyperLink.remove();
                                            break;
                                        }
                                        hyperlinkIdx--;
                                    }
                                    try {
                                        let link = app.activeDocument.hyperlinks.add(source, hyperLinkDestination);
                                    }
                                    catch (err) {                            
                                        crdtuxp.logWarning(arguments, "hyperlink add throws " + err);
                                    }
                                    if (charStyle) {
                                        characters.appliedCharacterStyle = charStyle;
                                    }
                                }
                                catch (err) {
                                    crdtuxp.logWarning(arguments, "replace throws " + err);
                                }
                            }
                        }
                        catch (err) {
                            crdtuxp.logError(arguments, "loop throws " + err);
                        }
                    }
                }
            }
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtuxp.logExit(arguments);        
}

