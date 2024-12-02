if [ `uname` != "Darwin" ]; then
    echo Needs to run on Mac
    exit
fi

export TARGET_NAME=GryperLink

export SCRIPT_DIR=`dirname $0`
cd $SCRIPT_DIR
export SCRIPT_DIR=`pwd`/

cd ..
export PROJECT_DIR=`pwd`/

. "${TIGHTENER_GIT_ROOT}BuildScripts/setEnv"

echo "update_crdt started"

if [ "${TIGHTENER_GIT_ROOT}" = "" -o ! -d "${TIGHTENER_GIT_ROOT}" ]; then
    echo "Cannot update CreativeDeveloperTools_UXP. ${TARGET_NAME} repo needs to be installed alongside Tightener repo"
    exit
fi

export CREATIVE_DEVELOPER_TOOLS_UXP="${TIGHTENER_GIT_ROOT}/../CRDT_UXP/CreativeDeveloperTools_UXP/"
if [ ! -d "${CREATIVE_DEVELOPER_TOOLS_UXP}" ]; then
    echo "Cannot update CreativeDeveloperTools_UXP. ${TARGET_NAME} repo needs to be installed alongside CRDT_UXP repo"
    exit
fi

export TARGET_UXP_DIR="${PROJECT_DIR}CreativeDeveloperTools_UXP/"
rm -rf "${TARGET_UXP_DIR}"
mkdir "${TARGET_UXP_DIR}"

cp "${CREATIVE_DEVELOPER_TOOLS_UXP}crdtuxp.js"      "${TARGET_UXP_DIR}crdtuxp.js"
cp "${CREATIVE_DEVELOPER_TOOLS_UXP}crdtuxpIDSN.js"  "${TARGET_UXP_DIR}crdtuxpIDSN.js"
cp "${CREATIVE_DEVELOPER_TOOLS_UXP}crdtuxp_test.js" "${TARGET_UXP_DIR}crdtuxp_test.js"

echo "update_crdt complete"
