// ====================================================================================================
//
// Cloud Code for UpgradeCarWatchedAd, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("UpgradePricesUtilities");

UpgradeCarWatchedAd();

function UpgradeCarWatchedAd() {
    var carVariant = Spark.getData().carVariant;
    var carVariantDiscriminator = Spark.getData().carVariantDiscriminator;
    var upgradeType = Spark.getData().upgradeType;
    var adSkipMinutes = Spark.getData().adSkipMinutes;

    var player = Spark.getPlayer();
    var playerId = player.getPlayerId();

    var adSkipMinutesWarnLimit = 15;
    if (adSkipMinutes > adSkipMinutesWarnLimit) {
        Spark.getLog().warn(FormatString("Client is giving Ad Watch reward of delivery skip minutes > {0}: {1}",
            adSkipMinutesWarnLimit,
            adSkipMinutes));
    }

    var car = GetPlayerCar(carVariant, carVariantDiscriminator, playerId);
    if (car === null) {
        ErrorMessage(FormatString("Couldn't get car with variantId:discriminator {0:1} in player's collection",
            carVariant,
            carVariantDiscriminator));
        return;
    }

    var deliveryStatus = car.Status.CarUpgradeStatusDeliveries[upgradeType];

    if (deliveryStatus === null || deliveryStatus === undefined) {
        ErrorMessage(FormatString("There is no delivery status for upgrade {0}", upgradeType));
    }
    else {
        if (deliveryStatus.DeliveredAt >= (adSkipMinutes * 60)) {
            deliveryStatus.DeliveredAt = deliveryStatus.DeliveredAt - (adSkipMinutes * 60);

            SetPlayerCar(carVariant, carVariantDiscriminator, playerId, car);
        }
    }

    ReturnOwnedCarInScriptData(playerId, carVariant, carVariantDiscriminator);
}