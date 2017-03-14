// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ============================================== ======================================================
requireOnce("GeneralUtilities");
requireOnce("MathUtilities");
requireOnce("TimeUtilities");
requireOnce("CollectionUtilities");

// These match the values set in CarUpgrades on the client
const BasePack = 0;
const ProPack = 1;
const HandlingPack = 2;
const PowerPack = 3;

const MaxUpgradeLevel = 2;
const OldMaxUpgradeLevel = 3;

const BaseStageCount = 3;
const ProPackStageCount = 3;
const TuningPackStageCount = 1;

const MinStage = 1;

// Module: UpgradePricesUtilities
// Massages the data in the Mongo tables (including upgradeCostsByClass) for
// return to the client.
var MakeUpgradeDeliveryPackTypeCosts = function(packCosts) {
    var upgradeDeliveryPackTypeCosts = {};

    upgradeDeliveryPackTypeCosts.Times = packCosts.Times;
    upgradeDeliveryPackTypeCosts.SkipCosts = packCosts.SkipCosts;

    return upgradeDeliveryPackTypeCosts;
}

// Module: UpgradePricesUtilities
// Massages the data in the Mongo tables (including upgradeCostsByClass) for
// return to the client.
var MakeUpgradeDeliveryPackCosts = function(packCosts) {
    var upgradeDeliveryPackCosts = {};

    upgradeDeliveryPackCosts.Brakes = MakeUpgradeDeliveryPackTypeCosts(packCosts);
    upgradeDeliveryPackCosts.Weight = MakeUpgradeDeliveryPackTypeCosts(packCosts);
    upgradeDeliveryPackCosts.Handling = MakeUpgradeDeliveryPackTypeCosts(packCosts);
    upgradeDeliveryPackCosts.Power = MakeUpgradeDeliveryPackTypeCosts(packCosts);

    return upgradeDeliveryPackCosts;
}

// Module: UpgradePricesUtilities.
// Massages the data in the Mongo tables (including upgradeCostsByClass) for
// return to the client.
var MakeUpgradeDeliveryCosts = function(classCosts) {
    var upgradeDeliveryCosts = {};

    upgradeDeliveryCosts.Class = classCosts.Class;

    upgradeDeliveryCosts.Base = MakeUpgradeDeliveryPackCosts(classCosts.Base);
    upgradeDeliveryCosts.ProPack = MakeUpgradeDeliveryPackCosts(classCosts.ProPack);
    upgradeDeliveryCosts.TuningPack = MakeUpgradeDeliveryPackCosts(classCosts.TuningPack);

    return upgradeDeliveryCosts;
}

/////////////////////////

// Module: UpgradePricesUtilities
// Massages the data in the Mongo tables (including upgradeCostsByClass) for
// return to the client.
var MakeUpgradePackTypeCosts = function(multiplier, packCosts) {
    var upgradePackTypeCosts = {};

    upgradePackTypeCosts.Costs = packCosts.Upgrades.map(function(cost) {
        return Math.round(RoundToSignificantFigures(cost * multiplier, 3) - 1);
//        return Math.round(cost * multiplier);
//        return Math.round(cost);
    });

    return upgradePackTypeCosts;
}

// Module: UpgradePricesUtilities
// Massages the data in the Mongo tables (including upgradeCostsByClass) for
// return to the client.
var MakeUpgradePackCosts = function(baseMultiplier, attributeMultipliers, packCosts) {
    var upgradePackCosts = {};

    upgradePackCosts.Cost = packCosts.Cost;

    upgradePackCosts.Brakes = MakeUpgradePackTypeCosts(baseMultiplier * attributeMultipliers.BrakesMultiplier,
        packCosts);

    upgradePackCosts.Weight = MakeUpgradePackTypeCosts(baseMultiplier * attributeMultipliers.WeightMultiplier,
        packCosts);

    upgradePackCosts.Handling = MakeUpgradePackTypeCosts(baseMultiplier * attributeMultipliers.HandlingMultiplier,
        packCosts);

    upgradePackCosts.Power = MakeUpgradePackTypeCosts(baseMultiplier * attributeMultipliers.PowerMultiplier,
        packCosts);

    return upgradePackCosts;
}

