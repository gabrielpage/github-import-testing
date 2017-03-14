// ====================================================================================================
//
// Cloud Code for CreateChallengeResponse, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

var ourID = Spark.getPlayer().getPlayerId();
Spark.setScriptData("ourID", ourID);
Spark.setScriptData("challengeID", Spark.getData().challengeInstanceId);