// ====================================================================================================
//
// Cloud Code for confirmPlayerExistence, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");

ConfirmPlayerExistence();

function ConfirmPlayerExistence(){
    var targetId = Spark.getData().targetId;

    //Spark.getLog().info(targetId);

    var player = Spark.loadPlayer(targetId);
    if (player === null || player === undefined){
        Spark.setScriptData("playerDoesntExist", true);
        return;
    }

    Spark.setScriptData("displayName", player.getDisplayName());
    Spark.setScriptData("playerId", targetId);
}