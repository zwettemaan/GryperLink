#!/bin/bash

if [ `uname` != "Darwin" ]; then
    echo Needs to run on Mac
    exit
fi

export SCRIPT_DIR=`dirname "$0"`
cd "$SCRIPT_DIR"
export SCRIPT_DIR=`pwd`/

if ! /usr/bin/which -s uglifyjs; then
    echo "uglifyjs not installed - cannot proceed"
    exit
fi

. "${TIGHTENER_GIT_ROOT}BuildScripts/setEnv"

rm -rf release

mkdir release

cp *.idjs                        release
cp *.idml                        release
cp manifest.json                 release
cp README.txt                    release

for file in *.js; do
    
    filename=$(basename "$file")
    
    uglifyjs "$file" -o "release/$filename" --compress passes=3,drop_console,drop_debugger --mangle --toplevel

done

mkdir release/CreativeDeveloperTools_UXP

for file in CreativeDeveloperTools_UXP/*.js; do
    
    filename=$(basename "$file")
    
    uglifyjs "$file" -o "release/CreativeDeveloperTools_UXP/$filename" --compress passes=3,drop_console,drop_debugger --mangle --toplevel
    
done

echo "------"
echo ""
echo ""
echo "Use PluginInstaller to package up the release folder"
echo ""
echo ""
echo "------"
