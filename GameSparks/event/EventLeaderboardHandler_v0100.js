// ====================================================================================================
//
// Cloud Code for EventLeaderboardHandler_v0100, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("RaceEventUtilities");
requireOnce("LeaderboardUtilities");

EventLeaderboardHandler_v0100();

function EventLeaderboardHandler_v0100(){
    var player = Spark.getPlayer();
    var playerId = player.getPlayerId();
    var eventName = Spark.getData().eventName;
    var value = Spark.getData().value;
    // Get the event data
    var eventData = GetMostRecentEventDataFromName(playerId, eventName);
    if (eventData === null){
        // We haven't entered this event yet
        return;
    }
    // Extract the challengeId of the race event
    var isPreviewLeaderboard = false;
    var challengeId = eventData.challengeId;
    if (challengeId === null || challengeId === undefined) {
        challengeId = eventData.previewChallengeId;
        isPreviewLeaderboard = true;
        if (challengeId === null || challengeId === undefined) {
            return;
        }
    }

    var result = null;
    result = QueryGetAroundMeEntries(playerId, challengeId, value);

    if (result !== null && result !== undefined) {
        Spark.setScriptData("Entries", result.Entries);
        Spark.setScriptData("TotalCount", result.TotalCount);
    }
    Spark.setScriptData("PreviewLeaderboard", isPreviewLeaderboard);
}