// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");

function GetDebugSettings(type){
    var collection = Spark.metaCollection("debugSettings");
    var settings = collection.findOne({"Type":type});
    if (settings === null || settings === undefined){
        Spark.getLog().warn(FormatString("Failed to find debug settings of type \"{0}\"", type));
        return null;
    }
    return settings;
}