// Module: UpgradePricesUtilities.
// Massages the data in the Mongo tables (including upgradeCostsByClass) for
// return to the client.
var MakeUpgradeCosts = function(carVariant, baseMultiplier, attributeMultipliers, classCosts) {
    var upgradeCosts = {};

    upgradeCosts.CarVariant = carVariant;

    upgradeCosts.Base = MakeUpgradePackCosts(baseMultiplier, attributeMultipliers, classCosts.Base);
    upgradeCosts.ProPack = MakeUpgradePackCosts(baseMultiplier, attributeMultipliers, classCosts.ProPack);
    upgradeCosts.TuningPack = MakeUpgradePackCosts(baseMultiplier, attributeMultipliers, classCosts.TuningPack);

    return upgradeCosts;
}

function GetCarUpgradeStatsForType(car, upgradeType){
    if (car === null || car === undefined){
        ErrorMessage("GetCarUpgradeStatsForType: car is null/undefined");
        return null;
    }
    if (car.Status === null || car.Status === undefined){
        ErrorMessage("GetCarUpgradeStatsForType: car.Status is null/undefined");
        return null;
    }
    if (car.Status.CarUpgradeStatus === null || car.Status.CarUpgradeStatus === undefined){
        ErrorMessage("GetCarUpgradeStatsForType: car.Status.CarUpgradeStatus is null/undefined");
        return null;
    }
    var packFitted = car.Status.CarUpgradeStatus.PackFitted;
    if (packFitted === null || packFitted === undefined){
        ErrorMessage("GetCarUpgradeStatsForType: PackFitted is null/undefined");
        return null;
    }

    var currentStage = 0;
    var currentLevel = 0;
    switch (upgradeType){
        case "Braking":
            currentStage = car.Status.CarUpgradeStatus.BrakingStage;
            currentLevel = car.Status.CarUpgradeStatus.BrakingLevel;
            break;
        case "Weight":
            currentStage = car.Status.CarUpgradeStatus.WeightStage;
            currentLevel = car.Status.CarUpgradeStatus.WeightLevel;
            break;
        case "Handling":
            currentStage = car.Status.CarUpgradeStatus.HandlingStage;
            currentLevel = car.Status.CarUpgradeStatus.HandlingLevel;
            break;
        case "Power":
            currentStage = car.Status.CarUpgradeStatus.PowerStage;
            currentLevel = car.Status.CarUpgradeStatus.PowerLevel;
            break;
        default:
            ErrorMessage(FormatString("Unrecognised upgrade type {0}", upgradeType));
            return null;
    }
    var stats = {};
    stats.Pack = packFitted;
    stats.Stage = currentStage;
    stats.Level = currentLevel;
    return stats;
}

function GetNextCarUpgradeStatsForType(car, upgradeType){
    var stats = GetCarUpgradeStatsForType(car, upgradeType);
    if (stats === null){
        return null;
    }

    var nextStage = 0;
    var nextLevel = 0;
    if (stats.Level < MaxUpgradeLevel){
        nextStage = stats.Stage;
        nextLevel = stats.Level + 1;
    }
    else{
        var numStages = 0;
        switch (stats.Pack){
            case BasePack:
            case ProPack:
                numStages = 3;
                break;
            case HandlingPack:
            case PowerPack:
                numStages = 1;
                break;
        }

        if (stats.Stage < numStages){
            nextStage = stats.Stage + 1;
            nextLevel = 0;
        }
        else{
            ErrorMessage(FormatString("Can't upgrade from stage: {0}, level: {1} for upgrade {2}", stats.Stage, stats.Level, upgradeType));
            return null;
        }
    }
    var nextStats = {};
    nextStats.Pack = stats.Pack;
    nextStats.Stage = nextStage;
    nextStats.Level = nextLevel;
    return nextStats;
}

