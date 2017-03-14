/// ====================================================================================================
//
// Cloud Code for GS_GAME_PUBLISH, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("DealershipManager");
requireOnce("GeneralUtilities");
requireOnce("ObjectUtilities");

if (!OnPreviewStack()) {
    Spark.getLog().info("GAME PUBLISHED STARTED");
}

function RemoveIndexIfPresent(tableName, keysToIndex, removeUnique, isRuntimeCollection) {
    if (isRuntimeCollection) {
        var collection = Spark.runtimeCollection(tableName);
    }
    else {
        var collection = Spark.metaCollection(tableName);
    }

    var indexes = collection.getIndexInfo();

    var expectedKey = {};

    for (var i = 0; i < keysToIndex.length; ++i) {
        var keyToIndex = keysToIndex[i];
        expectedKey[keyToIndex] = 1;
    }

    for (var i = 0; i < indexes.length; ++i) {
        var index = indexes[i];

        if (DeepCompare(index.key, expectedKey)) {
            if ((removeUnique && index.unique) ||
                (!removeUnique && !index.unique)) {

                Spark.getLog().info(FormatString("Dropping index for {0} in table: {1}, unique? {2}",
                    keyToIndex, tableName, index.unique));

                collection.dropIndexByName(index.name);
            }
        }
    }
}

function AddUniqueIndexIfMissing(tableName, keysToIndex, isRuntimeCollection) {
    RemoveIndexIfPresent(tableName, keysToIndex, false, isRuntimeCollection);

    if (isRuntimeCollection) {
        var collection = Spark.runtimeCollection(tableName);
    }
    else {
        var collection = Spark.metaCollection(tableName);
    }

    var indexes = collection.getIndexInfo();

    var expectedKey = {};

    for (var i = 0; i < keysToIndex.length; ++i) {
        var keyToIndex = keysToIndex[i];
        expectedKey[keyToIndex] = 1;
    }

    //Spark.getLog().info(FormatString("{0}", JSON.stringify(expectedKey)));

    for (var i = 0; i < indexes.length; ++i) {
        var index = indexes[i];

        if (DeepCompare(index.key, expectedKey) &&
            index.unique === true) {
            return;
        }
    }

    Spark.getLog().info(FormatString("Creating index for {0} in table: {1}", JSON.stringify(keysToIndex), tableName));

    collection.ensureIndex(expectedKey, {"unique" : true})
}

// RemoveIndexIfPresent("CarInventory", ["CarVariantID"], true);
// RemoveIndexIfPresent("CarModels", ["Model"], true);
// RemoveIndexIfPresent("raceEvents", ["EventName"], true);

var runtimeCollection = true;
var metaCollection = false;
AddUniqueIndexIfMissing("ABTests", ["Name"], metaCollection);
AddUniqueIndexIfMissing("ABTestsRuntimeData", ["Name"], runtimeCollection);
AddUniqueIndexIfMissing("CarInventory", ["CarVariantID"], metaCollection);
AddUniqueIndexIfMissing("CarModels", ["Model"], metaCollection);
AddUniqueIndexIfMissing("CurrencyCaps", ["Level"], metaCollection);
AddUniqueIndexIfMissing("XPAwards", ["Action"], metaCollection);
AddUniqueIndexIfMissing("bankBoxPrizes", ["BoxType"], metaCollection);
AddUniqueIndexIfMissing("betData", ["BetAmount"], metaCollection);
AddUniqueIndexIfMissing("raceEvents", ["EventName"], metaCollection);
AddUniqueIndexIfMissing("servicingSetupByClass", ["Class"], metaCollection);
AddUniqueIndexIfMissing("upgradeCostsByClass", ["Class"], metaCollection);
AddUniqueIndexIfMissing("DealershipCache", ["Key"], metaCollection);
AddUniqueIndexIfMissing("edgeAIUpgradeProbabilities", ["Class", "Pips"], metaCollection);
AddUniqueIndexIfMissing("upgradeDeliveryMultipliersByRarity", ["Rarity"], metaCollection);


if (!OnPreviewStack()) {
    Spark.getLog().info("GAME PUBLISHED FINISHED");
}