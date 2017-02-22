// ====================================================================================================
//
// Cloud Code for AuthenticationResponse, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

var player = Spark.getPlayer();

if(player){
    require("PlayerUtils");
    resetPeepoTimes(player);
}