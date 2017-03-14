// ====================================================================================================
//
// Cloud Code for EventLeaderboardHandlerFromChallengeID, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("RaceEventUtilities");
requireOnce("LeaderboardUtilities");

EventLeaderboardHandlerFromChallengeID();

function EventLeaderboardHandlerFromChallengeID(){
    var player = Spark.getPlayer();
    var playerId = player.getPlayerId();
    var queryType = Spark.getData().queryType;
    var eventName = Spark.getData().eventName;
    var challengeID = Spark.getData().challengeID;
    var count = Spark.getData().count;

    var result = null;
    switch (queryType)
    {
        case "top":
            result = QueryGetEntries(playerId, challengeID, count, 0);
            break;
        case "aroundMe":
            result = QueryGetAroundMeEntries(playerId, challengeID, count);
            break;
    }

    Spark.setScriptData("Entries", result.Entries);
    Spark.setScriptData("TotalCount", result.TotalCount);
}