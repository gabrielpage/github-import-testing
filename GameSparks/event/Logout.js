// ====================================================================================================
//
// Cloud Code for Logout, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
if (OnPreviewStack()) {
    var tryUserName = Spark.getData().userName;
    var collection = Spark.runtimeCollection("DEBUG_loggedIn");
    
    var user = collection.findOne({"userName": tryUserName});
    if (user !== null && user !== undefined) {
        collection.remove({"userName":tryUserName});
    }
}