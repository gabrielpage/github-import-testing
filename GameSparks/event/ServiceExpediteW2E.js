// ====================================================================================================
//
// Cloud Code for ServiceExpediteW2E, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("ServiceUtilities");
requireOnce("CurrencyUtilities");
requireOnce("PlayerDataUtilities");

ServiceExpediteWTEEvent();

function ServiceExpediteWTEEvent() {
    var carVariant = Spark.getData().carVariant;
    var carVariantDiscriminator = Spark.getData().carVariantDiscriminator;
    var timeMinutesToExpedite = Spark.getData().time;

    var playerId = Spark.getPlayer().getPlayerId();

    if (timeMinutesToExpedite > 0) {
        ServiceExpediteWTE(carVariant, carVariantDiscriminator, timeMinutesToExpedite, playerId);
    }

    ReturnOwnedCarInScriptData(playerId, carVariant, carVariantDiscriminator);
}