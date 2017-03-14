// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("RaceEventUtilities");
requireOnce("RaceUtilities");
requireOnce("DebugSettingsUtilities");
requireOnce("MathUtilities");
requireOnce("TimeUtilities");

/*
Module: SlamUtilities

Called from Global Messages -> MatchFoundMessage. Sets up slam data.

participants    [array]     - List of all participants in the slam, matched by GS's MatchmakeRequest
eventName       [string]    - The name of the slam event
partitionSize   [number]    - How many participants we have in the slam
slamData        [SlamData]  - An empty object, which will be filled with all the slam data in this function
.
*/
function CreateInitialSlamData(participants, eventName, partitionSize, slamData){
    LogFunctionName("CreateInitialSlamData", null, true);
    var indexes = [];
    for (var i = 0; i < participants.length; ++i){
        indexes.push(i);
    }

    var debugSettings = GetDebugSettings("Slam");
    if (debugSettings !== null && debugSettings.Order_Participants){
        indexes = DEBUG_OrderParticipants(indexes, participants);
    }
    else{
        indexes = FisherYatesShuffle(indexes, participants.length);
    }

    var slamData = {};
    var roundsData = [];
    var roundData = {};
    var pairsData = [];
    for (var i = 0; i < participants.length; i += 2){
        var pairData = {};
        pairData["Contender1"] = participants[indexes[i]];
        pairData["Contender2"] = participants[indexes[i + 1]];
        // Delete unnecessary data
        delete pairData.Contender1.peerId;
        delete pairData.Contender2.peerId;
        delete pairData.Contender1.online;
        delete pairData.Contender2.online;
        // Assign default values
        pairData["Winner"] = null;
        pairData["Loser"] = null;
        SetupContender(pairData.Contender1);
        SetupContender(pairData.Contender2);
        pairData["Finished"] = false;
        // Get a matchId for paired GSRT sessions
        var matchId = Spark.getMultiplayer().createMatchById(pairData.Contender1.id, pairData.Contender2.id);
        if (matchId === null){
            continue;
        }
        Spark.getMultiplayer().loadMatch(matchId).enableRealtime();
        pairData["MatchID"] = matchId;
        pairsData.push(pairData);
    }
    var now = Math.floor(GetNow() / 1000); // Seconds
    roundData["Matches"] = pairsData;
    roundData["StartTime"] = now; // Seconds
    roundData["FirstResultIn"] = false;
    roundsData.push(roundData);
    slamData["Rounds"] = roundsData;
    slamData["CurrentRound"] = 1;
    slamData["EventName"] = eventName;
    slamData["SlamStartTime"] = now;
    slamData["FinalRound"] = Math.round(Math.log(partitionSize) / Math.log(2));
    slamData["ParticipantsCount"] = participants.length;
    var collection = Spark.runtimeCollection("slams");
    var success = collection.insert(slamData);

    if (success){
        var slamId = slamData._id.$oid;
        SetSlamRoundTimeoutSchedule(slamId, 1);
    }

    LogFunctionName("CreateInitialSlamData", null, false);
    return slamData;
}

function DEBUG_OrderParticipants(indexes, participants){
    Spark.getLog().debug("DEBUG_OrderParticipants");
    Spark.getLog().debug(FormatString("participants.length {0}", participants.length));
    indexes.sort(function(a, b){
        var p1 = participants[a].displayName;
        var p2 = participants[b].displayName;
        Spark.getLog().debug(FormatString("Ordering {0} and {1}", p1, p2));
        if (p1.indexOf("MA_DEBUG") > -1 && p2.indexOf("MA_DEBUG") > -1){
            // Both are debug names
            Spark.getLog().debug("#1");
            return ((p1 > p2) ? 1 : -1);
        }
        else if (p1.indexOf("MA_DEBUG") === -1 && p2.indexOf("MA_DEBUG") === -1){
            // Neither are debug names
            Spark.getLog().debug("#2");
            return ((p1 > p2) ? 1 : -1);
        }
        else{
            Spark.getLog().debug("#3");
            // At least one is a debug name
            return ((p1.indexOf("MA_DEBUG") > -1) ? 1 : -1);
        }
    });
    Spark.getLog().debug("Final ordering...");
    for (var i = 0; i < indexes.length; ++i){
        Spark.getLog().debug(FormatString("#{0}: {1}", i + 1, participants[indexes[i]].displayName));
    }
    return indexes;
}

function SetupContender(contender){
    if (contender === null || contender === undefined){
        return;
    }
    contender["time"] = -1;
    contender["falseStarted"] = false;
    contender["disconnected"] = false;
    contender["started"] = false;
    contender["finished"] = false;
}

