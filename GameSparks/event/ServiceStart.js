// ====================================================================================================
//
// Cloud Code for ServiceStart, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("ServiceUtilities");
requireOnce("CurrencyUtilities");
requireOnce("PlayerDataUtilities");

ServiceStart();

function ServiceStart() {
    var carVariant = Spark.getData().carVariant;
    var carVariantDiscriminator = Spark.getData().carVariantDiscriminator;
    var expectedPrice = Spark.getData().expectedPrice;

    if (expectedPrice < 0) {
        // We pass -1 to StartService for the old code path of "I don't know the price".
        // Do *not* allow the client to do this
        expectedPrice = 0;
    }

    var playerId = Spark.getPlayer().getPlayerId();

    StartService(carVariant, carVariantDiscriminator, expectedPrice, playerId);

    AddBalancesToResponse(playerId);
    ReturnOwnedCarInScriptData(playerId, carVariant, carVariantDiscriminator);
}