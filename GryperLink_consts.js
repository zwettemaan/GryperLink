// Run this in Node to get a line to be inserted into GryperLink_main.js

var CST = {};

CST.ISSUER                    = "1186cb863f80e0c2d5ee377c49d7eade";
CST.ISSUER_EMAIL              = "sales@rorohiko.com";
CST.PRODUCT_CODE              = "GryperLink";
CST.CAPABILITY_UNLOCKED_PW    = "64732gasf&^";

function obfuscate(jsonObject, key) {
    const jsonString = JSON.stringify(jsonObject);
    const xorEncoded = xorEncryptDecrypt(jsonString, key);
    return btoa(xorEncoded); // Convert to base64 for readability
}

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


// Obfuscate
const obfuscatedData = obfuscate(CST, "string" + typeof("string"));
console.log("const compressedIcon = \"" + obfuscatedData + "\"");

// Deobfuscate
//const deobfuscatedData = deobfuscate(obfuscatedData, key);
//console.log("Deobfuscated:", deobfuscatedData);