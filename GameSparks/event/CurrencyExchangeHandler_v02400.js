// ====================================================================================================
//
// Cloud Code for CurrencyExchangeHandler_v02400, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("CurrencyExchangeUtilities");
requireOnce("XPUtilities");
requireOnce("CurrencyUtilities");
requireOnce("CollectionUtilities");

CurrencyExchangeHandler(Spark.getData().goldToExchange, Spark.getData().expectedCashReceived);

function CurrencyExchangeHandler(goldToExchange, expectedCashReceived) {
    var player = Spark.getPlayer();
    var playerId = player.getPlayerId();
    var playerLevel = GetXPInfo(player).Level;

    if (goldToExchange > player.getBalance2()) {
        Spark.setScriptData("notEnoughGold", player.getBalance2());
        AddBalancesToResponse(player.getPlayerId());
        return;
    }

    // Take the currency cap into account!
    var currencyCapCollection = GetCurrencyCapsCollection(playerId);
    var currencyCap = currencyCapCollection.findOne({"Level": playerLevel}).Cap;
    var actualCashReceived = CalculateCashRecievedForGold(goldToExchange, playerLevel, playerId);

    // If there's a script error at this point then the conversion's really funky, stench-wise.
    if (Spark.hasScriptErrors()) {
        return;
    }

    var totalCashAfterConversion = actualCashReceived + player.getBalance1();
    var amountExceedingCap = Math.max(0, totalCashAfterConversion - currencyCap);
    actualCashReceived -= amountExceedingCap;

    if (expectedCashReceived !== actualCashReceived) {
        // Player's a CHEAT! (or super-unlucky)
        Spark.setScriptData("actualCashReceived", actualCashReceived);
    }
    else {
        // Everything checks out; do the conversion!
        player.debit2(goldToExchange, "Gold Exchange");
        player.credit1(actualCashReceived, "Gold Exchange");
        AddBalancesToResponse(player.getPlayerId());
    }
}