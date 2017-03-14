// ====================================================================================================
//
// Cloud Code for PurchaseVirtualGood_v066, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("CurrencyUtilities");

CurrencyHandler_v066();

function CurrencyHandler_v066() {
    var messageType = Spark.getData().messageType;
    var amount = Spark.getData().amount;
    var premium = JSON.parse(Spark.getData().premium.toLowerCase());
    var playerId = Spark.getPlayer().getPlayerId();

    switch (messageType){
        case "debit":
            Debit(amount, premium);
            break;
        case "cappedcredit":
            if (!CanAllowDebugEvents(messageType)) {
                return;
            }

            Credit(amount, premium, playerId, true);
            break;
        case "credit":
            if (!CanAllowDebugEvents(messageType)) {
                return;
            }

            Credit(amount, premium, playerId, false);
            break;
        case "balance":
            break;
        case "skint":
            Spark.setScriptData("wasSkint", CreditFreeBetIfSkint());
            break;
    }

    AddBalancesToResponse(playerId);
}