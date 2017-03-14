// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
require("GeneralUtilities");
require("CohortUtilities");

function GetCarInventoryCollection(playerId) {
    return GetMetaCollection(playerId, "CarInventory");
}

function GetCarModelsCollection(playerId) {
    return GetMetaCollection(playerId, "CarModels");
}

function GetCurrencyCapsCollection(playerId) {
    return GetMetaCollection(playerId, "CurrencyCaps");
}

function GetDealershipPlayerLevelProbabilityCollection(playerId) {
    return GetMetaCollection(playerId, "DealershipPlayerLevelProbability");
}

function GetDealershipSlotProbabilityCollection(playerId) {
    return GetMetaCollection(playerId, "DealershipSlotProbability");
}

function GetProfanityCollection(playerId) {
    return GetMetaCollection(playerId, "Profanity");
}

function GetXPAwardsCollection(playerId) {
    return GetMetaCollection(playerId, "XPAwards");
}

function GetXPValuesCollection(playerId) {
    return GetMetaCollection(playerId, "XPValues");
}

function GetBankBoxPrizesCollection(playerId) {
    return GetMetaCollection(playerId, "bankBoxPrizes");
}

function GetBetDataCollection(playerId) {
    return GetMetaCollection(playerId, "betData");
}

function GetCarSlotCostsCollection(playerId) {
    return GetMetaCollection(playerId, "carSlotCosts");
}

function GetGatchaPrizesCollection(playerId) {
    return GetMetaCollection(playerId, "gatchaPrizes");
}

function GetRaceEventsCollection(playerId) {
    return GetMetaCollection(playerId, "raceEvents");
}

function GetEventInstanceCacheCollection(playerId) {
    return GetMetaCollection(playerId, "eventInstanceCache");
}

function GetServicingGlobalSetupCollection(playerId) {
    return GetMetaCollection(playerId, "servicingGlobalSetup");
}

function GetServicingSetupByClassCollection(playerId) {
    return GetMetaCollection(playerId, "servicingSetupByClass");
}

function GetUpgradeCostsByClassCollection(playerId) {
    return GetMetaCollection(playerId, "upgradeCostsByClass");
}

function GetUpgradeGlobalCostsCollection(playerId) {
    return GetMetaCollection(playerId, "upgradeGlobalCosts");
}

function GetExchangeRatesCollection(playerId) {
    return GetMetaCollection(playerId, "exchangeRates");
}

function GetProfanityCollection(playerId) {
    return GetMetaCollection(playerId, "Profanity");
}

function GetDealershipCalendarCollection(playerId) {
    return GetMetaCollection(playerId, "dealershipCalendar");
}

function GetDealershipCacheCollection(playerId) {
    return GetMetaCollection(playerId, "DealershipCache");
}

function GetEdgeAIUpgradeProbabilitiesCollection(playerId) {
    return GetMetaCollection(playerId, "edgeAIUpgradeProbabilities");
}

function GetBlueprintPurchaseDataCollection(playerId) {
    return GetMetaCollection(playerId, "blueprintPurchaseData");
}

function GetDeliverySpeedMultiplierCollection(playerId) {
    return GetMetaCollection(playerId, "upgradeDeliveryMultipliersByRarity");
}

function GetMetaCollection(playerId, baseCollectionName) {
    var collectionName = GetCollectionName(playerId, baseCollectionName);
    return Spark.metaCollection(collectionName);
}

function GetBranchedCollection(baseCollectionName, abTest, cohort) {
    if (abTest === null || abTest === undefined || abTest === "" ||
        cohort === null || cohort === undefined || cohort === "") {
        return Spark.metaCollection(baseCollectionName);
    }

    var collectionName = baseCollectionName + FormatCohortSuffix(abTest, cohort);
    return Spark.metaCollection(collectionName);
}