function GetDeliveryTimesForClassAndPack(carClass, pack, playerId){
    var collection = GetUpgradeCostsByClassCollection(playerId);
    var carClassInfo = collection.findOne({"Class":carClass});
    if (carClassInfo === null || carClassInfo === undefined){
        ErrorMessage(FormatString("[DeliveryTimes] Couldn't find upgrades cost by class info for class {0}", carClassInfo));
        return null;
    }

    var times = null;
    switch (pack){
        case BasePack:
            times = carClassInfo.Base.Times;
            break;
        case ProPack:
            times = carClassInfo.ProPack.Times;
            break;
        case HandlingPack:
        case PowerPack:
            times = carClassInfo.TuningPack.Times;
            break;
        default:
            ErrorMessage(FormatString("Unrecognised pack index {0}", pack));
            return null;
    }

    return times;
}

function GetDeliveryTimeForNextUpgrade(car, upgradeType, playerId){
    var variantId = car.CarVariantID;
    var carData = GetCarInventoryCollection(playerId).findOne({"CarVariantID":variantId});
    if (carData === null || carData === undefined){
        ErrorMessage(FormatString("Failed to find car {0}", variantId));
        return null;
    }
    var modelData = GetCarModelsCollection(playerId).findOne({"Model":carData.Model});
    if (modelData === null || modelData === undefined){
        ErrorMessage(FormatString("Failed to find car model [{0}]", carData.Model));
        return null;
    }
    var carClass = modelData.ClientData.Class;
    var stats = GetCarUpgradeStatsForType(car, upgradeType);
    if (stats === null){
        ErrorMessage(FormatString("Failed to get the car upgrade stats for upgrade type [{0}]! VariantID: [{1}]", upgradeType, variantId));
        return null;
    }
    var times = GetDeliveryTimesForClassAndPack(carClass, stats.Pack, playerId);
    if (times === null){
        ErrorMessage(FormatString("Failed to get the delivery times for class [{0}] and pack [{1}] for player [{2}]!", carClass, stats.Pack, playerId));
        return null;
    }
    var carRarity = carData.Rarity;
    if (carRarity === null){
        ErrorMessage(FormatString("Failed to get car rarity from car data?!"));
        return null;
    }
    var deliveryMultiplierData = GetDeliverySpeedMultiplierCollection(playerId).findOne({"Rarity": carRarity});
    if (deliveryMultiplierData === null || deliveryMultiplierData === undefined) {
        ErrorMessage(FormatString("Couldn't find an entry in upgradeDeliveryMultipliersByRarity for rarity [{0}]!", carRarity));
        return null;
    }
    var deliveryMultiplier = deliveryMultiplierData.Multiplier;
    if (deliveryMultiplier === null || deliveryMultiplier === undefined) {
        ErrorMessage(FormatString("Failed to get delivery speed multiplier for rarity [{0}]!", carRarity));
        return null;
    }
    var index = ((stats.Stage - 1) * (MaxUpgradeLevel + 1)) + stats.Level;
    var upgradeTime = (times[index] * 60 * 1000) * deliveryMultiplier;
    return Math.floor((upgradeTime + GetNow()) / 1000);
}

function GetUpgradeCostsForClassAndPack(carClass, pack, playerId){
    var collection = GetUpgradeCostsByClassCollection(playerId);
    var carClassInfo = collection.findOne({"Class":carClass});
    if (carClassInfo === null || carClassInfo === undefined){
        ErrorMessage(FormatString("[UpgradeCosts] Couldn't find upgrades cost by class info for class {0}", carClassInfo));
        return null;
    }

    var upgrades = null;
    switch (pack){
        case BasePack:
            upgrades = carClassInfo.Base.Upgrades;
            break;
        case ProPack:
            upgrades = carClassInfo.ProPack.Upgrades;
            break;
        case HandlingPack:
        case PowerPack:
            upgrades = carClassInfo.TuningPack.Upgrades;
            break;
        default:
            ErrorMessage(FormatString("Unrecognised pack index {0}", pack));
            return null;
    }

    return upgrades;
}

