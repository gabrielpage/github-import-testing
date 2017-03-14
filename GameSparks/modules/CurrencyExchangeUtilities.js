// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("CollectionUtilities");

// Module: CurrencyExchangeUtilities.
// Returns the gold-to-cash conversion rate for the given level.
function GetExchangeRateForLevel(level, playerId) {
    return GetExchangeRatesCollection(playerId).findOne().ExchangeRatesByLevel[level - 1];
}

// Module: CurrencyExchangeUtilities.
// Returns the amount of cash a player will receive if they convert a given amount of
// gold to cash at the specified level.
function CalculateCashRecievedForGold(goldToExchange, level, playerId) {
    var exchangeRate = GetExchangeRateForLevel(level, playerId);
    if (exchangeRate <= 0) { // Shouldn't really happen, but...
        ErrorMessage(FormatString("ARG; exchanging {0}G at Level {1} is going to give ${2}?!", goldToExchange, level, goldToExchange * exchangeRate));
    }
    return goldToExchange * exchangeRate;
}