/*
Module: SlamUtilities

>>> ONLY CALL FROM AtomicModify() <<<

Call this at the end of a race to update that particular match, plus update the slam round as a whole and update any visual helpers

entry       [SlamData]  - The object containing all the slam data
eventName   [string]    - The name of the slam event
slamId      [string]    - The id of the slam data entry in the slams runtime collection
raceTime    [number]    - The race time for the current player who just finished a slam race
playerId    [string]    - The id of the player who just finished the slam race
falseStart  [boolean]   - Did the player false start or not?
.
*/
function FinishSlamRace(entry, eventName, slamId, raceTime, playerId, falseStart, timeout){
    LogFunctionName("FinishSlamRace", slamId, true);
    var event = GetRaceEventDataFromMetaCollection(eventName, false, playerId);
    if (!event.IsSlam){
        ErrorMessage(FormatString("{0} event is a slam, but yet we're treating it like one", eventName));
        return null;
    }

    var currentRound = entry.CurrentRound;
    var rounds = entry.Rounds;
    var matches = rounds[currentRound - 1].Matches;
    var result = GetPlayerAndOpponent(matches, playerId);
    if (result === null){
        return null;
    }
    var playerContender = result.player;
    var opponentContender = result.opponent;
    var match = result.match;
    if (falseStart){
        // We false started
        playerContender.falseStarted = true;
        //LogMessage("Server says: player false started");
        Spark.getLog().debug(FormatString("{0} false started", playerContender.displayName));
    }
    else if (timeout){
        // Player took too long to finish the race
        playerContender.timeout = true;
        //LogMessage("Server says: player took too long to finish the race");
        Spark.getLog().debug(FormatString("{0} timed out, they took too long to finish the race", playerContender.displayName));
    }
    else{
        if (!playerContender.finished && raceTime > 0){
            // Player has finished the race, record results
            playerContender.finished = true;
            playerContender.time = raceTime;
            //LogMessage("Server says: player race results okay");
            Spark.getLog().debug(FormatString("{0} finished with a time of {1}", playerContender.displayName, raceTime));
        }
    }

    UpdateMatches(slamId, matches, entry, event);

    // We've finished...
    if (playerContender.finished){
        // And our opponent has finished OR they've disconnected OR
        // we've official won because our opponent hasn't finished the race after us
        if (opponentContender.finished || opponentContender.disconnected ||
            (match.Winner !== null && match.Winner.id === playerContender.id && opponentContender.started && !opponentContender.finished)){
            // Determine winner
            Spark.getLog().debug("Calling DecideResults");
            DecideResults(playerContender.time, opponentContender.time, playerId, opponentContender.id, 0, eventName, slamId, true);
        }
        // But our opponent hasn't
        else{
            // Schedule a timeout
            Spark.getLog().debug(FormatString("{0} has finished, but {1} has not, so schedule a race timeout",
                                                playerContender.displayName, opponentContender.displayName));
            var delay = 5;
            Spark.getScheduler().inSeconds("Schedule_EndRaceTimeout", delay,
                                            {"playerId":playerId, "serverResultId":slamId, "isSlam": true, "round": currentRound});
        }
    }
    else if (playerContender.timeout){
        // TODO: Fix this when we come back to slams
        // Needs submitted timestamp as another parameter at the end
        SendRaceResultAndUpdateBettingSeries(playerContender.id, /*won*/false, -1, -1, 0, entry.EventName, slamId, /*isSlam*/true, /*botRace*/false);
    }

    UpdateSlamRound(slamId, matches, entry);
    SendEditorVisualHelperUpdate(slamId, entry);
    LogFunctionName("FinishSlamRace", slamId, false);
    return entry;
}

/*
Module: SlamUtilities

>>> ONLY CALL FROM AtomicModify() <<<

Gets information about the current match the specified player is in. This function returns an array of info, structured as such:
array[0] = Contender object of the player
array[1] = Contender object of their opponent
array[2] = Match object the player is in

matches     [array]     - A list of all the current matches in the current round
playerId    [string]    - The id of the player whose match we want to find
.
*/
function GetPlayerAndOpponent(matches, playerId){
    var playerContender = null;
    var opponentContender = null;
    for (var i = 0; i < matches.length; ++i){
        if (matches[i].Contender1 !== null && matches[i].Contender1.id === playerId){
            playerContender = matches[i].Contender1;
            opponentContender = matches[i].Contender2;
            break;
        }
        else if (matches[i].Contender2 !== null && matches[i].Contender2.id === playerId){
            playerContender = matches[i].Contender2;
            opponentContender = matches[i].Contender1;
            break;
        }
        else{
            // No matches to our id yet, so keep going
            continue;
        }
    }
    if (playerContender !== null && opponentContender !== null){
        var result = {};
        result["player"] = playerContender;
        result["opponent"] = opponentContender;
        result["match"] = matches[i];
        return result;
    }
    else{
        var player = Spark.loadPlayer(playerId);
        if (player === null || player === undefined){
            ErrorMessage(FormatString("Failed to load player with id of {0}", playerId));
            Spark.getLog().error(FormatString("Failed to load player with id of {0}", playerId));
        }
        else{
            ErrorMessage(FormatString("Failed to find {0} and their opponent in the slam data", player.getDisplayName()));
            Spark.getLog().error(FormatString("Failed to find {0} and their opponent in the slam data", player.getDisplayName()));
        }
        return null;
    }
}

