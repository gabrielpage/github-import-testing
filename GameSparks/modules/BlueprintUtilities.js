// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
requireOnce("CarInventoryUtilities");
requireOnce("CollectionUtilities");
requireOnce("GeneralUtilities");
requireOnce("MathUtilities");

var BlueprintData;
var PieceMarkup;
var ExponentCoefficient;

function LoadBlueprintPurchaseDataCollection(playerId)
{
    // Grab our static numbers from the collection only once per request so we don't keep hitting the database.
    if (BlueprintData === null || BlueprintData === undefined || PieceMarkup === null || PieceMarkup === undefined) {
        var blueprintDataCollection = GetBlueprintPurchaseDataCollection(playerId);
        if (blueprintDataCollection === null || blueprintDataCollection === undefined) {
            Spark.getLog().error(ErrorMessage("The blueprintPurchaseData meta collection doesn't exist!"));
        }
        else {
            BlueprintData = blueprintDataCollection.findOne();
            PieceMarkup = BlueprintData.ServerData.PieceMarkup;
            ExponentCoefficient = BlueprintData.ServerData.ExponentCoefficient;
        }
    }
}

function AddBlueprintPercentageRequiredForPurchaseToResponse(playerId)
{
    LoadBlueprintPurchaseDataCollection(playerId);
    var percentageRequiredForPurchase = BlueprintData.ClientData.PercentageOfBlueprintRequiredToPurchase;
    Spark.setScriptData("blueprintPercentageRequired", percentageRequiredForPurchase);
}

function GetCostToCompleteBlueprint(playerId, variantId, piecesToBuy)
{
    LoadBlueprintPurchaseDataCollection(playerId);
    var variant = GetCarInventoryEntry(variantId, playerId);
    
    var variantMarketPrice = 0;
    if (variant !== null && variant !== undefined) {
        variantMarketPrice = variant.Value.Hard;
    }
    else {
        Spark.getLog().error(FormatString("Couldn't find Variant {0} in the Car Pool when getting blueprint costs?!"));
        return -1;
    }
    
    if (variantMarketPrice <= 0) {
        Spark.getLog().error(FormatString("WTF; Variant {0}'s price is set as {1}G?!", variantId, variantMarketPrice));
        return -1;
    }
    
    var totalPieces = variant.BlueprintPiecesRequired;
    if (totalPieces <= 0) {
        Spark.getLog().warn(FormatString("Player {0} has blueprint pieces for a {1}, but that isn't possible! Was this Variant's CanBeEarnedViaBlueprint flag changed?", playerId, variantId));
        return -1;
    }
    
    var totalCost = 0;
        
    for (i = 1; i <= piecesToBuy; i++) {
        var pieceCost = PieceMarkup * Math.exp(ExponentCoefficient * i / totalPieces) * variantMarketPrice / totalPieces;
        totalCost += pieceCost;
    }
    
    totalCost = RoundToSignificantFigures(totalCost, 2);
    return totalCost;
}