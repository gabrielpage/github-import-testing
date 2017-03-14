// ====================================================================================================
//
// Cloud Code for BlueprintPurchaseRequest, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
requireOnce("BlueprintUtilities");
requireOnce("CarInventoryUtilities");
requireOnce("CurrencyUtilities");
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("VersionedDocumentUtilities2");

BlueprintPurchaseRequest();

function BlueprintPurchaseRequest()
{
    var playerId = Spark.getPlayer().getPlayerId();
    var variantId = Spark.getData().variantId;
    var expectedPrice = Spark.getData().expectedPrice;
    
    var versionedProfile = MakeVersionedProfileDocument(playerId);
    var versionedBlueprints = versionedProfile.GetVersionedKey("blueprints", null);
    
    // Check if the player actually has this Blueprint.
    var blueprintData = versionedBlueprints.GetData();
    var blueprintIndex = -1;
    var piecesToBuy = -1;
    for (var i = 0; i < blueprintData.length; i++) {
        var blueprint = blueprintData[i];
        if (blueprint.CarVariant.CarVariantID === variantId) {
            blueprintIndex = i;
            piecesToBuy = blueprint.PiecesRequired - blueprint.Pieces;
            break;
        }
    }
    
    if (blueprintIndex === -1) {
        ErrorMessage(FormatString("The player doesn't own a blueprint for the Variant '{0}'!", variantId));
        return;
    }
    
    var actualPrice = GetCostToCompleteBlueprint(playerId, variantId, piecesToBuy);
    
    // We need to add a BONUS cost if the player needs a slot.
    var playerCarCount = GetAllPlayerCarsNoInventoryItems(playerId).length;
    var playerSlotCount = GetPlayerCarSlotsCount(playerId);
    var playerRequiresSlot = (playerCarCount >= playerSlotCount);
    
    if (playerRequiresSlot) {
        actualPrice += GetCostOfSlot(playerSlotCount + 1, playerId);
    }
    
    // Now compare it with the expected price.
    if (actualPrice !== expectedPrice) {
        // Player's hacking! Or the price changed as they were playing.
        Spark.setScriptData("newPrice", actualPrice);
    }
    else if (Debit(actualPrice, true, playerId)) {
        // Money's been debited OK, add the stuff!
        var successfullyWritten = false;
        while (!successfullyWritten) {
            // Take out all pieces of the purchased blueprint.
            var blueprintToRemove = blueprintData[blueprintIndex];
            blueprintToRemove.Pieces = 0;
            blueprintToRemove.TimesWon += 1;
            
            // Add a slot if needed.
            if (playerRequiresSlot) {
                AdjustPlayerCarSlotsInProfile(versionedProfile, 1, playerId);
            }
            
            successfullyWritten = versionedProfile.Save();
        }
        
        if (!AddNewCarToInventory(variantId, playerId, 100, false)) {
            Spark.getLog().error(FormatString("UM. HELP. I failed to give the Variant '{0}' to player {1} after they purchased the blueprint!", variantId, playerId));
        }
        
        // Return data to the client.
        BlueprintPieces(playerId);
        ReturnOwnedCarsInScriptData(playerId);
        AddBalancesToResponse(playerId);
        if (playerRequiresSlot) {
            OwnerCarSlots(playerId);
        }
    }
    else {
        // "No dough, no go, bro. No money, honey. You're $X short. Gotta earn it. Go do it already."
        var currentBalance = GetBalance(true, playerId);
        Spark.getLog().warn(FormatString("Not enough gold to complete the {0} blueprint! (costs {1}, but the player only has {2})", variantId, expectedPrice, currentBalance));
    }
}