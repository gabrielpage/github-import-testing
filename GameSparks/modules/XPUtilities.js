// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("CurrencyExchangeUtilities");
requireOnce("CollectionUtilities");

// Module: XPUtilities.
// Increases a player's XP by the value of a given action.
function AddXP(player, xpAction) {
    var xpAwardsCollection = GetXPAwardsCollection(player.getPlayerId());
    var xpValueDoc = xpAwardsCollection.findOne({"Action": xpAction})
    if (xpValueDoc === null || xpValueDoc === undefined) {
        Spark.getLog().error("AddXP_v01002: Can't find a document in the XPAwards meta collection with an Action of " + xpAction + "!")
        return;
    }
    if (xpValueDoc.Value == null || xpValueDoc === undefined) {
        Spark.getLog().error("AddXP_v01002: The document with the action " + xpAction + " in the XPAwards meta collection has an undefined \"Value\" field!")
        return;
    }

    var levelBefore = GetLevelUsingTotalXP(player.getBalance6(), player.getPlayerId());
    var levelAfter = GetLevelUsingTotalXP(player.getBalance6() + xpValueDoc.Value, player.getPlayerId());

    player.credit6(xpValueDoc.Value);
    UpdateLevelSegment(player);
    SendXPMessage(player);
}

// Module: XPUtilities.
// Increases a player's XP by a specific amount.
function AddXPAmount(player, value) {
    var levelBefore = GetLevelUsingTotalXP(player.getBalance6(), player.getPlayerId());
    var levelAfter = GetLevelUsingTotalXP(player.getBalance6() + value, player.getPlayerId());

    player.credit6(value);
    UpdateLevelSegment(player);
    SendXPMessage(player);
}

// Module: XPUtilities.
// Updates the player's Level segment value, which is used to determine virtual goods reward quantities (IAPs).
function UpdateLevelSegment(player) {
    var xpLevel = GetLevelUsingTotalXP(player.getBalance6(), player.getPlayerId());

    // Dont use segment yet until GS supports numeric segments
    //Spark.getPlayer().setSegmentValue("Level", xpLevel);

    // Set number of Level virtual goods owned
    var vgLevel = player.hasVGood("Level");
    player.addVGood("Level", xpLevel-vgLevel);
}

// Module: XPUtilities.
// Sends an XPMessage to the designated player containing their most up-to-date XP information.
function SendXPMessage(player) {
    var xpInfo = GetXPInfo(player);

    var xpMessage = Spark.message("XPMessage").setPlayerIds(player.getPlayerId());
    var messageData = {
        "TotalXP": xpInfo.TotalXP,
        "Level": xpInfo.Level,
        "InitialXPThisLevel": xpInfo.InitialXPThisLevel,
        "TotalXPForNextLevel": xpInfo.TotalXPForNextLevel
    };

    messageData["exchangeRate"] = GetExchangeRateForLevel(xpInfo.Level, player.getPlayerId());

    xpMessage.setMessageData(messageData);
    xpMessage.send();
}

// Module: XPUtilities.
// Adds the XP to ScriptData
function AddXPToResponse(playerId) {
    var player = Spark.loadPlayer(playerId);

    var xpInfo = GetXPInfo(player);

    Spark.setScriptData("TotalXP", xpInfo.TotalXP);
    Spark.setScriptData("Level", xpInfo.Level);
    Spark.setScriptData("InitialXPThisLevel", xpInfo.InitialXPThisLevel);
    Spark.setScriptData("TotalXPForNextLevel", xpInfo.TotalXPForNextLevel);
    Spark.setScriptData("exchangeRate", GetExchangeRateForLevel(xpInfo.Level, playerId));
}

// Module: XPUtilities.
// Returns the given player's total XP, Level, and the lower and upper XP boundaries for that Level.
function GetXPInfo(player) {
    var playerTotalXP = player.getBalance6();
    var playerLevel = GetLevelUsingTotalXP(playerTotalXP, player.getPlayerId())
    var initialXPThisLevel = TotalXPForNextLevel(playerLevel-1, player.getPlayerId());
    var totalXPForNextLevel = TotalXPForNextLevel(playerLevel, player.getPlayerId());

    return {TotalXP: playerTotalXP, Level: playerLevel, InitialXPThisLevel: initialXPThisLevel, TotalXPForNextLevel: totalXPForNextLevel};
}

// Module: XPUtilities.
// Using a given Level and Total XP, this calculates the REMAINING XP required to level up.
function XPToEarnForNextLevel(level, totalXP, playerId) {
    return TotalXPForNextLevel(level, playerId) - totalXP;
}

// Module: XPUtilities.
// Using a given Level, this finds the TOTAL XP required to achieve the next Level. If max level, this returns 0.
function TotalXPForNextLevel(level, playerId) {
    var xpValuesCollection = GetXPValuesCollection(playerId);
    var xpValueArray = xpValuesCollection.find().next().TotalXPForLevel;

    if (level >= xpValueArray.length) {
        return 0;
    }
    else {
        return xpValueArray[Math.max(0, level)];
    }
}

// Module: XPUtilities.
// This finds the Level a player would be using a given TOTAL XP value.
function GetLevelUsingTotalXP(totalXP, playerId) {
    var xpValuesCollection = GetXPValuesCollection(playerId);
    var xpValueArray = xpValuesCollection.find().next().TotalXPForLevel;

    // If our XP exceeds all the values in the array, just return the max level.
    if (totalXP >= xpValueArray[xpValueArray.length - 1]) {
        return xpValueArray.length;
    }

    // cool beans, javascript arrays don't have a fucking find or findindex function
    for (var i = 0; i < xpValueArray.length; i++) {
        if (xpValueArray[i] > totalXP) {
            return i;
        }
    }

    // We shouldn't get here, but if we do...
    return 1;
}

// Module: XPUtilities.
// This finds the total XP required for the player to be the given Level.
function GetTotalXPForLevel(level, playerId) {
    if (level <= 1) {
        return 0;
    }

    var xpValuesCollection = GetXPValuesCollection(playerId);
    var xpValueArray = xpValuesCollection.find().next().TotalXPForLevel;
    return xpValueArray[Math.min(49, Math.max(0, level - 1))];
}