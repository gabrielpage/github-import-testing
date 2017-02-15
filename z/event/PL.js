// ====================================================================================================
//
// Cloud Code for PL, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
if(Spark.data.type == "social"){
    process(Spark.getLeaderboards().getSocialLeaderboard(Spark.data.leaderboard));
    Spark.setScriptData("type", "social");
} else if (Spark.data.type == "team") {
    process(Spark.getLeaderboards().getTeamLeaderboard(Spark.data.leaderboard, Spark.data.teamIds));
    Spark.setScriptData("type", "team");
} else {
    process(Spark.getLeaderboards().getLeaderboard(Spark.data.leaderboard));
    Spark.setScriptData("type", "global");
}

function process(leaderboard) {
    var cursor = leaderboard.getEntries();
    var processed = 0;
    Spark.setScriptData("count", "" + leaderboard.getEntryCount());
    while(cursor.hasNext()){
        var entry = cursor.next();
        processed++;
    }
    Spark.setScriptData("processed", "" + processed);    
}