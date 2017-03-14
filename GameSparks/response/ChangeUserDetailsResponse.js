// ====================================================================================================
//
// Cloud Code for ChangeUserDetailsResponse, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
requireOnce("PlayerDataUtilities");
var displayName = Spark.getScriptData("displayName");
ChangeDisplayName(displayName, Spark.getPlayer().getPlayerId());