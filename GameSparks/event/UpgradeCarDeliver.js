// ====================================================================================================
//
// Cloud Code for UpgradeCarDeliver, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("CurrencyUtilities");
requireOnce("UpgradePricesUtilities");

UpgradeCarDeliver();

function UpgradeCarDeliver(){
    var carVariant = Spark.getData().carVariant;
    var carVariantDiscriminator = Spark.getData().carVariantDiscriminator;
    var upgradeType = Spark.getData().upgradeType;
    var costOnClient = Spark.getData().expectedPrice;

    var player = Spark.getPlayer();
    var playerId = player.getPlayerId();

    var car = GetPlayerCar(carVariant, carVariantDiscriminator, playerId);
    if (car === null){
        ErrorMessage(FormatString("Couldn't get car with variantId {0} in player's collection", carVariant));
        return;
    }

    var costOnServer = GetSkipCostForNextUpgrade(car, upgradeType, playerId);
    if (costOnServer === null){
        ErrorMessage("Failed to calculate skip delivery cost");
    }
    else if (costOnClient !== costOnServer){
        // We have a discrepancy here between what the server wants to charge and the client
        // Send a message back saying the new price and whatnot.
        var log = FormatString("Cost of delivery on server is {0} but the client thinks its {1}",
            costOnServer, costOnClient);
        //LogMessage(log);
        Spark.getLog().warn(log);

        ReturnCorrectCostInScriptData(costOnServer);
    }
    else{
        if (Debit(costOnServer, true, playerId)){
            // LogMessage(FormatString("Cost of delivery: {0}", costOnServer));
            car.Status.CarUpgradeStatusDeliveries[upgradeType].DeliveredAt = 0;
            // LogMessage(FormatString("Deliver now is successful for upgrade {0}", upgradeType));

            SetPlayerCar(carVariant, carVariantDiscriminator, playerId, car);
        }
        else{
            // LogMessage(FormatString("Don't have enough money to deliver {0} upgrade now", upgradeType));
        }
    }

    ReturnOwnedCarInScriptData(playerId, carVariant, carVariantDiscriminator);
    AddBalancesToResponse(playerId);
}