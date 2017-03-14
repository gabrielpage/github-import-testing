// ====================================================================================================
//
// Cloud Code for SlotCostsRequest, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("CollectionUtilities");

SlotCostsRequest();

function SlotCostsRequest() {
    var playerId = Spark.getPlayer().getPlayerId();
    var slotCostData = GetCarSlotCostsCollection(playerId).findOne(); // Should only be one item in the collection!
    Spark.setScriptData("SlotCostData", slotCostData.ClientData);
}