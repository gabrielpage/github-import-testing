// ====================================================================================================
//
// Cloud Code for QueryServerTime_v01800, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("TimeUtilities");
requireOnce("GeneralUtilities");

QueryServerTime();

function QueryServerTime() {
    var playerId = Spark.getPlayer().getPlayerId();
    AddPossibleVersionOutOfDateToResponse(playerId);
    
    AddServerTimeToResponse();

    // ST: Disconnect any devices currently connected to this account (except this one).
    // A SessionTerminatedMessage will be sent to the socket, and the socket will be unauthenticated
    // NOTE: putting this here because a QueryServerTime event is sent on resuming the client in OnApplicationFocus.
    Spark.getPlayer().disconnect(true);
}