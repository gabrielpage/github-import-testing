// ====================================================================================================
//
// Cloud Code for ProfileStoreGetTransferList, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("ProfileStoreUtilities");

ProfileStoreGetTransferList();

function ProfileStoreGetTransferList(){
    var playerId = Spark.getPlayer().getPlayerId();
    var allTransfers = GetAllTransfersForPlayer(playerId);
    Spark.setScriptData("transfers", allTransfers);
}