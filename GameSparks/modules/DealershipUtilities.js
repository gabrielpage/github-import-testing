// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");

// Module: DealershipUtilities
function GetNumDealershipSlots() {
    return 20;
}

// Module: DealershipUtilities
function GetNumDealershipFTUESlots() {
    return 10;
}

// Module: DealershipUtilities
// Returns a random rarity.
function GetRandomRarity(){
    //var ChanceOfLegendary   = 0.02;
    var ChanceOfLegendary   = 0.00;  // This is only because we don't have any legendary cars at the moment.
                                     // We should revert to the line above once we have them.
    var ChanceOfRare        = 0.30 + ChanceOfLegendary;
    var ChanceOfUncommon    = 0.37 + ChanceOfRare;

    // Roll for rarity. Low rolls are betterer!
    var roll = Math.random();
    if (roll < ChanceOfLegendary)
        return "Legendary";
    else if (roll < ChanceOfRare)
        return "Rare";
    else if (roll < ChanceOfUncommon)
        return "Uncommon";
    else
        return "Common";
}