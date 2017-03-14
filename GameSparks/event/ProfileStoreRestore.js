// ====================================================================================================
//
// Cloud Code for ProfileStoreRestore, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("ProfileStoreUtilities");

ProfileStoreRestore();

function ProfileStoreRestore(){
    var playerId = Spark.getPlayer().getPlayerId();
    var profileName = Spark.getData().name;
    RestoreProfileForPlayer(playerId, profileName);
}