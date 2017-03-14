// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("CurrencyUtilities");
requireOnce("GameStatsUtilities");
requireOnce("GeneralUtilities");
requireOnce("LeaderboardUtilities");
requireOnce("VersionedDocumentUtilities");

// Module: BettingUtilities.
function GetVersionedBettingSeriesData(playerId) {
    return MakeVersionedProfile(playerId, "bettingSeriesData", GetDefaultBettingSeriesData());
}

function GetVersionedBettingSeriesDataFromProfile(versionedProfile) {
    return versionedProfile.GetVersionedKey("bettingSeriesData", GetDefaultBettingSeriesData());
}

function GetDefaultBettingSeriesData() {
    return {
        "timestamp": 0,
        "raceEvent": "",
        "winnings": 0,
        "totalPot": 0,
        "falseStartReset": false,
        "races": 0,
        "victories": 0,
        "wonLastRace": false,
        "updatedLastRace": false,
        "lastRaceResultId": ""
    };
}

// Module: BettingUtilities.
// Start a new set of betting series data and award any winnings that were hanging around from the last set (if any)
function StartNewBettingSeries(playerId, currentRaceEvent, timestamp) {
    var versionedBettingSeriesData = GetVersionedBettingSeriesData(playerId);
    var successfullyWritten = false;
    var displayName = Spark.loadPlayer(playerId).getDisplayName();

    while (!successfullyWritten) {
        var bettingSeriesData = versionedBettingSeriesData.GetData();

        // Fresh start
        bettingSeriesData = GetDefaultBettingSeriesData();
        bettingSeriesData.timestamp = timestamp;
        bettingSeriesData.raceEvent = currentRaceEvent;

        //Spark.getLog().info(FormatString("***** {0}: Starting new betting series data *****", displayName));

        successfullyWritten = versionedBettingSeriesData.SetData(bettingSeriesData);
    }
}

// Module: BettingUtilities.
function SetBettingSeriesLastRaceResultId(playerId, raceResultId) {
    var versionedBettingSeriesData = GetVersionedBettingSeriesData(playerId);
    var successfullyWritten = false;
    while (!successfullyWritten) {
        var bettingSeriesData = versionedBettingSeriesData.GetData();
        bettingSeriesData.lastRaceResultId = raceResultId;
        successfullyWritten = versionedBettingSeriesData.SetData(bettingSeriesData);
    }
    //Spark.getLog().info(FormatString("{0}: Setting raceResultId in betting series data to {1}",
    //                    Spark.loadPlayer(playerId).getDisplayName(), raceResultId));
}

// Module: BettingUtilities.
function GetRaceResultFromId(raceResultId) {
    // test for "" also here as that's the default value set (for some reason!)
    if (raceResultId === null || raceResultId === undefined || raceResultId === "") {
        return null;
    }

    var collection = Spark.runtimeCollection("raceResults");
    var entry = collection.findOne({"_id": {"$oid": raceResultId}});
    if (entry === null || entry === undefined) {
        return null;
    }
    return entry;
}

// Module: BettingUtilities.
// This only works for multiplayer races (i.e. 2 human players, not a bot race)
function RaceHasEndedForPlayer(raceResult, playerId) {
    var playerEntry = null;
    var opponentEntry = null;
    if (raceResult.race[0].playerId === playerId) {
        playerEntry = raceResult.race[0];
        opponentEntry = raceResult.race[1];
    }
    else if (raceResult.race[1].playerId === playerId) {
        playerEntry = raceResult.race[1];
        opponentEntry = raceResult.race[0];
    }
    else {
        // We don't match either player - WTF?!
        return false;
    }

    var playerHasFinished = (playerEntry.time > 0 || playerEntry.falseStart);
    var opponentHasFalseStarted = (opponentEntry !== null && opponentEntry !== undefined && opponentEntry.falseStart);
    // The race is over if the player has finished, either by false starting or completing the race,
    // or if our opponent has false started.
    return (playerHasFinished || opponentHasFalseStarted);
}

// Module: BettingUtilities.
function GetCurrentTotalPot(playerId, currentRaceEvent, submittedTimestamp) {
    var versionedBettingSeriesData = GetVersionedBettingSeriesData(playerId);
    var bettingSeriesData = versionedBettingSeriesData.GetData();
    if (bettingSeriesData.timestamp === submittedTimestamp && bettingSeriesData.raceEvent === currentRaceEvent) {
        return bettingSeriesData.totalPot;
    }
    else {
        return 0;
    }
}

