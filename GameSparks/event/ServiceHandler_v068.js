// ====================================================================================================
//
// Cloud Code for ServiceHandler_v068, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("ServiceUtilities");
requireOnce("CurrencyUtilities");
requireOnce("PlayerDataUtilities");

ServiceHandler_v068();

function ServiceHandler_v068(){
    var messageType = Spark.getData().messageType;
    var variantId = Spark.getData().variantId;
    var carId = Spark.getData().carId;
    var playerId = Spark.getPlayer().getPlayerId();

    switch (messageType){
        case "slowService":
            StartService(variantId, carId, -1, playerId);
            break;
        case "fastService":
            ExpediteService(variantId, carId, -1, playerId);
            break;
        case "updateServicing":
            UpdateServicing(variantId, carId, playerId);
            break;
    }

    AddBalancesToResponse(playerId);
    ReturnOwnedCarInScriptData(playerId, variantId, carId);
}