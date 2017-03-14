// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("FreeBetUtilities");
requireOnce("TimeUtilities");
requireOnce("CollectionUtilities");

// Module: CurrencyUtilities.
function Credit(amount, premium, playerId, obeyCap) {
    var player = null;
    if (playerId !== undefined && playerId !== null){
        player = Spark.loadPlayer(playerId);
    }
    else{
        player = Spark.getPlayer();
        playerId = player.getPlayerId();
    }

    if (player === null || player === undefined){
        ErrorMessage("Attempt to credit with null/undefined player");
        return;
    }

    if (amount < 0 || isNaN(amount) || amount === null || amount === undefined){
        ErrorMessage(FormatString("Invalid amount {0} to credit. Premium? {1}",
            amount, premium));
        return;
    }

    if (obeyCap === undefined || obeyCap === null) {
        obeyCap = true;
    }

    // Make sure the player cannot go above the currency cap
    if (!premium && obeyCap) {
         var caps = GetCurrencyCapsCollection(playerId);

         if (caps !== null && caps !== undefined) {
             var level = GetXPInfo(player).Level;
             var cap = caps.findOne({"Level": level});
             if (cap !== null && cap !== undefined) {
                 var limit = cap.Cap;
                 var balance = player.getBalance1();
                 var cappedAmount = Math.min(amount, limit - balance);

                 if (amount != cappedAmount) {
                    AddCreditCapToResponse();
                 }

                 amount = Math.max(cappedAmount, 0);
             }
         }
    }

    if (premium){
        player.credit2(amount);
    }
    else{
        player.credit1(amount);
    }

    return;
}

// Module: CurrencyUtilities.
function Debit(amount, premium, playerId){
    var success = false;

    var player;
    if (playerId !== undefined && playerId !== null){
        player = Spark.loadPlayer(playerId);
    }
    else{
        player = Spark.getPlayer();
        playerId = player.getPlayerId();
    }

    if (amount < 0 || isNaN(amount) || amount === null || amount === undefined){
        ErrorMessage(FormatString("Invalid amount {0} to debit", amount));
        return false;
    }

    if (premium){
        success = player.debit2(amount);
    }
    else{
        success = player.debit1(amount);
    }

    if (!success){
        var errorMessage = "Not enough currency to debit " + amount + " (current balance on server: " +
            GetBalance(premium, playerId) + ") for " + player.getDisplayName();

        Spark.getLog().warn(errorMessage);
        AddBalancesToResponse(playerId);
    }

    return success;
}

// Module: CurrencyUtilities.
function GetBalance(premium, playerId){
    var player;
    if (playerId !== undefined && playerId !== null){
        player = Spark.loadPlayer(playerId);
    }
    else{
        player = Spark.getPlayer();
        playerId = player.getPlayerId();
    }

    if (premium){
        return player.getBalance2();
    }
    else{
        return player.getBalance1();
    }
}

// Module: CurrencyUtilities.
function ReturnCorrectCostInScriptData(/*int*/ cost) {
    Spark.setScriptData("newPrice", cost);
}

// Module: CurrencyUtilities.
// Checks the player's balance and free bets. If their balance is below a certain threshold and they have no
// free bets of a certain value, credit the player with a free bet of that value to get them out of their
// hole. Returns true if the player really was skint, false otherwise.
function CreditFreeBetIfSkint(playerId){
    var player;
    if (playerId !== undefined && playerId !== null){
        player = Spark.loadPlayer(playerId);
    }
    else{
        player = Spark.getPlayer();
        playerId = player.getPlayerId();
    }

    // TODO: Put these values in a meta collection somewhere.
    var lowBalanceThreshold = 25;
    var freeBetValueToAward = 25;
    var freeBetsToAward = 1;
    var freeBetDurationInMinutes = 120;

    var versionedFreeBets = GetVersionedFreeBets(playerId);
    var allFreeBets = versionedFreeBets.GetData();
    var hasFreeBet = false;

    for (var i = allFreeBets.length - 1; i >= 0; i--) {
        if (allFreeBets[i].Bet === freeBetValueToAward && allFreeBets[i].Quantity > 0 && allFreeBets[i].GSExpiryDate > GetNow()) {
            hasFreeBet = true;
            break;
        }
    }

    if (player.getBalance1() < lowBalanceThreshold && !hasFreeBet){
        var expiryTimestamp = GetNow() + (freeBetDurationInMinutes * 60000);
        AddFreeBet(playerId, freeBetValueToAward, freeBetsToAward, expiryTimestamp);
        return true;
    }
    else{
        return false;
    }
}

// Module: CurrencyUtilities.
function CurrencyError(message, premium, playerId){
    if (playerId === undefined || playerId === null){
        playerId = Spark.getPlayer().getPlayerId();
    }
    ErrorMessage(message);

    Spark.setScriptError("balance1", GetBalance(false, playerId));
    Spark.setScriptError("balance2", GetBalance(true, playerId));
}

// Module: CurrencyUtilities.
// Adds the balances to either ScriptData or ScriptError
function AddBalancesToResponse(playerId, dataObject) {
    var caps = GetCurrencyCapsCollection(playerId);
    var limit = null;

    if (caps !== null && caps !== undefined) {
        var level = GetXPInfo(Spark.loadPlayer(playerId)).Level;
        var cap = caps.findOne({"Level": level});
        if (cap !== null && cap !== undefined) {
            limit = cap.Cap;

        }
    }

    if (dataObject === null || dataObject === undefined){
        if (Spark.hasScriptErrors()) {
            Spark.setScriptError("balance1", GetBalance(false, playerId));
            Spark.setScriptError("balance2", GetBalance(true, playerId));
            if (limit !== null) Spark.setScriptError("currencyLimit", limit);
        }
        else {
            Spark.setScriptData("balance1", GetBalance(false, playerId));
            Spark.setScriptData("balance2", GetBalance(true, playerId));
            if (limit !== null) Spark.setScriptData("currencyLimit", limit);
        }
    }
    else {
        dataObject.balance1 = GetBalance(false, playerId);
        dataObject.balance2 = GetBalance(true, playerId);
        if (limit !== null) dataObject.currencyLimit = limit;
    }
}

function AddCreditCapToResponse(playerId) {
    if (Spark.hasScriptErrors()) {
        Spark.setScriptError("creditcap", true);
    }
    else {
        Spark.setScriptData("creditcap", true);
    }
}