// Module: BettingUtilities.
// Call when players false start to signal to the betting series that we need to clear
// the current winnings. This also sets an additional flag, falseStartReset, in
// the betting series data to prevent race conditions if players false start at the same time
// e.g. Player 1 false starts and declares Player 2 the winner before realising Player 2 also false started
function FalseStartResetWinningsAndUpdateTotalPot(playerId, currentRaceEvent, submittedTimestamp, totalPot) {
    var displayName = Spark.loadPlayer(playerId).getDisplayName();
    var versionedProfile = MakeVersionedProfileDocument(playerId);
    var versionedBettingSeriesData = GetVersionedBettingSeriesDataFromProfile(versionedProfile);
    var versionedGameStats = GetVersionedGameStatsFromProfile(versionedProfile);
    var successfullyWritten = false;

    while (!successfullyWritten) {
        var bettingSeriesData = versionedBettingSeriesData.GetData();
        var gameStats = versionedGameStats.GetData();

        if (bettingSeriesData.timestamp === submittedTimestamp &&
            bettingSeriesData.raceEvent === currentRaceEvent &&
            !bettingSeriesData.falseStartReset) {

            //Spark.getLog().info(FormatString("{0}: resetting winnings after a false start", Spark.loadPlayer(playerId).getDisplayName()));
            bettingSeriesData.falseStartReset = true;
            bettingSeriesData.winnings = 0;
            bettingSeriesData.totalPot = totalPot;
            if (bettingSeriesData.updatedLastRace) {
                // If the player has already called UpdateBettingSeriesData, we need to revert
                // their race (and their victory, if applicable), now that they've actually false started
                bettingSeriesData.races -= 1;
                gameStats.lifetimeRaces = Math.max(gameStats.lifetimeRaces - 1, 0);
                if (bettingSeriesData.wonLastRace) {
                    bettingSeriesData.victories -= 1;
                    gameStats.lifetimeRaceWins = Math.max(gameStats.lifetimeRaceWins - 1, 0);
                }
            }
        }

        versionedBettingSeriesData.SetData(bettingSeriesData);
        versionedGameStats.SetData(gameStats);

        successfullyWritten = versionedProfile.Save();
    }
}

// Module: BettingUtilities.
// Resets the 'falseStartReset' flag in the betting series data for a new race
function BettingSeriesNewRace(playerId, currentRaceEvent, submittedTimestamp) {
    var versionedBettingSeriesData = GetVersionedBettingSeriesData(playerId);
    var successfullyWritten = false;
    var displayName = Spark.loadPlayer(playerId).getDisplayName();

    while (!successfullyWritten) {
        var bettingSeriesData = versionedBettingSeriesData.GetData();

        if (bettingSeriesData.timestamp === submittedTimestamp && bettingSeriesData.raceEvent === currentRaceEvent) {
            //Spark.getLog().info(FormatString("{0}: setting falseStartReset flag to false", Spark.loadPlayer(playerId).getDisplayName()));
            bettingSeriesData.falseStartReset = false;
            bettingSeriesData.updatedLastRace = false;
            bettingSeriesData.wonLastRace = false;
            bettingSeriesData.lastRaceResultId = "";
        }

        successfullyWritten = versionedBettingSeriesData.SetData(bettingSeriesData);
    }
}

