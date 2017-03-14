// ====================================================================================================
//
// Cloud Code for ProfileStoreDelete, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("ProfileStoreUtilities");

ProfileStoreDelete();

function ProfileStoreDelete(){
    var playerId = Spark.getPlayer().getPlayerId();
    var profileName = Spark.getData().name;
    RemoveProfileForPlayer(playerId, profileName);
}