/*
Module: SlamUtilities

>>> ONLY CALL FROM AtomicModify() <<<

Iterates over each match in the current round and check to see if it has finished or not. If the match has finished then the winners and losers are determined.

slamId  [string]    - The id of the slam data entry in the slams runtime collection
matches [array]     - A list of all the current matches in the current round
entry   [SlamData]  - The object containing all the slam data
.
*/
function UpdateMatches(slamId, matches, entry, event){
    LogFunctionName("UpdateMatches", slamId, true);

    for (var i = 0; i < matches.length; ++i){
        if (matches[i].Finished){
            continue;
        }

        if (matches[i].Contender1 === null && matches[i].Contender2 === null){
            matches[i].Finished = true;
            continue;
        }
        else if (matches[i].Contender1 === null && matches[i].Contender2 !== null){
            SetWinnerAndLoserForNullRace(matches[i], matches[i].Contender2);
        }
        else if (matches[i].Contender2 === null && matches[i].Contender1 !== null){
            SetWinnerAndLoserForNullRace(matches[i], matches[i].Contender1);
        }
        else{
            SetWinnerAndLoserForNonNullRace(matches[i], matches[i].Contender1, matches[i].Contender2);
            SetWinnerAndLoserForNonNullRace(matches[i], matches[i].Contender2, matches[i].Contender1);
        }

        AwardSlamPrizes(event, matches, entry, slamId);

        if (matches[i].Winner !== null){
            SendMatchFinishedMessage(entry, slamId, matches[i].Winner.id);
        }
        if (matches[i].Loser !== null){
            SendMatchFinishedMessage(entry, slamId, matches[i].Loser.id);
        }
    }

    LogFunctionName("UpdateMatches", slamId, false);

    function SetWinnerAndLoserForNonNullRace(match, contender1, contender2){
        LogFunctionName("SetWinnerAndLoserForNonNullRace", slamId, true);

        if (contender1.falseStarted && !match.Finished){
            // Contender 1 false started, Contender 2 wins
            SetMatchWinnerAndLoser(match, contender2, contender1);
        }
        else if (contender1.timeout && contender2.timeout){
            // Both players have timed out, so both lose
            SetMatchWinnerAndLoser(match, null, null);
        }
        else if (contender1.finished && !match.Finished){
            if (contender2.finished){
                // Both contenders have finished, determine who won based on their race times
                var winner = ((contender1.time < contender2.time) ? contender1 : contender2);
                var loser = ((contender1.time < contender2.time) ? contender2 : contender1);
                SetMatchWinnerAndLoser(match, winner, loser);
            }
            else if (contender2.disconnected || contender2.timeout){
                // Contender 2 disconnected/timed out during the race, Contender 1 wins
                SetMatchWinnerAndLoser(match, contender1, contender2);
            }
        }
        else if (contender1.disconnected){
            if (!contender2.disconnected){
                if (!contender2.started){
                    // Contender 1 disconnected, Contender 2 has not and hasn't started a race yet, Contender 2 wins
                    SetMatchWinnerAndLoser(match, contender2, contender1);
                }
            }
            else if (contender2.disconnected){
                // Both contenders have disconnected, neither contender wins
                SetMatchWinnerAndLoser(match, null, null);
            }
        }
        LogFunctionName("SetWinnerAndLoserForNonNullRace", slamId, false);
    }

    function SetWinnerAndLoserForNullRace(match, nonNullContender){
        LogFunctionName("SetWinnerAndLoserForNullRace", slamId, true);

        if (!match.Finished){
            if (nonNullContender.disconnected){
                SetMatchWinnerAndLoser(match, null, null);
            }
            else{
                SetMatchWinnerAndLoser(match, nonNullContender, null);
            }
        }
        LogFunctionName("SetWinnerAndLoserForNullRace", slamId, false);
    }
}

/*
Module: SlamUtilities

>>> ONLY CALL FROM AtomicModify() <<<

Sets the winner and loser of a particular match, and sets the match's 'Finished' field to true

match   [Match]     - Current match data to edit
winner  [Contender] - The winner of the match
loser   [Contender] - The loser of the match
.
*/
function SetMatchWinnerAndLoser(match, winner, loser){
    // TODO: ATOMIC
    match["Winner"] = winner;
    match["Loser"] = loser;
    if (!match["Finished"]){
        if (winner === null && loser === null){
            Spark.getLog().debug("Both players lost the match");
        }
        else{
            Spark.getLog().debug(FormatString("{0} vs {1} has finished - {0} is the winner",
                                    ((winner !== null)? winner.displayName : "NULL"),
                                    ((loser !== null)? loser.displayName : "NULL")));
        }
    }
    match["Finished"] = true;
}

