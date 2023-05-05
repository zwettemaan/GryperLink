//
// This code is exclusively ExtendScript. It provides ExtendScript-specific 
// implementations of the utils API.
//
(function() {

var timedFunctionList = undefined;
var nextIdleAfter = undefined;
var cancelledTaskIds = {};
var taskIdCounter = 0;

GrpL.clearImmediate = function _clearImmediate(taskId) {

    GrpL.logEntry(arguments);

    clearTimedFunction(taskId);

    GrpL.logExit(arguments);

}

GrpL.clearInterval = function _clearInterval(taskId) {

    GrpL.logEntry(arguments);

    clearTimedFunction(taskId);

    GrpL.logExit(arguments);

}

GrpL.clearTimeout = function _clearTimeout(taskId) {

    GrpL.logEntry(arguments);

    clearTimedFunction(taskId);

    GrpL.logExit(arguments);

}

function clearTimedFunction(taskId) {

    GrpL.logEntry(arguments);

    try {
        cancelledTaskIds[taskId] = true;
    }
    catch (err) {
        GrpL.logError(arguments, "throws " + err);
    }

    GrpL.logExit(arguments);

}

GrpL.setImmediate = function _setImmediate(taskFtn) {

    var retVal;

    GrpL.logEntry(arguments);

    retVal = timedFunction(taskFtn, 0, false);

    GrpL.logExit(arguments);

    return retVal;
}

GrpL.setInterval = function _setInterval(taskFtn, timeoutMilliseconds) {

    var retVal;

    GrpL.logEntry(arguments);

    retVal = timedFunction(taskFtn, timeoutMilliseconds, true);

    GrpL.logExit(arguments);

    return retVal;
}

GrpL.setTimeout = function _setTimeout(taskFtn, timeoutMilliseconds) {

    var retVal;

    GrpL.logEntry(arguments);

    retVal = timedFunction(taskFtn, timeoutMilliseconds, false);

    GrpL.logExit(arguments);

    return retVal;
}

function timedFunction(taskFtn, timeOutMilliseconds, isRepeat) {

    var retVal;

    GrpL.logEntry(arguments);

    do {
        try {

            taskIdCounter++;

            if (! timeOutMilliseconds) {
                timeOutMilliseconds = 0;
            }

            var now = (new Date()).getTime();
            var callAfter = now + timeOutMilliseconds;

            var taskEntry = {
                taskFtn: taskFtn, 
                taskId: taskIdCounter,
                timeOutMilliseconds: timeOutMilliseconds,
                callAfter: callAfter
            };

            if (! timedFunctionList) 
            {          
                timedFunctionList = [];

                timedFunctionIdleTask = app.idleTasks.add();
                timedFunctionIdleTask.addEventListener(
                    IdleTask.ON_IDLE,
                    function() {

                        var activeTaskList = timedFunctionList ? timedFunctionList : [];
                        timedFunctionList = [];
                        nextIdleAfter = undefined;

                        var activeCancelledTasks = cancelledTaskIds;
                        cancelledTaskIds = {};

                        for (var taskIdx = 0; taskIdx < activeTaskList.length; taskIdx++) {

                            var now = (new Date()).getTime();

                            var task = activeTaskList[taskIdx];
                            var taskFinished = false;

                            if (task.taskId in activeCancelledTasks) {
                                taskFinished = true;
                            }
                            else if (task.callAfter < now) {

                                task.taskFtn();

                                taskFinished = ! isRepeat;
                                if (! isRepeat) {
                                    taskFinished = true;
                                }
                                else {
                                    now = (new Date()).getTime();
                                    task.callAfter = now + task.timeOutMilliseconds;
                                }
                            }

                            if (! taskFinished) {
                                timedFunctionList.push(task);
                            }
                        }

                        if (timedFunctionList.length == 0) {
                            timedFunctionList = undefined;
                            if (timedFunctionIdleTask) {
                                timedFunctionIdleTask.sleep = 0;
                            }
                            timedFunctionIdleTask = undefined;
                        }
                        else if (nextIdleAfter === undefined || nextIdleAfter > soonestCallAfter) {

                            var soonestCallAfter = undefined;
                            for (var taskIdx = 0; taskIdx < timedFunctionList.length; taskIdx++) {
                                if (soonestCallAfter === undefined || soonestCallAfter > task.callAfter) {
                                    soonestCallAfter = task.callAfter;
                                }
                            }

                            var now = (new Date()).getTime();
                            var sleepTime = soonestCallAfter - now;
                            if (sleepTime < 1) {
                                sleepTime = 1;
                            }
                            timedFunctionIdleTask.sleep  = sleepTime;
                            nextIdleAfter = now + sleepTime;
                        }
                    }
                );

            }

            timedFunctionList.push(taskEntry);
            retVal = taskEntry.taskId;

            if (nextIdleAfter !== undefined && (nextIdleAfter < callAfter)) {
                break;
            }

            var sleepTime = timeOutMilliseconds;
            if (sleepTime < 1) {
                sleepTime = 1; // That's the lowest we can go
            }

            timedFunctionIdleTask.sleep = sleepTime; 
            nextIdleAfter = now + sleepTime;

        }
        catch (err) {
            GrpL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    GrpL.logExit(arguments);

    return retVal;
}

})();