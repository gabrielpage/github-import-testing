// in test branch
// ====================================================================================================
//
// Cloud Code for addLeaderboardEntries, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
//pretty dumb, but there's no generic way to know how to add entries to a leaderboard
if(Spark.data.leaderboard == "CTL"){
    var leaderboard = Spark.getLeaderboards().getLeaderboard(Spark.data.leaderboard);
    var currentEntryCount = leaderboard.getEntryCount();
    var targetCount = currentEntryCount + parseInt(Spark.data.count);
    var highScore = 1;
    if(currentEntryCount > 0){
        highScore = leaderboard.getEntries(1, currentEntryCount - 1).next().getAttribute("SCORE");
    }
    while(currentEntryCount < targetCount){
        var response = Spark.sendRequest({
                 "@class": ".RegistrationRequest",
                 "userName": "userName"+Spark.data.leaderboard +highScore,
                 "password": "password",
                 "displayName": "displayName"+Spark.data.leaderboard +highScore
            });
        if(response.error != null){
            highScore++;
            continue;
        }
        Spark.sendRequestAs({
                 "@class": ".LogEventRequest",
                 "eventKey": "LBPS",
                 "SCORE": highScore++
            }, response.userId);
        currentEntryCount = leaderboard.getEntryCount();
    }
}