/*
Module: SlamUtilities

>>> ONLY CALL FROM AtomicModify() <<<

If all the matches in the current round have finished then this function will award prizes, prepare the next round and inform all players
of the slam round results as necessary.

slamId  [string]    - The id of the slam data entry in the slams runtime collection
matches [array]     - A list of all the current matches in the current round
entry   [SlamData]  - The object containing all the slam data
.
*/
function UpdateSlamRound(slamId, matches, entry){
    LogFunctionName("UpdateSlamRound", slamId, true);
    if (RoundIsComplete(matches)){
        var event = GetRaceEventDataFromMetaCollection(entry.EventName, false, playerId);
        if (!event.IsSlam){
            ErrorMessage(FormatString("{0} event is not a slam, but we're treating it like one", eventName));
            return;
        }

        var currentRound = entry.CurrentRound;

        if (entry.CurrentRound === entry.FinalRound){
            // Remove it, we're done
            //Spark.getLog().debug("Removing data for finished slam");
            //collection.remove({"_id":{"$oid":slamId}});
        }
        else {
            PrepareNextRound(entry, slamId);
        }

        // Send the details to all players
        for (var i = 0; i < matches.length; ++i){
            if (matches[i].Contender1 !== null){
                SendSlamRoundFinishedMessage(entry, slamId, matches[i].Contender1.id);
            }
            if (matches[i].Contender2 !== null){
                SendSlamRoundFinishedMessage(entry, slamId, matches[i].Contender2.id);
            }
        }

        if (currentRound === entry.FinalRound){
            Spark.getLog().debug("**** SLAM FINISHED ****");
        }
    }
    LogFunctionName("UpdateSlamRound", slamId, false);

    function RoundIsComplete(matches){
        for (var i = 0; i < matches.length; ++i){
            if (!matches[i].Finished){
                return false;
            }
        }
        return true;
    }
}

/*
Module: SlamUtilities

Sends a 'SlamRoundFinished' message to a particular client, signalling the end of the current slam round

slamData    [SlamData]  - The object containing all the slam data
slamId      [string]    - The id of the slam data entry in the slams runtime collection
playerId    [string]    - The id of the player who we want to send the 'SlamRoundFinished' message to
.
*/
function SendSlamRoundFinishedMessage(slamData, slamId, playerId){
    var player = Spark.loadPlayer(playerId);
    if (player !== null && player !== undefined){
        Spark.getLog().debug(FormatString("Sending \"SlamRoundFinished\" message to {0}", player.getDisplayName()));
        Spark.sendMessageByIdExt({"slamData": slamData, "slamId": slamId}, "SlamRoundFinished", [playerId]);
    }
    else{
        Spark.getLog().error(FormatString("Failed to load player with id {0}", playerId));
    }
}

/*
Module: SlamUtilities

Sends a 'MatchFinished' message to a particular client, signalling the end of the player's current match

slamData    [SlamData]  - The object containing all the slam data
slamId      [string]    - The id of the slam data entry in the slams runtime collection
playerId    [string]    - The id of the player who we want to send the 'SlamRoundFinished' message to
.
*/
function SendMatchFinishedMessage(slamData, slamId, playerId){
    var player = Spark.loadPlayer(playerId);
    if (player !== null && player !== undefined){
        Spark.getLog().debug(FormatString("Sending \"MatchFinished\" message to {0}", player.getDisplayName()));
        Spark.sendMessageByIdExt({"slamData": slamData, "slamId": slamId}, "MatchFinished", [playerId]);
    }
    else{
        Spark.getLog().error(FormatString("Failed to load player with id {0}", playerId));
    }
}

