const indesign = require("indesign");
const app = indesign.app;

const crdtuxpIDSN = require("./CreativeDeveloperTools_UXP/crdtuxpIDSN.js");

const ICON_COMPRESSED = "CFY7Oj0yNiZQU0xWQkxECgxfRUcUUV4CQxdADVsCFkdFXg1TShBFDA8DFlZeSyc0ICE3OzEiPjU7JUxdUQcTBQsUMwYdGwEPGh8dRw0IHlZeSz41PDAnKjo4MDs2LExdUTMAEB4CATgbBwVFX1YxKD4mMT0+IDo+LCE8JSEkODE2Nj4wUU5QX1pQQEYVCB0BVSpQFA==";
const SECTION_CONFIG_MAIN          = "gryperlink";
const SECTION_CONFIG_IMAGE_LINK    = "imagelink";
const SECTION_CONFIG_TEXT_LINK     = "textlink";
const SCRIPT_LABEL_COUNTER_MARKER  = "com.rorohiko.gryperlink.countermarker";
const MAX_DEMO_LINKS_PER_BATCH     = 2;
const PROCESS_ALL_LINKS            = -1;

const DEFAULT_RUN_CRDT_UXP_TESTS   = true;

let IS_LICENSED = undefined;

async function main() {

    crdtuxp.logEntry(arguments);

    do {
        
        try {

            const context = crdtuxp.getContext();

            const config = {};
            const doc = await getTargetDocAndConfig(config);
            if (! doc) {
                crdtuxp.logError(arguments, "failed to get target doc");
                break;
            }

            context.doc = doc;
            context.config = config;

            if (IS_LICENSED) {
                config.remainingImageLinks = PROCESS_ALL_LINKS;
                config.remainingTextLinks = PROCESS_ALL_LINKS;
            }
            else {
                config.remainingImageLinks = MAX_DEMO_LINKS_PER_BATCH;
                config.remainingTextLinks = MAX_DEMO_LINKS_PER_BATCH;
            }
            
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

function createDefaultDocument(config) {

    let retVal = false;

    crdtuxp.logEntry(arguments);

    do {

        try {

            if (! config) {
                crdtuxp.logError(arguments, "need config");
                break;
            }

            let doc = app.documents.add();

            let configFrame = doc.textFrames.add();
            let page = doc.pages.item(0);
            let pageBounds = page.bounds;
            let pageWidth = pageBounds[3] - pageBounds[1];

            configFrame.geometricBounds = [ pageBounds[0], pageBounds[1] - pageWidth, pageBounds[2], pageBounds[3] - pageWidth];
            configFrame.contents = 
"# Sample configuration. Copy this text frame into your document, then adjust!\n" +
"\n" +
"[gryperlink]\n" +
"\n" +
"#\n" +
"# No need to quote strings, unless you need trailing or leading spaces\n" +
"# GREP expressions are JavaScript GREP, not InDesign GREP\n" +
"# See\n" +
"# https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions\n" +
"#\n" +
"#\n" +
"# One or more sections named [text link] or [image link]\n" +
"#\n" +
"\n" +
"[text link]\n" +
"\n" +
"    # Delete this whole text link section if you don’t need text links\n" +
"\n" +
"    # match text: a GREP expression. \b is a GREP pattern that means: word boundary\n" +
"    # replace text: a replacement for the matched text.\n" +
"    #   $n, n = 1, 2, 3... refers to parenthesized subpatterns in the GREP expression\n" +
"    #   Leave empty if text should not be touched\n" +
"    # link: the URL for the hyperlink to be applied.\n" +
"    #   $n, n = 1, 2, 3... refers to parenthesized subpatterns in the GREP expression\n" +
"    # apply char style name: the character style to apply to the matched text\n" +
"    #   Delete this if you don’t need a character style to be applied\n" +
"    # case sensitive: the default is to be case insensitive when matching.\n" +
"    #   Set case sensitive = yes to make the search become case sensitive.\n" +
"\n" +
"    match text = \b(\d{6}-\d{2})\s\n" +
"    link = https://rorohiko.com?SAMPLE_PARAM=$1\n" +
"    apply char style name = HyperLinkStyle\n" +
"    case sensitive = no\n" +
"\n" +
"    # Additional match options below. Either delete them or\n" +
"    # leave these empty if you don’t need them.\n" +
"    # Style names are case-insensitive\n" +
        "\n" +
"    match paragraph style =\n" +
"    match character style = ^(Partnumber|HyperLinkStyle)$\n" +
"    match font name =\n" +
"\n" +
"\n" +
"[image link]\n" +
"\n" +
"    # Delete this whole image link section if you don’t need image links\n" +
"\n" +
"    # match file path: a GREP expression.\n" +
"    # case sensitive: the default is to be case insensitive when matching.\n" +
"    #   Set case sensitive = yes to make the search become case sensitive.\n" +
"    # link: the URL for the hyperlink to be applied.\n" +
"    #   $n, n = 1, 2, 3... refers to parenthesized subpatterns in the GREP expression\n" +
"\n" +
"    match file path = ^\b(\d{6}-\d{2}).tif$\n" +
"    link = https://rorohiko.com?SAMPLE_PARAM=$1\n" +
"    case sensitive = no\n";
  
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
                    textLinkPattern.matchText = new RegExp(rawTextLinkPattern.matchtext, "g" + caseSensitiveRegExpFlag);
                    textLinkPattern.replaceText = rawTextLinkPattern.replacetext;
                    textLinkPattern.link = rawTextLinkPattern.link;

                    if (rawTextLinkPattern.applycharstylename) {
                        textLinkPattern.applyCharStyleName = rawTextLinkPattern.applycharstylename;
                    }
                    else if (rawTextLinkPattern.applycharacterstylename) {
                        textLinkPattern.applyCharStyleName = rawTextLinkPattern.applycharacterstylename;
                    }
                    else if (rawTextLinkPattern.applycharstyle) {
                        textLinkPattern.applyCharStyleName = rawTextLinkPattern.applycharstyle;
                    }
                    else if (rawTextLinkPattern.applycharacterstyle) {
                        textLinkPattern.applyCharStyleName = rawTextLinkPattern.applycharacterstyle;
                    }

                    let rawMatchFontName;
                    if (rawTextLinkPattern.matchfontname) {
                        rawMatchFontName = rawTextLinkPattern.matchfontname;
                    }
                    else if (rawTextLinkPattern.matchfont) {
                        rawMatchFontName = rawTextLinkPattern.matchfont;
                    }

                    if (rawMatchFontName) {
                        textLinkPattern.matchFontName = new RegExp(rawMatchFontName, "i");
                    }

                    let rawMatchCharStyleName;
                    if (rawTextLinkPattern.matchcharstylename) {
                        rawMatchCharStyleName = rawTextLinkPattern.matchcharstylename;
                    }
                    else if (rawTextLinkPattern.matchcharacterstylename) {
                        rawMatchCharStyleName = rawTextLinkPattern.matchcharacterstylename;
                    }
                    else if (rawTextLinkPattern.matchcharstyle) {
                        rawMatchCharStyleName = rawTextLinkPattern.matchcharstyle;
                    }
                    else if (rawTextLinkPattern.matchcharacterstyle) {
                        rawMatchCharStyleName = rawTextLinkPattern.matchcharacterstyle;
                    }

                    if (rawMatchCharStyleName) {
                        textLinkPattern.matchCharStyleName = new RegExp(rawMatchCharStyleName, "i");
                    }

                    let rawMatchParaStyleName;
                    if (rawTextLinkPattern.matchparastylename) {
                        rawMatchParaStyleName = rawTextLinkPattern.matchparastylename;
                    }
                    else if (rawTextLinkPattern.matchparagraphstylename) {
                        rawMatchParaStyleName = rawTextLinkPattern.matchparagraphstylename;
                    }
                    else if (rawTextLinkPattern.matchparastyle) {
                        rawMatchParaStyleName = rawTextLinkPattern.matchparastyle;
                    }
                    else if (rawTextLinkPattern.matchparagraphstyle) {
                        rawMatchParaStyleName = rawTextLinkPattern.matchparagraphstyle;
                    }

                    if (rawMatchParaStyleName) {
                        textLinkPattern.matchParaStyleName = new RegExp(rawMatchParaStyleName, "i");
                    }

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
                const lowerCaseSpacelessContents = contents.toLowerCase().replace(/\s*/g,"");
                if (
                    lowerCaseSpacelessContents.indexOf("[" + SECTION_CONFIG_MAIN + "]") >= 0
                ||
                    lowerCaseSpacelessContents.indexOf("[" + SECTION_CONFIG_TEXT_LINK + "]") >= 0
                ||
                    lowerCaseSpacelessContents.indexOf("[" + SECTION_CONFIG_IMAGE_LINK + "]") >= 0
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

async function getTargetDocAndConfig(config) {

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

            config.crdtuxp = deobfuscate(ICON_COMPRESSED, "string" + typeof("string"));

            if (! doc) {

                if (! defaultConfig(config)) {
                    crdtuxp.logError(arguments, "failed to set defaults");
                    break;
                }

                doc = createDefaultDocument(config);
            }

            let isLicensed = false;
            try 
            {
                let capabilityWrapperStr = 
                    await crdtuxp.getCapability(
                        config.crdtuxp.ISSUER, 
                        config.crdtuxp.PRODUCT_CODE, 
                        config.crdtuxp.CAPABILITY_UNLOCKED_PW);
                if (capabilityWrapperStr && capabilityWrapperStr != "NOT_ACTIVATED")
                {
                    let capabilityWrapper = JSON.parse(capabilityWrapperStr);
                    if (capabilityWrapper.capability)
                    {
                        let capability = JSON.parse(capabilityWrapper.capability);
                        if (capability.platform == "desktop")
                        {
                            isLicensed = true;
                        }
                    }
                }
            }
            catch (err) 
            {
                isLicensed = false;
            }

            IS_LICENSED = isLicensed;

            retVal = doc;
        }
        catch (err) {
            crdtuxp.logError(arguments, "throws " + err);
        }        
    }
    while (false);

    crdtuxp.logExit(arguments);

    return retVal;

    function deobfuscate(obfuscatedString, key) {
        const xorDecoded = atob(obfuscatedString); // Decode from base64
        const jsonString = xorEncryptDecrypt(xorDecoded, key);
        return JSON.parse(jsonString);
    }

    function xorEncryptDecrypt(input, key) {
        const keyLength = key.length;
        return Array.from(input).map((char, i) => 
            String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % keyLength))
        ).join('');
    }

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
                
                linkatStory(context, story);            
                
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

            if (! imageLink || ! imageLink.isValid || imageLink.constructor.name != "Link") {
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
            if (! parentImage || ! parentImage.isValid || parentImage.constructor.name != "Image") {
                break;
            }

            let imageFileName = imageLink.name;

            for (let imageLinkPatternIdx = 0; imageLinkPatternIdx < config.imageLinkPatternTable.length; imageLinkPatternIdx++) {

                do {
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
                                let hyperLink = hyperLinks.item(hyperlinkIdx);
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
                while (false);
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

            if (config.remainingTextLinks == 0) {
                break;
            }

            if (! config.textLinkPatternTable || config.textLinkPatternTable.length == 0) {
                break;
            }

            for (let textLinkPatternIdx = 0; textLinkPatternIdx < config.textLinkPatternTable.length; textLinkPatternIdx++) {

                let textLinkPattern = config.textLinkPatternTable[textLinkPatternIdx];

                let matchText = textLinkPattern.matchText;

                if (matchText) {

                    let contents = storyOrCell.contents;

                    let linkPattern = textLinkPattern.link;
                    let replaceTextPattern = textLinkPattern.replaceText;
                    let charStyle = findCharStyle(context, textLinkPattern.applyCharStyleName);

                    let matchList = [];
                    let match;
                    matchText.lastIndex = 0;

                    // Make a list of all matches and the index where they are found
                    // by repeating exec() on the GREP expression
                    while (match = matchText.exec(contents)) {
                        let matchIdx = match.index;
                        let originalText = match[0];
                        matchList.push({
                            matchIdx: matchIdx,
                            originalText: originalText
                        });
                    }

                    // Calculate the strings for text replacement and link insertion
                    for (let matchListIdx = 0; matchListIdx < matchList.length; matchListIdx++) {

                        match = matchList[matchListIdx];
                        let originalText = match.originalText;

                        // Apply the GREP replacement on the the original text to get the 
                        // link string
                        let linkToInject = "";
                        if (linkPattern) {
                            linkToInject = originalText.replace(matchText, linkPattern);
                        }

                        let replacementText = "";
                        if (replaceTextPattern) {
                            replacementText = originalText.replace(matchText, replaceTextPattern);
                        }

                        match.linkToInject = linkToInject;
                        match.replacementText = replacementText;
                    }

                    let filteredMatchList = [];
                    for (let matchListIdx = 0; matchListIdx < matchList.length; matchListIdx++) {

                        do {
                            try {
                                // 
                                // Check additional match criteria, if any
                                //
                                let match = matchList[matchListIdx];
                                let startIdx = match.matchIdx;
                                let firstChar = storyOrCell.characters.item(startIdx);
                                
                                if (textLinkPattern.matchParaStyleName) {
                                    try {
                                        let paraStyleName = firstChar.appliedParagraphStyle.name;
                                        if (! textLinkPattern.matchParaStyleName.exec(paraStyleName)) {
                                            break;
                                        }
                                    }
                                    catch (err) {
                                        crdtuxp.logWarning(arguments, "para style search throws " + err);
                                    }
                                }

                                if (textLinkPattern.matchCharStyleName) {
                                    try {
                                        let charStyleName = firstChar.appliedCharacterStyle.name;
                                        if (! textLinkPattern.matchCharStyleName.exec(charStyleName)) {
                                            break;
                                        }
                                    }
                                    catch (err) {
                                        crdtuxp.logWarning(arguments, "char style search throws " + err);
                                    }
                                }

                                if (textLinkPattern.matchFontName) {
                                    try {
                                        let font = firstChar.appliedFont;
                                        if (font && font.isValid && font.constructor.name == "Font") {
                                            font = font.name;
                                        }
                                        if (! textLinkPattern.matchFontName.exec(font)) {
                                            break;
                                        }
                                    }
                                    catch (err) {
                                        crdtuxp.logWarning(arguments, "font name search throws " + err);
                                    }
                                }

                                filteredMatchList.push(match);
                            }
                            catch (err) {
                                crdtuxp.logError(arguments, "loop throws " + err);
                            }
                        }
                        while (false);
                    }

                    let lastMatchIdx = filteredMatchList.length - 1;
                    if (config.remainingTextLinks > 0) {
                        if (lastMatchIdx >= config.remainingTextLinks) {
                            lastMatchIdx = config.remainingTextLinks - 1;
                        }
                    }

                    for (let matchListIdx = lastMatchIdx; matchListIdx >= 0; matchListIdx--) {

                        try {
                            // 
                            // Check additional match criteria, if any
                            //
                            let match = filteredMatchList[matchListIdx];
                            let startIdx = match.matchIdx;
                            let endIdx = startIdx + match.originalText.length - 1;
                            let firstChar = storyOrCell.characters.item(startIdx);
                            let linkToInject = match.linkToInject;
                            let replacementText = match.replacementText;
                            
                            if (config.remainingTextLinks > 0) {
                                config.remainingTextLinks--;
                            }

                            let replacementEntry = {};

                            if (replacementText) {
                                replacementEntry.startIdx = startIdx;
                                replacementEntry.endIdx = endIdx;
                                replacementEntry.replacementText = replacementText;

                                storyOrCell.characters.itemByRange(startIdx + 1, endIdx).remove();
                                storyOrCell.characters.item(startIdx).contents = replacementText;
                                endIdx = startIdx + replacementText.length - 1;
                            }

                            try {
                                let hyperLinkDestination = addHyperlinkDestination(context, linkToInject);
                                let characters = storyOrCell.characters.itemByRange(startIdx, endIdx);
                                let source = addHyperlinkTextSource(context, characters);

                                let hyperLinks = app.activeDocument.hyperlinks;                        
                                let hyperlinkIdx = hyperLinks.length - 1;
                                while (hyperlinkIdx >= 0) {
                                    let hyperLink = hyperLinks.item(hyperlinkIdx);
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

