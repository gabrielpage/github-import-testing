// ====================================================================================================
//
// Cloud Code for copyToCohort, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("CohortUtilities");

CopyToCohort();

function CopyToCohort() {
    if (!OnPreviewStack()) {
        return;
    }

    var fromABTest = Spark.getData().fromABTest;
    var fromCohort = Spark.getData().fromCohort;
    var toABTest = Spark.getData().toABTest;
    var toCohort = Spark.getData().toCohort;
    var baseDataCollection = Spark.getData().dataCollection;

    var ok = CopyToCohortWorker(baseDataCollection);

    if (ok) {
        Spark.setScriptData("SUCCESS", "Copy completed");
    }

    function CopyToCohortWorker(dataCollection) {
        var copyFrom = dataCollection;
        var copyTo = dataCollection;
        if (fromABTest !== "Base") {
            copyFrom += FormatCohortSuffix(fromABTest, fromCohort);
        }
        if (toABTest !== "Base") {
            copyTo += FormatCohortSuffix(toABTest, toCohort);
        }

        var copyFromCollection = Spark.metaCollection(copyFrom);
        if (copyFromCollection === null || copyFromCollection === undefined) {
            Spark.setScriptError("ERROR", FormatString("There is no {0} meta collection", copyFrom));
            return false;
        }

        Spark.getLog().info(FormatString("{0} -> {1}", copyFrom, copyTo));

        var copyToCollection = Spark.metaCollection(copyTo);
        // Shouldn't need to worry about copyToCollection being null/undefined as meta collections
        // act the same as runtime collections on the preview servers, so it will be
        // automatically created when we insert the data
        var cursor = copyFromCollection.find();
        copyToCollection.remove({});
        // I don't think there is a way to do this in bulk :/
        while (cursor.hasNext()) {
            var entry = cursor.next();
            copyToCollection.insert(entry);
        }

        // Now add the collection to the cohort map
        var ok = true;
        if (toABTest !== "Base") {
            ok = AddCollectionToABTest(toABTest, dataCollection);
            // Special case 2-for-1 branching
            if (dataCollection === "CarInventory") {
                ok = AddCollectionToABTest(toABTest, "DealershipCache");
            }
        }

        if (!ok) {
            ErrorMessage(FormatString("AddCollectionToABTest() failed"));
        }

        return ok;
    }
}