// Module: BettingUtilities.
// Updates the given player's current betting series, adjusting winnings and total victories.
function UpdateBettingSeriesData(playerId, submittedTimestamp, currentRaceEvent, totalPot, wonThisRace, raceTime, falseStarted){
    // Don't mess around with the betting series tracker or leaderboard until we've seen the Goals screen.
    //Spark.getLog().info("UpdateBettingSeriesData");

    var currentPlayer = Spark.loadPlayer(playerId);
    var versionedBettingSeriesData = GetVersionedBettingSeriesData(playerId);
    var successfullyWritten = false;

    while (!successfullyWritten) {
        var bettingSeriesData = versionedBettingSeriesData.GetData();

        if (bettingSeriesData.totalPot === totalPot) {
            //Spark.getLog().info(FormatString("{0}: Trying to update betting series again with same totalPot of {1}, dismissing",
            //    currentPlayer.getDisplayName(), totalPot));
            return;
        }

        var races = 0;
        var victories = 0;

        // Empty timestamp or timestamp/event mismatch
        if (bettingSeriesData.timestamp === "" ||
            (bettingSeriesData.timestamp !== submittedTimestamp || bettingSeriesData.raceEvent !== currentRaceEvent)) {

            EmptyOrMismatchedTimestampDebugLogs(totalPot, submittedTimestamp, wonThisRace, currentPlayer);

            if (!falseStarted) {
                races = 1;
            }
            victories = ((wonThisRace) ? 1 : 0);
            UpdateBettingSeriesDataValues(bettingSeriesData, submittedTimestamp, currentRaceEvent, totalPot, races, victories, wonThisRace, currentPlayer);
        }
        // Timestamp/event match
        else {
            MatchedTimestampDebugLogs(totalPot, wonThisRace, currentPlayer);

            if (!falseStarted) {
                races = (bettingSeriesData.races + 1);
            }
            else {
                races = bettingSeriesData.races;
            }
            victories = bettingSeriesData.victories + (wonThisRace ? 1 : 0);
            UpdateBettingSeriesDataValues(bettingSeriesData, submittedTimestamp, currentRaceEvent, totalPot, races, victories, wonThisRace, currentPlayer);
        }

        successfullyWritten = versionedBettingSeriesData.SetData(bettingSeriesData);
    }

    if (wonThisRace) {
        IncrementRaceWins(playerId);
        AchievementWonRace(playerId);
    }
    else {
        IncrementRaces(playerId);
    }

    if (!falseStarted && raceTime !== -1) {
        AddXP(currentPlayer, "FinishRace");
    }

    function UpdateBettingSeriesDataValues(bettingSeriesData, submittedTimestamp, currentRaceEvent, totalPot, races, victories, wonThisRace, currentPlayer) {
        var displayName = currentPlayer.getDisplayName();
        if (!bettingSeriesData.falseStartReset) {
            bettingSeriesData.timestamp = submittedTimestamp;
            bettingSeriesData.raceEvent = currentRaceEvent;
            bettingSeriesData.winnings = ((wonThisRace) ? totalPot : 0);
            bettingSeriesData.totalPot = totalPot;
            bettingSeriesData.races = races;
            bettingSeriesData.victories = victories;
            bettingSeriesData.wonLastRace = wonThisRace;
            bettingSeriesData.updatedLastRace = true;

            //Spark.getLog().info(FormatString("{0}: total pot {1}, races {2}, victories {3}",
            //    displayName, bettingSeriesData.totalPot, bettingSeriesData.races, bettingSeriesData.victories));
        }
        else {
            //Spark.getLog().info(FormatString("{0}: Tried to update betting series data but \"falseStartRace\" was set", displayName));
        }
    }

    function EmptyOrMismatchedTimestampDebugLogs(winnings, timestamp, wonThisRace, currentPlayer) {
        var displayName = currentPlayer.getDisplayName();
        if (timestamp !== "") {
            if (wonThisRace) {
                //Spark.getLog().info(FormatString("{0}: betting series event/timestamp mismatch, we won the race so submitting {1}", displayName, winnings));
            }
            else {
                //Spark.getLog().info(FormatString("{0}: betting series event/timestamp mismatch, we lost the race so submitting 0", displayName));
            }
        }
        // Empty timestamp
        else {
            if (wonThisRace) {
                //Spark.getLog().info(FormatString("{0}: empty timestamp, we won the race so new submit of {1}", displayName, winnings));
            }
            else {
                //Spark.getLog().info(FormatString("{0}: empty timestamp, we lost the race so winnings down to 0", displayName));
            }
        }
    }

    function MatchedTimestampDebugLogs(winnings, wonThisRace, currentPlayer) {
        var displayName = currentPlayer.getDisplayName();
        if (wonThisRace) {
            //Spark.getLog().info(FormatString("{0}: timestamp/event match, we won the race so submitting {1}", displayName, winnings));
        }
        else {
            //Spark.getLog().info(FormatString("{0}: timestamp/event match, we lost the race so winnings down to 0", displayName));
        }
    }
}

