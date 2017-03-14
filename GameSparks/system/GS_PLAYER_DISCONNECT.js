// ====================================================================================================
//
// Cloud Code for GS_PLAYER_DISCONNECT, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("SlamUtilities");

var playerWhoLeft = Spark.getPlayer();
var playerId = Spark.getPlayer().getPlayerId();

if (OnPreviewStack()) {
    collection = Spark.runtimeCollection("DEBUG_loggedIn");
    var username = playerWhoLeft.getUserName().toUpperCase();
    collection.remove({"userName":username});
}

var slamId = GetCurrentSlamId(playerId);
if (slamId !== null && slamId !== undefined){
    PlayerDisconnectedSlamUpdate(playerId);
}