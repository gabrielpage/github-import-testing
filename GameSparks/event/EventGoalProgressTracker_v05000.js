// ====================================================================================================
//
// Cloud Code for EventGoalProgressTracker_v05000, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
requireOnce("EventGoalUtilities");

EventGoalProgressTracker_v05000();

function EventGoalProgressTracker_v05000() {
    var eventName = Spark.getData().eventName;
    var trackName = Spark.getData().trackName;
    var lapTime = parseFloat(Spark.getData().lapTime); // string -> float
    var raceTime = parseFloat(Spark.getData().raceTime); // string -> float
    var perfectCorners = Spark.getData().perfectCorners;
    var corners = Spark.getData().corners;
    var opponentRaceTime = parseFloat(Spark.getData().opponentRaceTime); // string -> float
    
    var playerId = Spark.getPlayer().getPlayerId();
    
    var eventGoalProgressData = UpdateEventGoalProgress(playerId, eventName, trackName, lapTime, raceTime, perfectCorners, corners, opponentRaceTime);
    
    AddAchievementsToResponse(playerId);

    Spark.setScriptData("eventGoalProgressData", eventGoalProgressData);
}