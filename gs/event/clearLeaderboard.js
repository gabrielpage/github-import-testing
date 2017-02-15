// ====================================================================================================
//
// Cloud Code for clearLeaderboard, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
var leaderboard = Spark.getLeaderboards().getLeaderboard(Spark.data.leaderboard);
var clearRunningTotal = Spark.data.clearRunningTotal === "true";
if(leaderboard){
    if(leaderboard.isPartitioned()){
         var partitions = leaderboard.getPartitions();
         for(var i in partitions){
             partitions[i].drop(clearRunningTotal);
         }
    } else {
        leaderboard.drop(clearRunningTotal);
    }
}