#
# Setup the script to run from the application without making a copy
# of the script
#

if [ "${UXPS_COMMANDS_DIR}" == "" -o ! -d "${UXPS_COMMANDS_DIR}" ]; then
    export UXPS_COMMANDS_DIR=`dirname "$0"`/
fi

pushd "${UXPS_COMMANDS_DIR}" > /dev/null

export UXPS_COMMANDS_DIR=`pwd`/

. setTarget.command


echo ""
echo "Removing ${TARGET_SCRIPT_ROOT_DIR}" 
echo ""

rm -rf "${TARGET_SCRIPT_ROOT_DIR}"

echo ""
echo "Re-creating ${TARGET_SCRIPT_ROOT_DIR}" 
echo ""

mkdir "${TARGET_SCRIPT_ROOT_DIR}"

echo ""
echo "Creating temporary symbolic links to the script and its 'helpers' directory inside directory ${TARGET_SCRIPT_ROOT_DIR}"
echo ""

ln -s "${PROJECT_ROOT_DIR}run_as_UXPScript.${TARGET_FILENAME_EXTENSION}" "${TARGET_SCRIPT_ROOT_DIR}run_as_UXPScript.${TARGET_FILENAME_EXTENSION}"
ln -s "${PROJECT_ROOT_DIR}run_as_ExtendScript.jsx" "${TARGET_SCRIPT_ROOT_DIR}run_as_ExtendScript.jsx"
ln -s "${PROJECT_ROOT_DIR}${DESPACED_TARGET_NAME}.js" "${TARGET_SCRIPT_ROOT_DIR}${DESPACED_TARGET_NAME}.js"
ln -s "${PROJECT_ROOT_DIR}${DESPACED_TARGET_NAME}_helpers" "${TARGET_SCRIPT_ROOT_DIR}${DESPACED_TARGET_NAME}_helpers"

echo ""
echo "You can now close this Terminal window"
echo ""

popd > /dev/null
