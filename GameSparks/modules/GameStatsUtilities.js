// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("VersionedDocumentUtilities");

function GetDefaultGameStats() {
    var stats = {};
    stats.lifetimeWinnings = 0;
    stats.lifetimeSpend = 0;
    stats.lifetimeEvents = 0;
    stats.lifetimeRaceWins = 0;
    stats.lifetimeRaces = 0;
    stats.lifetimeBottomUpGoals = 0;
    stats.lifetimeTopDownGoals = 0;
    return stats;
}

// Module: GameStatsUtilities
function GetVersionedGameStats(playerId){
    return MakeVersionedProfile(playerId, "gameStats", GetDefaultGameStats());
}

function GetVersionedGameStatsFromProfile(versionedProfile) {
    return versionedProfile.GetVersionedKey("gameStats", GetDefaultGameStats());
}

// Module: GameStatsUtilities
function GetGameStats(playerId){
    var versionedProfile = GetVersionedGameStats(playerId);

    var data = versionedProfile.GetData();

    return data;
}

// Module: GameStatsUtilities
// Returns a player's lifetime win rate as a value between 0 and 1.
function GetLifetimeWinRate(playerId){
    var gameStats = GetGameStats(playerId);

    var races = gameStats.lifetimeRaces;
    var wins = gameStats.lifetimeRaceWins;

    if (races === null || races === undefined || isNaN(races)){
        ErrorMessage("lifetimeRaces Game Stat is invalid");
        return -1;
    }

    if (wins === null || wins === undefined || isNaN(wins)){
        ErrorMessage("lifetimeRaceWins Game Stat is invalid");
        return -1;
    }

    if (races === 0){
        return 0;
    }
    else {
        return (wins / races);
    }
}

// Module: GameStatsUtilities
// Returns a player's lifetime winnings.
function GetLifetimeWinnings(playerId){
    var gameStats = GetGameStats(playerId);
    var winnings = gameStats.lifetimeWinnings;

    if (winnings === null || winnings === undefined || isNaN(winnings)){
        return 0;
    }

    return winnings;
}

// Module: GameStatsUtilities
// Returns a player's lifetime spend.
function GetLifetimeSpend(playerId){
    var gameStats = GetGameStats(playerId);
    var expenditure = gameStats.lifetimeSpend;

    if (expenditure === null || expenditure === undefined || isNaN(expenditure)){
        return 0;
    }

    return expenditure;
}

// Module: GameStatsUtilities
// Returns a player's lifetime event count.
function GetLifetimeEvents(playerId){
    var gameStats = GetGameStats(playerId);
    var eventCount = gameStats.lifetimeEvents;

    if (eventCount === null || eventCount === undefined || isNaN(eventCount)){
        return 0;
    }

    return eventCount;
}

// Module: GameStatsUtilities
// Returns a player's lifetime bottom up goals completed.
function GetLifetimeBottomUpGoals(playerId) {
    var gameStats = GetGameStats(playerId);
    var goalCount = gameStats.lifetimeBottomUpGoals;

    if (goalCount === null || goalCount === undefined || isNaN(goalCount)){
        return 0;
    }

    return goalCount;
}

// Module: GameStatsUtilities
// Returns a player's lifetime top down goals completed.
function GetLifetimeTopDownGoals(playerId) {
    var gameStats = GetGameStats(playerId);
    var goalCount = gameStats.lifetimeTopDownGoals;

    if (goalCount === null || goalCount === undefined || isNaN(goalCount)){
        return 0;
    }

    return goalCount;
}

// Module: GameStatsUtilities
// Adds the lifetimeWinnings CASH parameter to the script data (or the script error if there was an error).
function AddLifetimeWinningsToResponse(playerId, dataObject){
    var stats = GetGameStats(playerId);
    var lifetimeWinnings = stats.lifetimeWinnings;

    if (dataObject === null || dataObject === undefined){
        if (Spark.hasScriptErrors()) {
            Spark.setScriptError("lifetimeWinnings", lifetimeWinnings);
        }
        else {
            Spark.setScriptData("lifetimeWinnings", lifetimeWinnings);
        }
    }
    else{
        dataObject.lifetimeWinnings = lifetimeWinnings;
    }
}

// Module: GameStatsUtilities
// Adds the lifetimeSpend parameter to the script data (or the script error if there was an error).
function AddLifetimeSpendToResponse(playerId, dataObject){
    var stats = GetGameStats(playerId);
    var lifetimeSpend = stats.lifetimeSpend;

    if (dataObject === null || dataObject === undefined){
        if (Spark.hasScriptErrors()) {
            Spark.setScriptError("lifetimeSpend", lifetimeSpend);
        }
        else {
            Spark.setScriptData("lifetimeSpend", lifetimeSpend);
        }
    }
    else{
        dataObject.lifetimeSpend = lifetimeSpend;
    }
}

