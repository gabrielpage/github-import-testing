// ====================================================================================================
//
// Cloud Code for ProfileStoreGet, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("ProfileStoreUtilities");

ProfileStoreGet();

function ProfileStoreGet(){
    var playerId = Spark.getPlayer().getPlayerId();
    var allProfiles = GetAllProfilesForPlayer(playerId);
    Spark.setScriptData("profiles", allProfiles);
}