/*
Module: SlamUtilities

>>> ONLY CALL FROM AtomicModify() <<<

Sets up the data for the next slam round from the current slam round. This involves taking the winners and pairing them up, or awarding byes for
void entries.

entry   [SlamData]  - The object containing all the slam data
slamId  [string]    - The id of the slam data entry in the slams runtime collection
.
*/
function PrepareNextRound(entry, slamId){
    LogFunctionName("PrepareNextRound", slamId, true);
    //Spark.getLog().debug(FormatString("Data before preparation: {0}", JSON.stringify(entry)));
    var currentRound = entry.CurrentRound;
    var rounds = entry.Rounds;
    var matches = rounds[currentRound - 1].Matches;
    // Prepare details for next round
    var roundData = {};
    var pairsData = [];
    var nextRoundMatchesCount = matches.length / 2;

    var roundIsValid = false; // The round is valid if at least one match is generated

    for (var i = 0; i < nextRoundMatchesCount; ++i){
        Spark.getLog().debug(FormatString("Preparing next round: match #{0}", (i + 1)));

        var pairData = {};
        pairData["Contender1"] = PrepareContender(matches[i * 2].Winner);
        pairData["Contender2"] = PrepareContender(matches[(i * 2) + 1].Winner);
        pairData["Winner"] = null;
        pairData["Loser"] = null;

        if (pairData.Contender1 === null && pairData.Contender2 === null){
            // Both players are null
            SetMatchWinnerAndLoser(pairData, null, null);
        }
        else if (pairData.Contender1 === null && pairData.Contender2 !== null){
            // Contender 1 is null, Contender 2 is valid (gets a bye)
            SetMatchWinnerAndLoser(pairData, pairData.Contender2, null);
            Spark.getLog().debug(FormatString("{0} gets a bye", pairData.Contender2.displayName));
        }
        else if (pairData.Contender1 !== null && pairData.Contender2 === null){
            // Contender 2 is null, Contender 1 is valid (gets a bye)
            SetMatchWinnerAndLoser(pairData, pairData.Contender1, null);
            Spark.getLog().debug(FormatString("{0} gets a bye", pairData.Contender1.displayName));
        }
        else{
            // Both players are valid
            Spark.getLog().debug(FormatString("{0} vs {1}",
                                    pairData.Contender1.displayName, pairData.Contender2.displayName));

            var matchId = Spark.getMultiplayer().createMatchById(pairData.Contender1.id, pairData.Contender2.id);
            if (matchId === null){
                Spark.getLog().error(FormatString("Failed to generate match id for {0} and {1}",
                                    pairData.Contender1.displayName, pairData.Contender2.displayName));
                continue;
            }
            Spark.getMultiplayer().loadMatch(matchId).enableRealtime();
            pairData["MatchID"] = matchId;
            roundIsValid = true;
        }

        pairsData.push(pairData);
    }

    var now = Math.floor(GetNow() / 1000); // Seconds

    roundData["Matches"] = pairsData;
    roundData["StartTime"] = now; // Seconds
    roundData["FirstResultIn"] = false;
    rounds.push(roundData);

    entry.CurrentRound = entry.CurrentRound + 1;
    entry.Rounds = rounds;

    Spark.getLog().debug("Finished preparing next round");

    if (roundIsValid){
        SetSlamRoundTimeoutSchedule(slamId, entry.CurrentRound);
    }
    else{
        var event = GetRaceEventDataFromMetaCollection(entry.EventName, false, entry.Rounds[entry.Rounds.length - 1].Matches[0].Contender1.id); //?!?!
        AwardSlamPrizes(event, entry.Rounds[entry.Rounds.length - 1].Matches, entry, slamId);
    }

    LogFunctionName("PrepareNextRound", slamId, false);

    function PrepareContender(lastRoundWinner){
        if (lastRoundWinner === null){
            return null;
        }
        var contender = {};
        SetupContender(contender);
        contender.displayName = lastRoundWinner.displayName;
        contender.id = lastRoundWinner.id;
        return contender;
    }
}

/*
Module: SlamUtilities

>>> ONLY CALL FROM AtomicModify() <<<

Schedule the slam round timeout code to execute 120 seconds from now. This prevents contenders remaining in the race forever.

slamId          [string]    - The id of the slam data entry in the slams runtime collection
currentRound    [number]    - The current round of the slam
.
*/
function SetSlamRoundTimeoutSchedule(slamId, currentRound){
    Spark.getLog().debug("Scheduling SlamRoundTimeout");
    var delay = 120;
    Spark.getScheduler().inSeconds("Schedule_SlamRoundTimeout", delay,
                                    {"slamId":slamId, "currentRound": currentRound});
}

