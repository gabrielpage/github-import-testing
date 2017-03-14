// ====================================================================================================
//
// Cloud Code for ServiceLapsW2E, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("ServiceUtilities");
requireOnce("CurrencyUtilities");
requireOnce("PlayerDataUtilities");

ServiceLapsWTEEvent();

function ServiceLapsWTEEvent() {
    var carVariant = Spark.getData().carVariant;
    var carVariantDiscriminator = Spark.getData().carVariantDiscriminator;
    var lapsToAdd = Spark.getData().lapsToAdd;

    var playerId = Spark.getPlayer().getPlayerId();

    if (lapsToAdd > 0) {
        ServiceLapsWTE(carVariant, carVariantDiscriminator, lapsToAdd, playerId);
    }

    ReturnOwnedCarInScriptData(playerId, carVariant, carVariantDiscriminator);
}