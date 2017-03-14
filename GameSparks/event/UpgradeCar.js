// ====================================================================================================
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================

requireOnce("CurrencyUtilities");
requireOnce("GameStatsUtilities");
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("TimeUtilities");
requireOnce("UpgradePricesUtilities");

UpgradeCar();

function UpgradeCar(){
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

    // Check if there're any upgrades being delivered. You can't start another delivery while one is in progress.
    var brakesDelivery = car.Status.CarUpgradeStatusDeliveries["Braking"];
    if ((brakesDelivery !== null && brakesDelivery !== undefined) && brakesDelivery.DeliveredAt > (GetNow() / 1000)) {
        ErrorMessage("Can't start another delivery; a Brakes delivery is in progress!");
        return;
    }

    var weightDelivery = car.Status.CarUpgradeStatusDeliveries["Weight"];
    if ((weightDelivery !== null && weightDelivery !== undefined) && weightDelivery.DeliveredAt > (GetNow() / 1000)) {
        ErrorMessage("Can't start another delivery; a Weight delivery is in progress!");
        return;
    }

    var handlingDelivery = car.Status.CarUpgradeStatusDeliveries["Handling"];
    if ((handlingDelivery !== null && handlingDelivery !== undefined) && handlingDelivery.DeliveredAt > (GetNow() / 1000)) {
        ErrorMessage("Can't start another delivery; a Handling delivery is in progress!");
        return;
    }

    var powerDelivery = car.Status.CarUpgradeStatusDeliveries["Power"];
    if ((powerDelivery !== null && powerDelivery !== undefined) && powerDelivery.DeliveredAt > (GetNow() / 1000)) {
        ErrorMessage("Can't start another delivery; a Power delivery is in progress!");
        return;
    }

    var costOnServer = GetUpgradeCostForNextUpgrade(car, upgradeType, playerId);
    if (costOnServer === null){
        ErrorMessage("Failed to calculate upgrade cost");
    }
    else if (costOnClient !== costOnServer){
        // We have a discrepancy here between what the server wants to charge and the client
        // Send a message back saying the new price and whatnot.
        Spark.getLog().warn(FormatString("Cost of upgrade on server is {0} but the client thinks its {1}",
            costOnServer, costOnClient));

        ReturnCorrectCostInScriptData(costOnServer);
    }
    else{
        // Always cash for upgrading
        if (Debit(costOnServer, false, playerId)){
            // LogMessage(FormatString("Cost of upgrade: {0}", costOnServer));
            var deliveryInfo = GetDeliveryInfo(car, upgradeType, playerId);
            if (deliveryInfo === null){
                // Give them their money back if we mess up!
                if (!Credit(costOnServer, false, playerId)) {
                    Spark.getLog().error(FormatString("Uh-oh; failed to refund [${0}] when we failed to upgrade the car of player [{1}]!", costOnServer, playerId));
                }
                ErrorMessage(FormatString("Failed to generate delivery info for upgrade {0}", upgradeType));
                return;
            }

            car.Status.CarUpgradeStatusDeliveries[upgradeType] = deliveryInfo;

            SetPlayerCar(carVariant, carVariantDiscriminator, playerId, car);

            IncrementLifetimeCashSpend(playerId, costOnServer);
        }
    }

    ReturnOwnedCarInScriptData(playerId, carVariant, carVariantDiscriminator);
    AddBalancesToResponse(playerId);
    AddLifetimeSpendToResponse(playerId);

    function GetDeliveryInfo(car, upgradeType, playerId){
        var nextUpgradeStats = GetNextCarUpgradeStatsForType(car, upgradeType);
        var deliveryInfo = {};
        deliveryInfo.Stage = nextUpgradeStats.Stage;
        deliveryInfo.Level = nextUpgradeStats.Level;
        deliveryInfo.Pack = car.Status.CarUpgradeStatus.PackFitted;
        deliveryInfo.DeliveredAt = GetDeliveryTimeForNextUpgrade(car, upgradeType, playerId);
        
        var error = false;
        if (deliveryInfo.Stage === null || deliveryInfo.Stage === undefined) {
            Spark.getLog().error("While generating delivery info, nextUpgradeStats.Stage turned up null/undefined!");
            error = true;
        }

        if (deliveryInfo.Stage === null || deliveryInfo.Stage === undefined) {
            Spark.getLog().error("While generating delivery info, nextUpgradeStats.Level turned up null/undefined!");
            error = true;
        }

        if (deliveryInfo.Stage === null || deliveryInfo.Stage === undefined) {
            Spark.getLog().error("While generating delivery info, car.Status.CarUpgradeStatus.PackFitted turned up null/undefined!");
            error = true;
        }

        if (deliveryInfo.Stage === null || deliveryInfo.Stage === undefined) {
            Spark.getLog().error("While generating delivery info, GetDeliveryTimeForNextUpgrade returned null!");
            error = true;
        }

        if (error) {
            return null;
        }
        else {
            return deliveryInfo;
        }
    }
}