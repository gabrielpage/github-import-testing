requireOnce("CarInventoryUtilities");
requireOnce("GeneralUtilities");
requireOnce("UpgradePricesUtilities");

function GetNumStages(proPackLevel) {
    if (proPackLevel == HandlingPack || proPackLevel == PowerPack)
        return TuningPackStageCount;

    if (proPackLevel == ProPack)
        return ProPackStageCount;

    return BaseStageCount;
}

/// How many increments from nothing (BasePack + nothing) to fully upgraded (TuningPack + everything) are we?
/// Keen in sync the 2 version of this function: client + server
function GetNumUpgradePips(carUpgradeStatus) {
    var numPips = 0;

    if (carUpgradeStatus.PackFitted == HandlingPack ||
        carUpgradeStatus.PackFitted == PowerPack ||
        carUpgradeStatus.PackFitted == ProPack) {
        // add on pips for base pack
        var numLevelsPerStage = MaxUpgradeLevel + 1;
        var numLevels = GetNumStages(BasePack) * numLevelsPerStage;

        // add on the number of upgrades, which is one less than the numbe of levels
        // * 4 for brakes / weight / handling / power
        numPips += (4 * (numLevels - 1));

        // add one to cater for having no upgrades at all
        numPips += 1;
    }

    if (carUpgradeStatus.PackFitted == HandlingPack ||
        carUpgradeStatus.PackFitted == PowerPack) {
        // for tuning packs add on pips for the pro pack
        var numLevelsPerStage = MaxUpgradeLevel + 1;
        var numLevels = GetNumStages(ProPack) * numLevelsPerStage;

        // add on the number of upgrades, which is one less than the numbe of levels
        // * 4 for brakes / weight / handling / power
        numPips += (4 * (numLevels - 1));

        // add one to cater for having no upgrades at all
        numPips += 1;
    }

    var minStage = MinStage;

    var numPowerUpgradeStages = carUpgradeStatus.PowerStage - minStage;
    var minPowerLevel = carUpgradeStatus.PackFitted == HandlingPack ? MaxUpgradeLevel : 0;
    var numPowerLevels = MaxUpgradeLevel - minPowerLevel + 1;

    numPips += numPowerUpgradeStages * numPowerLevels;
    numPips += (carUpgradeStatus.PowerLevel - minPowerLevel);


    var numWeightUpgradeStages = carUpgradeStatus.WeightStage - minStage;
    var minWeightLevel =  0;
    var numWeightLevels = MaxUpgradeLevel - minWeightLevel + 1;

    numPips += numWeightUpgradeStages * numWeightLevels;
    numPips += (carUpgradeStatus.WeightLevel - minWeightLevel);


    var numHandlingUpgradeStages = carUpgradeStatus.HandlingStage - minStage;
    var minHandlingLevel = carUpgradeStatus.PackFitted == PowerPack ? MaxUpgradeLevel : 0;
    var numHandlingLevels = MaxUpgradeLevel - minHandlingLevel + 1;

    numPips += numHandlingUpgradeStages * numHandlingLevels;
    numPips += (carUpgradeStatus.HandlingLevel - minHandlingLevel);


    var numBrakingUpgradeStages = carUpgradeStatus.BrakingStage - minStage;
    var minBrakingLevel =  0;
    var numBrakingLevels = MaxUpgradeLevel - minBrakingLevel + 1;

    numPips += numBrakingUpgradeStages * numBrakingLevels;
    numPips += (carUpgradeStatus.BrakingLevel - minBrakingLevel);

    if (isNaN(numPips)) {
        ErrorMessage("GetNumUpgradePips() has gone bad and returned a NaN");
        return 0;
    }

    return numPips;
}

// Module: UpgradeUtilities
// Returns the visible class of a player's car.
function GetVisibleClass(playerCar) {
    if (playerCar === null || playerCar === undefined) {
        return null;
    }

    // Grab the inventory item if we don't have it.
    if (playerCar.Item === null || playerCar.Item === undefined) {
	    var item = GetCarInventoryEntry(carPrivateData[i].CarVariantID, playerId);
		delete item._id;
	    playerCar.Item = item;
    }

    var packFitted = playerCar.Status.CarUpgradeStatus.PackFitted;
    var carClass = playerCar.Item.ModelData.Class;

    if (packFitted >= ProPack) {
        if (carClass === "C") {
            return "B";
        }
        if (carClass === "B") {
            return "A";
        }
        return "S";
    }
    else {
        return carClass;
    }
}

