// ====================================================================================================
//
// Cloud Code for ProfileStoreGetOne, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("ProfileStoreUtilities");

ProfileStoreGetOne();

function ProfileStoreGetOne(){
    var name = Spark.getData().name;
    var playerId = Spark.getPlayer().getPlayerId();
    var profile = GetProfileForPlayer(playerId, name);
    Spark.setScriptData("master", profile.master);
    Spark.setScriptData("gsPlayer", profile.gsPlayer);
    Spark.setScriptData("ourPlayer", profile.ourPlayer);
    Spark.setScriptData("playerDealership", profile.playerDealership);
    Spark.setScriptData("playerEventPrizes", profile.playerEventPrizes);
}