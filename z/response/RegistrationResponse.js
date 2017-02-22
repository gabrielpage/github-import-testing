// ====================================================================================================
//
// Cloud Code for RegistrationResponse, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

var playerResult = Spark.systemCollection("player").findOne({"userName" : "u"}, {"_id" : 1});

if(playerResult){
    var playerId = playerResult._id.$oid;
    Spark.setScriptData(playerId, playerId)
}