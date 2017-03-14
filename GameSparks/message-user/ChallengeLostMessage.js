// ====================================================================================================
//
// Cloud Code for ChallengeLostMessage, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("EventPrizeUtilities");

ChallengeLostMessage();

function ChallengeLostMessage()
{
    var challengeName = Spark.getData().challenge.challengeName;
    var playerId = Spark.getPlayer().getPlayerId();
    var challengeId = Spark.getData().challenge.challengeId;
    CheckIfPlayerWonTopDownPrizeForChallenge(playerId, challengeName, challengeId);
}