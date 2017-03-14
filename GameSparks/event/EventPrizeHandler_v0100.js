// ====================================================================================================
//
// Cloud Code for EventPrizeHandler_v0100, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("EventPrizeUtilities");
requireOnce("CurrencyUtilities");
requireOnce("GeneralUtilities");

EventPrizeHandler_v0100();

function EventPrizeHandler_v0100(){
    var playerId = Spark.getPlayer().getPlayerId();

    var prizes = GetUnawardedPrizesAndAwardThem(playerId);
    Spark.setScriptData("prizes", prizes);
    Spark.setScriptData("balance", GetBalance(false, playerId));
}