/*
Module: SlamUtilities

>>> ONLY CALL FROM AtomicModify() <<<

Awards prizes to players based on their rank in the slam. The prizes are set up in the race event data.

event   [RaceEventData] - The race event data of the current slam event
matches [array]         - A list of all the current matches in the current round
entry   [SlamData]      - The object containing all the slam data
slamId  [string]        - The id of the slam data entry in the slams runtime collection
.
*/
function AwardSlamPrizes(event, matches, entry, slamId){
    LogFunctionName("AwardSlamPrizes", slamId, true);
    for (var i = 0; i < matches.length; ++i){
        var rank = -1;
        if (matches[i].Loser !== null){
            // We have a loser
            GetRankAndAwardPrize(matches[i].Loser, entry, event, slamId);
        }
        else{
            // We don't have a loser...
            if (matches[i].Winner === null){
                // We don't have a winner either, so both players lost...
                if (matches[i].Contender1 !== null){
                    GetRankAndAwardPrize(matches[i].Contender1, entry, event, slamId);
                }
                if (matches[i].Contender2 !== null){
                    GetRankAndAwardPrize(matches[i].Contender2, entry, event, slamId);
                }
            }
        }
    }
    if (matches[0].Winner !== null && entry.CurrentRound === entry.FinalRound){
        GetRankAndAwardPrize(matches[0].Winner, entry, event, slamId);
    }

    LogFunctionName("AwardSlamPrizes", slamId, false);

    function GetRankAndAwardPrize(contender, entry, event, slamId){
        var rank = GetRankInSlam(contender.id, entry, event.PartitionSize, slamId);
        if (contender.disconnected){
            Spark.getLog().debug(FormatString("{0} disconnected, so they don't get any prizes", contender.displayName));
            return;
        }
        var entryCost = event.SlamEntryCost;
        var totalPot = entryCost * event.PartitionSize;
        AwardPrizesForSlam(event.SlamPrizeSplit, totalPot, rank, contender.id);
    }

    function AwardPrizesForSlam(prizeSplits, totalPot, rank, playerId){
        LogFunctionName("AwardPrizesForSlam", null, true);
        for (var j = 0; j < prizeSplits.length; ++j){
            var split = prizeSplits[j];
            if (split.Target === rank){
                var cashFromPot = (split.PotPortion / 100) * totalPot;
                if (cashFromPot > 0){
                    Spark.getLog().debug(FormatString("Awarding ${0} to {1}", cashFromPot, Spark.loadPlayer(playerId).getDisplayName()));
                    Credit(cashFromPot, false, playerId);
                }
                var additionalPrizes = split.AdditionalPrizes;
                for (var k = 0; k < additionalPrizes.length; ++k){
                    var additionalPrize = additionalPrizes[k];
                    switch (additionalPrize.TargetPrizeType){
                        case "Cash":
                            Spark.getLog().debug(FormatString("Awarding additional ${0} to {1}", cashFromPot, Spark.loadPlayer(playerId).getDisplayName()));
                            Credit(additionalPrize.TargetPrizeValue, false, playerId);
                            break;
                        default:
                            ErrorMessage(FormatString("Unrecognised TargetPrizeType {0} for slam additional prize", additionalPrize.TargetPrizeType));
                            break;
                    }
                }
            }
        }
        LogFunctionName("AwardPrizesForSlam", null, false);
    }

    function GetRankInSlam(id, entry, partitionSize, slamId){
        LogFunctionName("GetRankInSlam", slamId, true);
        if (entry === null || entry === undefined){
            return;
        }
        UpdateContenderRankings(entry, partitionSize, slamId);
        var currentRound = entry.CurrentRound;
        var rounds = entry.Rounds;
        var matches = rounds[currentRound - 1].Matches;
        var rank = -1;
        for (var i = 0; i < matches.length; ++i){
            if (matches[i].Contender1 !== null && matches[i].Contender1.id === id){
                if (matches[i].Contender1.rank !== undefined){
                    rank = matches[i].Contender1.rank;
                    break;
                }
            }
            else if (matches[i].Contender2 !== null && matches[i].Contender2.id === id){
                if (matches[i].Contender2.rank !== undefined){
                    rank = matches[i].Contender2.rank;
                    break;
                }
            }
        }
        if (rank === -1){
            //var playerName = Spark.loadPlayer(id).getDisplayName();
            //Spark.getLog().debug(FormatString("Failed to get a rank for {0}", playerName));
        }
        LogFunctionName("GetRankInSlam", slamId, false);
        return rank;
    }

    function UpdateContenderRankings(entry, partitionSize, slamId){
        LogFunctionName("UpdateContenderRankings", slamId, true);
        if (entry === null || entry === undefined){
            return;
        }
        var rounds = entry.Rounds;
        for (var i = 0; i < rounds.length; ++i){
            var losers = [];
            var matches = rounds[i].Matches;
            for (var j = 0; j < matches.length; ++j){
                if (matches[j].Finished){
                    if (matches[j].Winner !== null && (i + 1) === entry.FinalRound){
                        if (matches[j].Contender1 !== null && matches[j].Contender1.id === matches[j].Winner.id){
                            matches[j].Contender1["rank"] = 1;
                            Spark.getLog().debug(FormatString("Assigning rank of {0} to {1}", matches[j].Contender1.rank, matches[j].Contender1.displayName));
                        }
                        else if (matches[j].Contender2 !== null && matches[j].Contender2.id === matches[j].Winner.id){
                            matches[j].Contender2["rank"] = 1;
                            Spark.getLog().debug(FormatString("Assigning rank of {0} to {1}", matches[j].Contender2.rank, matches[j].Contender2.displayName));
                        }
                    }
                    if (matches[j].Loser !== null){
                        var loser = {};
                        loser["id"] = matches[j].Loser.id;
                        loser["time"] = ((matches[j].Loser.time > 0) ? matches[j].Loser.time : Number.MAX_VALUE);
                        losers.push(loser);
                    }
                    else{
                        if (matches[j].Winner === null){
                            var loser1 = {};
                            loser1["id"] = matches[j].Contender1.id;
                            loser1["time"] = Number.MAX_VALUE;
                            losers.push(loser1);
                            var loser2 = {};
                            loser2["id"] = matches[j].Contender2.id;
                            loser2["time"] = Number.MAX_VALUE;
                            losers.push(loser2);
                        }
                    }
                }
            }
            losers.sort(function(a, b){
                return b.time - a.time; // Descending order
            });
            if (losers.length === 0){
                return;
            }
            var lastTime = losers[0].time;
            var passes = 0;
            var lastRankAssigned = matches.length * 2;
            for (var j = 0; j < losers.length; ++j){
                if (lastTime !== losers[j].time){
                    lastTime = losers[j].time;
                    lastRankAssigned -= passes;
                    passes = 0;
                }
                losers[j]["rank"] = lastRankAssigned;
                ++passes;
            }
            for (var j = 0; j < matches.length; ++j){
                for (var k = 0; k < losers.length; ++k){
                    if (matches[j].Contender1 !== null && matches[j].Contender1.id === losers[k].id && matches[j].Contender1.rank === undefined){
                        matches[j].Contender1["rank"] = losers[k].rank;
                        Spark.getLog().debug(FormatString("Assigning rank of {0} to {1}", matches[j].Contender1.rank, matches[j].Contender1.displayName));
                        break;
                    }
                    else if (matches[j].Contender2 !== null && matches[j].Contender2.id === losers[k].id && matches[j].Contender2.rank === undefined){
                        matches[j].Contender2["rank"] = losers[k].rank;
                        Spark.getLog().debug(FormatString("Assigning rank of {0} to {1}", matches[j].Contender2.rank, matches[j].Contender2.displayName));
                        break;
                    }
                }
            }
        }
        var collection = Spark.runtimeCollection("slams");
        LogFunctionName("UpdateContenderRankings", slamId, false);
    }
}

