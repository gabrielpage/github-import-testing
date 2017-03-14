// ====================================================================================================
//
// Cloud Code for FreeBetRedemptionHandler, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("FreeBetUtilities");
requireOnce("TimeUtilities");

FreeBetRedemptionHandler();

function FreeBetRedemptionHandler() {
    var player = Spark.getPlayer();
    var playerId = player.getPlayerId();
    var betAmount = Spark.getData().betAmount;
    var messageType = Spark.getData().messageType;

    switch (messageType) {
        case "reserve":
            var reservationResponse = ReserveFreeBet(playerId, betAmount);
            if (reservationResponse !== null) {
                Spark.setScriptData("freeBetData", reservationResponse.freeBetsArray);
                Spark.setScriptData("reserved", reservationResponse.hasReservedFreeBet);
            }
            break;
        case "redeem":
            var redemptionResponse = RedeemFreeBet(playerId, betAmount);
            if (redemptionResponse !== null) {
                Spark.setScriptData("freeBetData", redemptionResponse.freeBetsArray);
                Spark.setScriptData("redeemed", redemptionResponse.hasRedeemedFreeBet);
            }
            break;
        case "refund":
            var refundResponse = RefundFreeBet(playerId, betAmount);
            if (refundResponse !== null) {
                Spark.setScriptData("freeBetData", refundResponse);
            }
            break;
        case "get":
            FreeBets(playerId);
            break;
        case "increase":
            var expiryTimestamp = GetNow() + (60 * 60 * 1000); // Expiry time is 1 hour
            AddFreeBet(playerId, betAmount, 1, expiryTimestamp);
            FreeBets(playerId);
            break;
        case "decrease":
            RemoveFreeBet(playerId, betAmount, 1);
            FreeBets(playerId);
            break;
    }
}