function GetUpgradeCostForNextUpgrade(car, upgradeType, playerId){
    var variantId = car.CarVariantID;
    var carData = GetCarInventoryCollection(playerId).findOne({"CarVariantID":variantId});
    if (carData === null || carData === undefined){
        ErrorMessage(FormatString("Failed to find car variant [{0}]", variantId));
        return null;
    }
    var modelData = GetCarModelsCollection(playerId).findOne({"Model":carData.Model});
    if (modelData === null || modelData === undefined){
        ErrorMessage(FormatString("Failed to find car model [{0}]", carData.Model));
        return null;
    }
    var carClass = modelData.ClientData.Class;
    if (carClass === null || carClass === undefined){
        ErrorMessage(FormatString("[{0}] car variant has no \"Class\" field", car.CarVariantID));
        return null;
    }
    var stats = GetCarUpgradeStatsForType(car, upgradeType);
    if (stats === null){
        return null;
    }
    var upgrades = GetUpgradeCostsForClassAndPack(carClass, stats.Pack, playerId);
    if (upgrades === null){
        return null;
    }
    var index = ((stats.Stage - 1) * (MaxUpgradeLevel + 1)) + stats.Level;
    var baseCost = upgrades[index];

    var modelMultiplier = 1;
    var carModel = carData.Model;
    var carModelData = GetCarModelsCollection(playerId).findOne({"Model" : carModel});
    if (carModelData === null || carModelData === undefined){
        ErrorMessage(FormatString("Can't find car with model [{0}]", carModel));
        return null;
    }
    else{
        var modelMultiplier = carModelData.UpgradeCostMultiplier || 1;
        //LogMessage(FormatString("model mult {0}", modelMultiplier));
    }

    var globalMultiplier = 1;
    var upgradeGlobalCosts = GetUpgradeGlobalCostsCollection(playerId).findOne();
    if (upgradeGlobalCosts === null || upgradeGlobalCosts === undefined){
        ErrorMessage("Can't find global upgrade costs data");
        return null;
    }
    else{
        switch (upgradeType){
            case "Braking":
                globalMultiplier = upgradeGlobalCosts.ServerData.BrakesMultiplier;
                break;
            case "Weight":
                globalMultiplier = upgradeGlobalCosts.ServerData.WeightMultiplier;
                break;
            case "Handling":
                globalMultiplier = upgradeGlobalCosts.ServerData.HandlingMultiplier;
                break;
            case "Power":
                globalMultiplier = upgradeGlobalCosts.ServerData.PowerMultiplier;
                break;
            default:
                ErrorMessage(FormatString("Unrecognised upgrade type {0}", upgradeType));
                return null;
        }
        //LogMessage(FormatString("global mult {0}", globalMultiplier));
    }

    var variantMultiplier = 1;
    var carVariantData = GetCarInventoryCollection(playerId).findOne({ "CarVariantID": car.CarVariantID});
    if (carVariantData === null || carVariantData === undefined){
        ErrorMessage(FormatString("Can't find car with variant id {0}", car.CarVariantID));
        return null;
    }
    else{
        variantMultiplier = carVariantData.UpgradeCostMultiplier || 1;
        //LogMessage(FormatString("variant mult {0}", variantMultiplier));
    }

    // LogMessage(FormatString("base cost {0} model mult {1} variant mult {2} global mult {3}",
    //     baseCost, modelMultiplier, variantMultiplier, globalMultiplier));

    var totalMultiplier = variantMultiplier * modelMultiplier * globalMultiplier;

    return Math.round(RoundToSignificantFigures(baseCost * totalMultiplier, 3) - 1);
}