/*
Module: SlamUtilities

Called from System -> Player Disconnected. Updates the disconnecting player's current match details to specify the player has left.

playerId    [string]    - The id of the player who just disconnected
.
*/
function PlayerDisconnectedSlamUpdate(playerId){
    var player = Spark.loadPlayer(playerId);
    if (player === null || player === undefined){
        ErrorMessage(FormatString("Couldn't load player with id of {0}", playerId));
        return;
    }

    var slamId = GetCurrentSlamId(playerId);

    Spark.getLog().debug(FormatString("{0} disconnected", player.getDisplayName()));

    if (slamId !== null && slamId !== undefined){
        AtomicModify(Atomic_PlayerDisconnectedSlamUpdate, [slamId, playerId], slamId, "slams");
    }

    var versionedCurrentSlamId = GetVersionedCurrentSlamId(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        versionedCurrentSlamId.GetData();
        successfullyWritten = versionedCurrentSlamId.SetData(null);
    }

    function Atomic_PlayerDisconnectedSlamUpdate(slamId, playerId){
        var entry = RetrieveSlamData(slamId);
        if (entry !== null && entry !== undefined){
            var currentRound = entry.CurrentRound;
            var rounds = entry.Rounds;
            var matches = rounds[currentRound - 1].Matches;
            var finished = false;
            for (var i = 0; i < matches.length; ++i){
                if (matches[i].Contender1 !== null && matches[i].Contender1.id === playerId){
                    matches[i].Contender1.disconnected = true;
                    finished = matches[i].Finished;
                    break;
                }
                else if (matches[i].Contender2 !== null && matches[i].Contender2.id === playerId){
                    matches[i].Contender2.disconnected = true;
                    finished = matches[i].Finished;
                    break;
                }
            }
            if (finished){
                return null;
            }
            FinishSlamRace(entry, entry.EventName, slamId, -1, playerId, false, false);
            return entry;
        }
        return null;
    }
}

/*
Module: SlamUtilities

[DEBUG]

Sends a 'EditorVisualHelperUpdate' message to a particular client. This updates the Slam Visual Helper tool in the Unity Editor.

slamId  [string]    - The id of the slam data entry in the slams runtime collection
entry   [SlamData]  - The object containing all the slam data
.
*/
function SendEditorVisualHelperUpdate(slamId, entry){
    var visualHelpers = entry.VisualHelpers;
    if (visualHelpers !== null && visualHelpers !== undefined){
        Spark.getLog().debug("--> Sending Visual Helper Update -->");
        for (var i = 0; i < visualHelpers.length; ++i){
            var playerId = visualHelpers[i];
            Spark.sendMessageByIdExt({"slamData": entry, "slamId": slamId}, "EditorVisualHelperUpdate", [playerId]);
        }
    }
}

