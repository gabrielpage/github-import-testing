// ====================================================================================================
//
// Cloud Code for UpgradeCarFit, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("CurrencyUtilities");
requireOnce("UpgradePricesUtilities");
requireOnce("TimeUtilities");
requireOnce("CollectionUtilities");

UpgradeCarFit();

function UpgradeCarFit(){
    var carVariant = Spark.getData().carVariant;
    var carVariantDiscriminator = Spark.getData().carVariantDiscriminator;
    var upgradeType = Spark.getData().upgradeType;

    var player = Spark.getPlayer();
    var playerId = player.getPlayerId();

    var car = GetPlayerCar(carVariant, carVariantDiscriminator, playerId);
    if (car === null){
        ErrorMessage(FormatString("Couldn't get car with variantId {0} in player's collection", carVariant));
        return;
    }

    var deliveryStatus = car.Status.CarUpgradeStatusDeliveries[upgradeType];

    if (deliveryStatus === null || deliveryStatus === undefined){
        ErrorMessage(FormatString("There is no delivery status for upgrade {0}", upgradeType));
    }
    else{
        var upgradeGlobalCosts = GetUpgradeGlobalCostsCollection(playerId).findOne();
        if (upgradeGlobalCosts === null || upgradeGlobalCosts === undefined){
            ErrorMessage("Can't find global upgrade costs data");
        }
        var expediteForFreeMinutes = upgradeGlobalCosts.ClientData.ExpediteFreeMinutesRemaining;
        var now = Math.floor(GetNow() / 1000);
        if (now >= deliveryStatus.DeliveredAt - (expediteForFreeMinutes * 60)){
            // Ready to fit
            switch (upgradeType){
                case "Braking":
                    car.Status.CarUpgradeStatus.BrakingLevel = deliveryStatus.Level;
                    car.Status.CarUpgradeStatus.BrakingStage = deliveryStatus.Stage;
                    break;
                case "Weight":
                    car.Status.CarUpgradeStatus.WeightLevel = deliveryStatus.Level;
                    car.Status.CarUpgradeStatus.WeightStage = deliveryStatus.Stage;
                    break;
                case "Handling":
                    car.Status.CarUpgradeStatus.HandlingLevel = deliveryStatus.Level;
                    car.Status.CarUpgradeStatus.HandlingStage = deliveryStatus.Stage;
                    break;
                case "Power":
                    car.Status.CarUpgradeStatus.PowerLevel = deliveryStatus.Level;
                    car.Status.CarUpgradeStatus.PowerStage = deliveryStatus.Stage;
                    break;
                default:
                    ErrorMessage(FormatString("Unrecognised upgrade type {0}", upgradeType));
                    break;
            }
            car.Status.CarUpgradeStatusDeliveries[upgradeType] = null;

            SetPlayerCar(carVariant, carVariantDiscriminator, playerId, car);
            // LogMessage("Fit successful");
        }
        else{
            // LogMessage(FormatString("Delivery at {0}, currently {1}, remaining wait (including free expedite time) {2}",
            //     UnixTimeToReadableString(deliveryStatus.DeliveredAt),
            //     UnixTimeToReadableString(now),
            //     UnixTimeToReadableString((deliveryStatus.DeliveredAt - (expediteForFreeMinutes * 60)) - now)));
        }
    }

    ReturnOwnedCarInScriptData(playerId, carVariant, carVariantDiscriminator);
}