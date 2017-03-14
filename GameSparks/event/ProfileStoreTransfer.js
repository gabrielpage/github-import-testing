// ====================================================================================================
//
// Cloud Code for ProfileStoreTransfer, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("ProfileStoreUtilities");

ProfileStoreTransfer();

function ProfileStoreTransfer(){
    var master = Spark.getData().master;
    var gsData = Spark.getData().gsData;
    var ourData = Spark.getData().ourData;
    var dealershipData = Spark.getData().dealershipData;
    var eventPrizesData = Spark.getData().eventPrizesData;
    var playerId = Spark.getPlayer().getPlayerId();
    SaveNewProfileFromTransferForPlayer(playerId, master, gsData, ourData, dealershipData, eventPrizesData);
}