function SaveSlamData(slamId, entry){
    var player = Spark.getPlayer();
    if (player !== null && player !== undefined){
        //Spark.getLog().info(FormatString("{0} saving slam data [{1}], rounds count {2}", player.getDisplayName(), slamId, entry.Rounds.length));
    }
    else{
        //Spark.getLog().info(FormatString("Server saving slam data [{0}], rounds count {1}", slamId, entry.Rounds.length));
    }

    var collection = Spark.runtimeCollection("slams");
    var success = collection.update({"_id":{"$oid":slamId}}, entry);
    if (!success){
        ErrorMessage(FormatString("Failed to update slam with id {0}", slamId));
    }
}

function RetrieveSlamData(slamId){
    var player = Spark.getPlayer();
    if (player !== null && player !== undefined){
        //Spark.getLog().info(FormatString("{0} retrieved slam data [{1}]", player.getDisplayName(), slamId));
    }
    else{
        //Spark.getLog().info(FormatString("Server saving slam data [{0}]", slamId));
    }

    var collection = Spark.runtimeCollection("slams");
    var entry = collection.findOne({"_id":{"$oid":slamId}});
    if (entry === null || entry === undefined){
        ErrorMessage(FormatString("Slam data for id {0} is {1}", slamId, entry));
    }
    return entry;
}

function LogFunctionName(functionName, slamId, entered){
    var player = Spark.getPlayer();
    if (player !== null && player !== undefined){
        //Spark.getLog().info(FormatString("{0} {1} function {2} {3}", player.getDisplayName(), ((entered)? "entered" : "exited"), functionName,
        //                                (slamId !== null && slamId !== undefined && entered)? FormatString("passing in {0}", slamId) : ""));
    }
    else{
        //Spark.getLog().info(FormatString("Server {0} function {1} {2}", ((entered)? "entered" : "exited"), functionName,
        //                                (slamId !== null && slamId !== undefined && entered)? FormatString("passing in {0}", slamId) : ""));
    }
}

// Module: SlamUtilities
function GetVersionedCurrentSlamId(playerId) {
    return MakeVersionedProfile(playerId, "currentSlam", null);
}

// Module: SlamUtilities
function GetCurrentSlamId(playerId) {
    var versionedProfile = GetVersionedCurrentSlamId(playerId);

    var data = versionedProfile.GetData();

    return data;
}

// Module: SlamUtilities
function FinishedSlamRace(slamId, raceTime, skillTime, playerId, falseStart){

    AtomicModify(Atomic_FinishedSlamRace, [slamId, raceTime, skillTime, playerId, falseStart], slamId, "slams");

    function Atomic_FinishedSlamRace(slamId, raceTime, skillTime, playerId, falseStart){
        var entry = RetrieveSlamData(slamId);
        if (entry === null || entry === undefined){
            ErrorMessage(FormatString("Cannot find slam event with id {0}", slamId));
            return null;
        }
        if (!falseStart && !RaceTimeIsValid(raceTime, perfectTime)){
            ErrorMessage("Race time " + raceTime + " is not valid");
            return null;
        }
        var eventName = entry.EventName;
        if (eventName === null){
            ErrorMessage("There is no \"EventName\" data in the slam entry");
            return null;
        }
        var event = GetRaceEventDataFromMetaCollection(eventName, false, playerId);
        if (event === null){
            return null;
        }
        var isSlam = event.IsSlam;
        if (!isSlam){
            ErrorMessage(FormatString("The event {0} we finished a slam race for is not a slam!", eventName));
            return null;
        }
        var entryCost = event.SlamEntryCost;
        if (entryCost === null || entryCost === undefined){
            ErrorMessage(FormatString("The slam event {0} has no \"SlamEntryCost\" data", eventName));
            return null;
        }

        var message = "JA - commented out SLAMS updating the player skil as we need to make sure the perfect time is " +
            "the time for the full race whether it's 1 or 50 laps! And the Slam code is currently moribund";

        //LogMessage(message);
        ErrorMessage(message);

        // var perfectTime = GetPerfectTime(playerId); // JA - HACKY? - DO THIS MORE LIKE SINGLE PLAYER ... use GetRaceDetails()
        // UpdatePlayerSkill(playerId, raceTime, perfectTime, entryCost, track); // Use entry cost as the race doesn't have a normal wager
        FinishSlamRace(entry, eventName, slamId, raceTime, playerId, falseStart, false);
        return entry;
    }
}