requireOnce("CarInventoryUtilities");
requireOnce("GeneralUtilities");
requireOnce("VersionedDocumentUtilities2");
requireOnce("UpgradePricesUtilities");

function FixUpgradesInProfileForReducedSteps(versionedProfile, fixups) {
    if (fixups.hasFixedUpgradesForReducedLevels) {
        return false;
    }

    var versionedCars = GetVersionedCarsFromProfile(versionedProfile);
    var cars = versionedCars.GetData();
    if (cars !== null && cars !== undefined) {
        for (var i = 0; i < cars.length; ++i) {
            var car = cars[i];

            if (car !== null && car !== undefined) {
                if (car.Status !== null && car.Status !== undefined) {
                    FixUpgradeStatusForReducedSteps(car.Status.CarUpgradeStatus);
                }
            }
        }
    }

    // "sessionState" also contains upgrades, but since we only use these on the client
    // we can simply validate and fix them on download

    fixups.hasFixedUpgradesForReducedLevels = true;

    // need to write back at least the fixup flag
    return true;
}

function FixUpgradeStatusForReducedSteps(carUpgradeStatus) {
    if (carUpgradeStatus === null || carUpgradeStatus === undefined) {
        return;
    }

    if (carUpgradeStatus.PowerLevel > MaxUpgradeLevel) {
        //Warn("carUpgradeStatus.PowerLevel fixing from {0} to {1}", carUpgradeStatus.PowerLevel, MaxUpgradeLevel);
        carUpgradeStatus.PowerLevel = MaxUpgradeLevel;
    }

    if (carUpgradeStatus.WeightLevel > MaxUpgradeLevel) {
        //Warn("carUpgradeStatus.WeightLevel fixing from {0} to {1}", carUpgradeStatus.WeightLevel, MaxUpgradeLevel);
        carUpgradeStatus.WeightLevel = MaxUpgradeLevel;
    }

    if (carUpgradeStatus.HandlingLevel > MaxUpgradeLevel) {
        //Warn("carUpgradeStatus.HandlingLevel fixing from {0} to {1}", carUpgradeStatus.HandlingLevel, MaxUpgradeLevel);
        carUpgradeStatus.HandlingLevel = MaxUpgradeLevel;
    }

    if (carUpgradeStatus.BrakingLevel > MaxUpgradeLevel) {
        //Warn("carUpgradeStatus.BrakingLevel fixing from {0} to {1}", carUpgradeStatus.BrakingLevel, MaxUpgradeLevel);
        carUpgradeStatus.BrakingLevel = MaxUpgradeLevel;
    }
}