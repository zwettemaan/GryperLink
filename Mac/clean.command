#
# Remove locally created or derived data and attempt to 
# bring the project back to a 'clean slate'.
#

if [ "${UXPS_COMMANDS_DIR}" == "" -o ! -d "${UXPS_COMMANDS_DIR}" ]; then
    export UXPS_COMMANDS_DIR=`dirname "$0"`/
fi

pushd "${UXPS_COMMANDS_DIR}" > /dev/null

export UXPS_COMMANDS_DIR=`pwd`/

. setTarget.command


if [ -d "${TARGET_SCRIPT_ROOT_DIR}" ]; then

    echo ""
    echo "Removing directory ${TARGET_SCRIPT_ROOT_DIR}"
    echo ""

    rm -rf "${TARGET_SCRIPT_ROOT_DIR}"
fi


if [ "${BUILD_DIR}" != "" -a -d "${BUILD_DIR}" ]; then

    echo ""
    echo "Removing directory ${BUILD_DIR}"
    echo ""

    rm -rf "${BUILD_DIR}"
fi

if [ "${NESTED}" == "" ]; then
    echo ""
    echo "Project is now clean"
    echo ""
    echo "You can now close this Terminal window"
    echo ""
fi

popd > /dev/null
