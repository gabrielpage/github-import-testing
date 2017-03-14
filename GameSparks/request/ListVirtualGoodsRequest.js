// ====================================================================================================
//
// Cloud Code for ListVirtualGoodsRequest, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("XPUtilities");

var player = Spark.getPlayer();
if (player !== null && player !== undefined){
    UpdateLevelSegment(player);
}