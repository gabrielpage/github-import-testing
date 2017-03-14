// ====================================================================================================
//
// Cloud Code for ProfileStoreSaveTransfer, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("ProfileStoreUtilities");

ProfileStoreSaveTransfer();

function ProfileStoreSaveTransfer(){
    var playerId = Spark.getPlayer().getPlayerId();
    var id = Spark.getData().id;
    var displayName = Spark.getData().name;
    var stack = Spark.getData().stack;
    SaveNewTransferForPlayer(playerId, id, displayName, stack);
}