// Module: GameStatsUtilities
// Adds the lifetimeEvents parameter to the script data (or the script error if there was an error).
function AddLifetimeEventsToResponse(playerId, dataObject){
    var stats = GetGameStats(playerId);
    var lifetimeEvents = stats.lifetimeEvents;

    if (dataObject === null || dataObject === undefined){
        if (Spark.hasScriptErrors()) {
            Spark.setScriptError("lifetimeEvents", lifetimeEvents);
        }
        else {
            Spark.setScriptData("lifetimeEvents", lifetimeEvents);
        }
    }
    else{
        dataObject.lifetimeEvents = lifetimeEvents;
    }
}

// Module: GameStatsUtilities
// Increments race count by 1.
function IncrementRaces(playerId){
    var successful = false;

    while (!successful){
        var versionedGameStats = GetVersionedGameStats(playerId);
        var gameStats = versionedGameStats.GetData();

        gameStats.lifetimeRaces += 1;

        successful = versionedGameStats.SetData(gameStats);
    }
}

// Module: GameStatsUtilities
// Increments both race wins and race count by 1.
function IncrementRaceWins(playerId){
    var successful = false;

    while (!successful){
        var versionedGameStats = GetVersionedGameStats(playerId);
        var gameStats = versionedGameStats.GetData();

        gameStats.lifetimeRaces += 1;
        gameStats.lifetimeRaceWins += 1;

        successful = versionedGameStats.SetData(gameStats);
    }
}

// Module: GameStatsUtilities
// Increments the player's lifetime CASH winnings by the given value.
function IncrementLifetimeWinnings(playerId, winnings){
    var successful = false;

    while (!successful){
        var versionedGameStats = GetVersionedGameStats(playerId);
        var gameStats = versionedGameStats.GetData();
        var winningsAsNumber = parseInt(winnings);

        if (gameStats.lifetimeWinnings == null || isNaN(gameStats.lifetimeWinnings)) {
            gameStats.lifetimeWinnings = winningsAsNumber;
        }
        else {
            gameStats.lifetimeWinnings += winningsAsNumber;
        }

        successful = versionedGameStats.SetData(gameStats);
    }
}

// Module: GameStatsUtilities
// Increments the player's lifetime spend by the given value.
function IncrementLifetimeCashSpend(playerId, expenditure){
    var successful = false;

    while (!successful){
        var versionedGameStats = GetVersionedGameStats(playerId);
        var gameStats = versionedGameStats.GetData();

        if (gameStats.lifetimeSpend == null || isNaN(gameStats.lifetimeSpend)) {
            gameStats.lifetimeSpend = expenditure;
        }
        else {
            gameStats.lifetimeSpend += expenditure;
        }

        successful = versionedGameStats.SetData(gameStats);
    }
}

// Module: GameStatsUtilities
// Increments the player's lifetime event count by 1.
function IncrementLifetimeEvents(playerId){
    var successful = false;

    while (!successful){
        var versionedGameStats = GetVersionedGameStats(playerId);
        var gameStats = versionedGameStats.GetData();

        if (gameStats.lifetimeEvents == null || isNaN(gameStats.lifetimeEvents)) {
            gameStats.lifetimeEvents = 1;
        }
        else {
            gameStats.lifetimeEvents += 1;
        }

        successful = versionedGameStats.SetData(gameStats);
    }
}

// Module: GameStatsUtilities
// Increments the "bottom up goals complete" statistic by the specified amount.
function IncrementBottomUpGoals(playerId, count){
    var successful = false;

    while (!successful){
        var versionedGameStats = GetVersionedGameStats(playerId);
        var gameStats = versionedGameStats.GetData();

        if (gameStats.lifetimeBottomUpGoals === null
            || gameStats.lifetimeBottomUpGoals === undefined
            || isNaN(gameStats.lifetimeBottomUpGoals)) {
            gameStats.lifetimeBottomUpGoals = 0;
        }

        gameStats.lifetimeBottomUpGoals += count;

        successful = versionedGameStats.SetData(gameStats);
    }
}

// Module: GameStatsUtilities
// Increments the "bottom up goals complete" statistic by the specified amount.
function IncrementTopDownGoals(playerId, gameStats, count){
    var successful = false;

    if (gameStats.lifetimeTopDownGoals === null
        || gameStats.lifetimeTopDownGoals === undefined
        || isNaN(gameStats.lifetimeTopDownGoals)) {
        gameStats.lifetimeTopDownGoals = 0;
    }

    gameStats.lifetimeTopDownGoals += count;
}