// ====================================================================================================
//
// Cloud Code for UpgradeCarCostsRequest, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("UpgradePricesUtilities");
requireOnce("CollectionUtilities");

var UpgradeCarCostsRequest = function () {
    var carVariant = Spark.getData().carVariant;
    var carClass = Spark.getData().carClass;
    var wantDeliveryCosts = (Spark.getData().wantDeliveryCosts === "True");
    var wantUpgradeCosts = (Spark.getData().wantUpgradeCosts === "True");
    var wantGlobalCosts = (Spark.getData().wantGlobalCosts === "True");

    var playerId = Spark.getPlayer().getPlayerId();
    var upgradeCostsByClass = GetUpgradeCostsByClassCollection(playerId);
    var classCosts = upgradeCostsByClass.findOne({"Class": carClass});

    if (wantDeliveryCosts) {
        var deliveryCosts = MakeUpgradeDeliveryCosts(classCosts);

        Spark.setScriptData("deliveryCosts", deliveryCosts);
    }

    var upgradeGlobalCosts = null;

    if (wantUpgradeCosts || wantGlobalCosts) {
        var upgradeGlobalCostsCollection = GetUpgradeGlobalCostsCollection(playerId);
        upgradeGlobalCosts = upgradeGlobalCostsCollection.findOne();
    }

    if (wantUpgradeCosts) {
        var carVariantData = GetCarInventoryCollection(playerId).findOne({ "CarVariantID": carVariant });

        // LogMessage(FormatString("Variant: {0}", carVariant));

        var variantMultiplier = carVariantData.UpgradeCostMultiplier || 1;

        if (carVariantData.UpgradeCostMultiplier !== undefined) {
            // LogMessage(FormatString("Found variantMultiplier: {0} for variant: {1}",
            //     variantMultiplier,
            //     carVariant));
        }
        else {
            var log = FormatString("Could NOT find variantMultiplier for variant: {0}", carVariant);
		    Spark.getLog().warn(log);
		    // LogMessage(log);
        }

        var modelMultiplier = 1;

        var modelName = carVariantData.Model;
        if (modelName) {
            var carModelData = GetCarModelsCollection(playerId).findOne({"Model" : modelName});

            if (carModelData &&
                carModelData.UpgradeCostMultiplier) {
                modelMultiplier = carModelData.UpgradeCostMultiplier;

                // LogMessage(FormatString("Found modelMultiplier: {0} for model: {1}",
                //     modelMultiplier,
                //     modelName));
            }
            else {
                var log = FormatString("Could NOT find modelMultiplier for model: {0} using {1}",
                    modelName, modelMultiplier);
    		    Spark.getLog().warn(log);
                // LogMessage(log);
            }
        }
        else {
            var log = FormatString("CarVariantData for: {0} does not contain the 'Model' attribute", carVariant);
		    Spark.getLog().warn(log);
		    // LogMessage(log);
        }

        var baseMultiplier = variantMultiplier * modelMultiplier;

        var upgradeCosts = MakeUpgradeCosts(carVariant, baseMultiplier, upgradeGlobalCosts.ServerData, classCosts);

        Spark.setScriptData("upgradeCosts", upgradeCosts);
    }

    if (wantGlobalCosts) {
        Spark.setScriptData("globalCosts", upgradeGlobalCosts.ClientData);
    }
}

UpgradeCarCostsRequest();