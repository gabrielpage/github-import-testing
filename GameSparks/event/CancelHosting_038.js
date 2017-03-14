// ====================================================================================================
//
// Cloud Code for CancelHosting_038, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");

CancelHosting_038();

function CancelHosting_038(){
    var event = Spark.getData().event;
    var betAmount = Spark.getData().betAmount;
    var playerID = Spark.getPlayer().getPlayerId();
    var version = Spark.getPlayer().getSegmentValue("VERSION");

    if (version === undefined || version === null){
        ErrorMessage("There is no version segment");
        return;
    }

    var redis = Spark.getRedis();
    var key = "rankings_" + event + "_" + betAmount + "_" + version;

    var removed = redis.zrem(key, playerID);
    if (!removed){
        ErrorMessage("Couldn't remove us from the redis database");
    }

    Spark.runtimeCollection("MATCHMAKE_keys").remove({"_id":playerID});
}