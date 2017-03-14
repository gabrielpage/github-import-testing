// ====================================================================================================
//
// Cloud Code for ProfileStoreReturnSnapshot, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("ProfileStoreUtilities");

ProfileStoreReturnSnapshot();

function ProfileStoreReturnSnapshot(){
    var playerId = Spark.getPlayer().getPlayerId();
    var snapshot = SnapshotPlayerProfile(playerId);
    Spark.setScriptData("snapshot", snapshot);
}