function GetSkipCostsForClassAndPack(carClass, pack, playerId){
    var collection = GetUpgradeCostsByClassCollection(playerId);
    var carClassInfo = collection.findOne({"Class":carClass});
    if (carClassInfo === null || carClassInfo === undefined){
        ErrorMessage(FormatString("[SkipCosts] Couldn't find upgrades cost by class info for class {0}", carClassInfo));
        return null;
    }

    var skipCosts = null;
    switch (pack){
        case BasePack:
            skipCosts = carClassInfo.Base.SkipCosts;
            break;
        case ProPack:
            skipCosts = carClassInfo.ProPack.SkipCosts;
            break;
        case HandlingPack:
        case PowerPack:
            skipCosts = carClassInfo.TuningPack.SkipCosts;
            break;
        default:
            ErrorMessage(FormatString("Unrecognised pack index {0}", pack));
            return null;
    }

    return skipCosts;
}

function GetSkipCostForNextUpgrade(car, upgradeType, playerId){
    var variantId = car.CarVariantID;
    var carData = GetCarInventoryCollection(playerId).findOne({"CarVariantID":variantId});
    if (carData === null || carData === undefined){
        ErrorMessage(FormatString("Failed to find car {0}", variantId));
        return null;
    }
    var modelData = GetCarModelsCollection(playerId).findOne({"Model":carData.Model});
    if (modelData === null || modelData === undefined){
        ErrorMessage(FormatString("Failed to find car model [{0}]", carData.Model));
        return null;
    }
    var carClass = modelData.ClientData.Class;
    var stats = GetCarUpgradeStatsForType(car, upgradeType);
    if (stats === null){
        return null;
    }
    var skipCosts = GetSkipCostsForClassAndPack(carClass, stats.Pack, playerId);
    if (skipCosts === null){
        return null;
    }
    var index = ((stats.Stage - 1) * (MaxUpgradeLevel + 1)) + stats.Level;

    var deliveries = car.Status.CarUpgradeStatusDeliveries;
    var deliveryAt = 0;
    switch (upgradeType){
        case "Braking":
            deliveryAt = deliveries.Braking.DeliveredAt;
            break;
        case "Weight":
            deliveryAt = deliveries.Weight.DeliveredAt;
            break;
        case "Handling":
            deliveryAt = deliveries.Handling.DeliveredAt;
            break;
        case "Power":
            deliveryAt = deliveries.Power.DeliveredAt;
            break;
        default:
            ErrorMessage(FormatString("Unrecognised upgrade type {0}", upgradeType));
            return null;
    }

    var now = GetNow() / 1000;
    var timeRemaining = deliveryAt - now;
    if (timeRemaining <= 60){
        // Free delivery
        return 0;
    }

    return skipCosts[index];
}

function GetPackUpgradeCost(car, packRequested, playerId){
    var variantId = car.CarVariantID;
    var carData = GetCarInventoryCollection(playerId).findOne({"CarVariantID":variantId});
    if (carData === null || carData === undefined){
        ErrorMessage(FormatString("Failed to find car {0}", variantId));
        return null;
    }
    var modelData = GetCarModelsCollection(playerId).findOne({"Model":carData.Model});
    if (modelData === null || modelData === undefined){
        ErrorMessage(FormatString("Failed to find car model [{0}]", carData.Model));
        return null;
    }
    var carClass = modelData.ClientData.Class;
    var collection = GetUpgradeCostsByClassCollection(playerId);
    var carClassInfo = collection.findOne({"Class":carClass});
    if (carClassInfo === null || carClassInfo === undefined){
        ErrorMessage(FormatString("[PackUpgrade] Couldn't find upgrades cost by class info for class {0}", carClassInfo));
        return null;
    }

    switch (packRequested){
        case 1:
            // Pro pack
            return carClassInfo.ProPack.Cost;
        case 2:
        case 3:
            // Tuning pack
            return carClassInfo.TuningPack.Cost;
        default:
            // Unknown
            ErrorMessage(FormatString("Unrecognised pack requested int {0}", packRequested));
            return null;
    }
}
