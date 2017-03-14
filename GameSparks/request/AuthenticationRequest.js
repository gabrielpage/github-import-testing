// ====================================================================================================
//
// Cloud Code for AuthenticationRequest, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");

var tryUserName = Spark.getData().userName;
var collection = Spark.runtimeCollection("DEBUG_loggedIn");
var sd = Spark.getData().scriptData;

AuthenticationRequest();

function AuthenticationRequest(){
    if (OnPreviewStack()) {
        var array = collection.distinct("userName");
        for (i = 0; i < array.length; ++i)
        {
            if (array[i] === tryUserName)
            {
                ErrorMessage("AccountInUse");
                return;
            }
        }
    }

    Spark.setScriptData("DEVICE", false);

    if (OnPreviewStack()) {
        Spark.setScriptData("userName", tryUserName);
    }

    if (sd !== null && sd !== undefined) {
        if (sd.VERSION !== undefined) {
            Spark.setScriptData("VERSION", sd.VERSION);
        }
        if (sd.PLATFORM !== undefined) {
            Spark.setScriptData("PLATFORM", sd.PLATFORM);
        }
    }
}