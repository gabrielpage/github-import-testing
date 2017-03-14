// ====================================================================================================
//
// Cloud Code for ADMIN_CapPlayersMoney, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("CurrencyUtilities");

CapPlayersMoney();

function CapPlayersMoney(){
    var threshold = Spark.getData().threshold;
    var amount = Spark.getData().amount;
    var premium = (Spark.getData().premium === "true");

    var cursor = null;
    if (premium){
        cursor = Spark.systemCollection("player").find({"currency2":{"$gte": threshold}}, {"_id": 1});
    }
    else{
        cursor = Spark.systemCollection("player").find({"currency1":{"$gte": threshold}}, {"_id": 1});
    }

    if (cursor === null || cursor === undefined){
        ErrorMessage("Error getting entries from \"player\" collection");
        return;
    }

    if (cursor.count() === 0){
        Spark.setScriptData("result", "There are no players at or above the supplied threshold");
    }
    else {
        Spark.setScriptData("result", FormatString("Found {0} players", cursor.count()));
    }

    while (cursor.hasNext()){
        var playerId = cursor.next()._id.$oid;
        var balance1 = GetBalance(premium, playerId);

        var maxInt = 2147483647; // 2^31 - 1

        while (balance1 > maxInt){
            Debit(maxInt, premium, playerId);
            balance1 = GetBalance(premium, playerId);
        }

        Debit(balance1, premium, playerId);
        Credit(amount, premium, playerId);
    }
}