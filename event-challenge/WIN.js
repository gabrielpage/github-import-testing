// ==================================================
//
// Write your Javascript Cloud Code script here.
//
// For details of the GameSparks Cloud Code API see:
// https://portal.gamesparks.net/docs.htm			
//
// ==================================================
var challenge = Spark.getChallenge(Spark.data.challengeInstanceId);
var playerId = challenge.getAcceptedPlayerIds()[0];
var player = Spark.loadPlayer(playerId);
challenge.winChallenge(player);