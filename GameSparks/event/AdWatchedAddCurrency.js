// ====================================================================================================
//
// Cloud Code for AdWatchedAddCurrency, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("CurrencyUtilities");
requireOnce("GeneralUtilities");

AdWatchedAddCurrency();

function AdWatchedAddCurrency(){
    var amount = Spark.getData().amount;
    var premium = JSON.parse(Spark.getData().premium.toLowerCase());
    var playerId = Spark.getPlayer().getPlayerId();

    Credit(amount, premium);

    AddBalancesToResponse(playerId);
}