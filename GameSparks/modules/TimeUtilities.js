// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================

// Module: TimeUtilities.
// Adds the current server time to either ScriptData or ScriptError.
function AddServerTimeToResponse(dataObject) {
    if (dataObject === null || dataObject === undefined){
        if (Spark.hasScriptErrors()) {
            Spark.setScriptError("serverTime", Math.round(GetNow() / 1000));
        }
        else {
            Spark.setScriptData("serverTime", Math.round(GetNow() / 1000));
        }
    }
    else {
        dataObject.serverTime = Math.round(GetNow() / 1000);
    }
}

// Module: TimeUtilities.
// Returns the current server time in milliseconds, including any time offset that may be set
const serverTimeOffsetKey = "serverTimeOffset";
function GetNow() {
    var now = Date.now();
    var redis = Spark.getRedis();
    var offset = redis.get(serverTimeOffsetKey);
    if (offset === null || offset === undefined) {
        offset = 0;
    }
    var numOffset = parseInt(offset);
    return (now + numOffset);
}

// Module: TimeUtilities.
// Sets the server time offset based on the time you want it to be now (in milliseconds)
function SetNow(newNow) {
    var now = Date.now();
    var offset = newNow - now;
    SetServerTimeOffset(offset);
}

// Module: TimeUtilities.
// Sets the server time offset in redis
function SetServerTimeOffset(offset) {
    var redis = Spark.getRedis();
    redis.set(serverTimeOffsetKey, offset);
}