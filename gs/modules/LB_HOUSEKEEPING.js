// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

function LeaderboardHousekeeper(){

    this.execute = function(){
       var leaderboards = Spark.getLeaderboards().listLeaderboards();
        for(var i=0 ; i<leaderboards.length ; i++){
            var theLeaderboard = leaderboards[i];
            if(theLeaderboard.isPartitioned()){
                var partitions = theLeaderboard.getPartitions();
                for(var j=0 ; j<partitions.length ; j++){
                    var partition = partitions[j];
                    if(couldBeDeleted(partition.getShortCode())){
                        dropPartitionIfRequired(partition.getShortCode());
                    }
                }    
            } else {
                if(couldBeDeleted(theLeaderboard.getShortCode())){
                    dropPartitionIfRequired(theLeaderboard.getShortCode());
                }
            }
        }
    }
    
    function dropPartitionIfRequired(shortCode){
        var hkCollection = Spark.runtimeCollection("leaderboard-housekeeping");
        var hkDocument = hkCollection.findOne({"_id" : shortCode})
        if(hkDocument && hkDocument.archived){
            var leaderboardPartition = Spark.getLeaderboards().getLeaderboard(shortCode);
            leaderboardPartition.drop(true);
            hkCollection.update({"_id" : shortCode}, {"$set" : {"dropped" : true}})
        } else {
            if(!hkDocument){
                hkCollection.save({"_id" : shortCode})
            }
        }
    }
    
    function couldBeDeleted(lbName){
        if(lbName.indexOf("SCHEDULED.") == -1){
            return false;
        }
        try{    
            var candidateAfterMilliseconds = 432000000;
            var dateString = lbName.substring(lbName.indexOf("SCHEDULED.") + 10).substring(0, 10);
            var dateParts = dateString.split("-");
            var date = new Date();
            date.setFullYear(dateParts[0]);
            date.setMonth(parseInt(dateParts[1])-1);
            date.setDate(dateParts[2])
            var diff = new Date() - date;
            return (diff > candidateAfterMilliseconds);
        }catch(e){}
        return false;
    }
}