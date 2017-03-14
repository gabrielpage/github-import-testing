requireOnce("CohortUtilities");
requireOnce("GeneralUtilities");

UpdateCohorts();

function UpdateCohorts() {
    var removeCohortsJSON = Spark.getData().remove;
    var updateCohortsJSON = Spark.getData().update;
    //Spark.getLog().info(FormatString("remove JSON: {0}", removeCohortsJSON));
    //Spark.getLog().info(FormatString("update JSON: {0}", updateCohortsJSON));
    var removeCohortsObject = JSON.parse(removeCohortsJSON);
    var updateCohortsObject = JSON.parse(updateCohortsJSON);
    var removeCohorts = removeCohortsObject.remove;
    var updateCohorts = updateCohortsObject.update;
    // Remove cohorts in bulk
    var ok = RemoveABTests(removeCohorts);

    if (!ok) {
        ErrorMessage(FormatString("Failed to RemoveABTests()"));
    }

    // Update the cohorts
    var ok2 = UpdateABTests(updateCohorts);

    if (!ok2) {
        ErrorMessage(FormatString("Failed to UpdateABTests()"));
    }

    if (ok && ok2) {
        // hmm - this is a bit lame - the client (UnityEditor/WebClient) can't seem to work out whether this call
        // succeeded, so we write something (anything) to show we got to the end ok :()
        Spark.setScriptData("ok", true);
    }
}