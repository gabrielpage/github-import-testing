// ====================================================================================================
//
// Cloud Code for ProfileStoreSave, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("ProfileStoreUtilities");

ProfileStoreSave();

function ProfileStoreSave(){
    var playerId = Spark.getPlayer().getPlayerId();
    var profileName = Spark.getData().name;
    var profileDescription = Spark.getData().description;
    SaveNewProfileForPlayer(playerId, profileName, profileDescription);
}