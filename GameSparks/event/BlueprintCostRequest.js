// ====================================================================================================
//
// Cloud Code for BlueprintCostRequest, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
requireOnce("BlueprintUtilities");
requireOnce("GeneralUtilities");

BlueprintCostRequest();

function BlueprintCostRequest() {
    var playerId = Spark.getPlayer().getPlayerId();
    
    // The client sends a dictionary like: { variantId: piecesRequired }.
    // We need to go through them, grab a few bits of data and calculate the cost to complete its Blueprint.
    var variantList = Spark.getData().variants;
    var responseData = [];
    
    for (var variantId in variantList) {
        var piecesToBuy = variantList[variantId];
        var totalCost = GetCostToCompleteBlueprint(playerId, variantId, piecesToBuy);
        responseData.push({"VariantID": variantId, "PiecesRequired": piecesToBuy, "Cost": totalCost});
    }
    
    Spark.setScriptData("blueprintCosts", responseData);
}