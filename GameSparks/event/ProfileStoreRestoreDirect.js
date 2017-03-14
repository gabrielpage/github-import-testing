// ====================================================================================================
//
// Cloud Code for ProfileStoreRestoreDirect, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("ProfileStoreUtilities");

ProfileStoreRestoreDirect();

function ProfileStoreRestoreDirect(){
    var playerId = Spark.getPlayer().getPlayerId();
    var gsPlayerJSON = Spark.getData().gsData;
    var ourPlayerJSON = Spark.getData().ourData;
    var dealershipJSON = Spark.getData().dealershipData;
    var eventPrizesJSON = Spark.getData().eventPrizesData;

    var gsPlayerData = JSON.parse(gsPlayerJSON);
    var ourPlayerData = JSON.parse(ourPlayerJSON);
    var dealershipData = JSON.parse(dealershipJSON);
    var eventPrizesData = JSON.parse(eventPrizesJSON);

    RestoreProfileDirectlyForPlayer(playerId, gsPlayerData, ourPlayerData, eventPrizesData, dealershipData);
}