// Module: BettingUtilities.
// Submits the current betting series data to the event leaderboard and resets the betting series.
function SubmitAndResetBettingSeriesData(playerId, submittedTimestamp, currentRaceEvent){
    var currentPlayer = Spark.loadPlayer(playerId);

    var versionedBettingSeriesData = GetVersionedBettingSeriesData(playerId);

    var successfullyWritten = false;
    var winnings = 0;
    var races = 0;
    var victories = 0;

    while (!successfullyWritten) {
        var bettingSeriesData = versionedBettingSeriesData.GetData();

        var raceResult = GetRaceResultFromId(bettingSeriesData.lastRaceResultId);
        if (raceResult !== null && raceResult !== undefined) {
            var raceHasEnded = RaceHasEndedForPlayer(raceResult, playerId);
            if (!raceHasEnded) {
                // The player's race hasn't ended but they're trying to claim.
                // This will happen after a forfeit, so we'll say they've lost everything
                // Don't credit a race, because they didn't do their last race
                bettingSeriesData.winnings = 0;
                //Spark.getLog().info(FormatString(
                //    "{0}: player is calling SubmitAndResetBettingSeriesData but the race hasn't ended! They must've forfeited",
                //    Spark.loadPlayer(playerId).getDisplayName()));
            }
        }
        //Spark.getLog().info("BettingSeriesWinningsTracker: " + currentPlayer.getDisplayName() + " finished betting series.");

        // Submit whatever we have server-side to the leaderboard.
        if (bettingSeriesData.timestamp !== "" && bettingSeriesData.raceEvent !== "")
        {
            //Spark.getLog().info(FormatString("BettingSeriesWinningsTracker: {0}'s timestamp and event both match, posting winnings of {1}",
            //    currentPlayer.getDisplayName(), bettingSeriesData.winnings));
        }
        else
        {
            //Spark.getLog().info("BettingSeriesWinningsTracker: We were asked to submit our betting series winnings to the leaderboard but " +
            //    "we don't have any data to submit!");
        }

        winnings = bettingSeriesData.winnings;
        races = bettingSeriesData.races;
        victories = bettingSeriesData.victories;

        // now it's awarded wipe the data
        bettingSeriesData = GetDefaultBettingSeriesData();

        successfullyWritten = versionedBettingSeriesData.SetData(bettingSeriesData);
    }

    //Spark.getLog().info(FormatString("Player {0} has won {1}, original balance {2}", currentPlayer.getDisplayName(), winnings, currentPlayer.getBalance1()));
    Credit(winnings, false, playerId, true);
    IncrementLifetimeWinnings(playerId, winnings);
    //Spark.getLog().info(FormatString("Player {0} now has a balance of {1}", currentPlayer.getDisplayName(), currentPlayer.getBalance1()));

    if (victories > 0) {
        // We can't award this at the point the player false starts because we don't know if
        // you're opponent also has. Consequently in those situations we need to defer the actual
        // awarding to here where we can be sure of the final outcome of the race(s)
        // TODO: think of a way to get around this...
        AchievementWonRace(playerId);
    }

    SubmitToLeaderboard(playerId, currentRaceEvent, winnings, victories, races);
}

// Module: BettingUtilities.
// Submits the current betting series data to the event leaderboard.
function SubmitToLeaderboard(playerId, raceEvent, winnings, victories, races){
    //LogMessage("SubmitToLeaderboard");
    var currentPlayer = null;
    if (playerId !== null && playerId !== undefined){
        currentPlayer = Spark.loadPlayer(playerId);
    }
    else{
        currentPlayer = Spark.getPlayer();
        playerId = currentPlayer.getPlayerId();
    }

    // Don't care about net losses!
    if (winnings <= 0)
        winnings = 0;

    // Gotta get the challenge instance ID.
    var playerEventData = GetVersionedEvents2(playerId).GetData();

    var currentPlayerRaceEvent = GetMostRecentEventData(playerEventData[raceEvent]);

    if (currentPlayerRaceEvent === null || currentPlayerRaceEvent === undefined) {
        ErrorMessage(FormatString(
            "player:{0}:{1} isn't part of any race events but is trying to post a score to event: {2}",
            playerId,
            currentPlayer.getDisplayName(),
            raceEvent));
       return;
    }
    PostToLeagueLeaderboard(playerId, currentPlayerRaceEvent.challengeId, winnings, victories, races);
}