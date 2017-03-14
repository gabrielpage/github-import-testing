// ====================================================================================================
//
// Cloud Code for recalculateDealership, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("DealershipManager");

var abTest = Spark.getData().abTest;
var cohort = Spark.getData().cohort;

RecalculateDealershipCachedValues(abTest, cohort);
// Return something so we don't get errors on the client in editor tools
Spark.setScriptData("return", "ok");
//Spark.getLog().info("CALLBACK RecalculateDealershipCacheValues() FINISHED");