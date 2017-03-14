// ====================================================================================================
//
// Cloud Code for GooglePlusConnectRequest, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

var segments = Spark.getData().segments;
if (segments !== undefined && segments !== null){
    var version = segments["VERSION"];
}

if (version !== undefined && version !== null){
    Spark.setScriptData("VERSION", version);
}

Spark.setScriptData("DEVICE", false);

var sd = Spark.getData().scriptData;
if (sd !== null && sd !== undefined) {
    if (sd.PLATFORM !== undefined) {
        Spark.setScriptData("PLATFORM", sd.PLATFORM);
    }
}