// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("CurrencyUtilities");
requireOnce("RaceEventUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("BettingUtilities");
requireOnce("GeneralUtilities");
requireOnce("SlamUtilities");
requireOnce("XPUtilities");
requireOnce("AtomicUtilities");
requireOnce("FreeBetUtilities");
requireOnce("VersionedDocumentUtilities");
requireOnce("GameStatsUtilities");
requireOnce("AchievementUtilities");
requireOnce("TimeUtilities");
requireOnce("CollectionUtilities");

function CreateBlankRaceResultsEntryAndChargeForRace(player1Id, player2Id, wager, eventName, /*bool*/ botRace,
                                                    /*bool*/ newBettingSeries, submittedTimestamp) {
    var result = {};
    //Spark.getLog().info("CreateBlankRaceResultsEntryAndChargeForRace_v02300 START");
    //Spark.getLog().info(FormatString("player1Id {0} player2Id {1} wager {2} eventName {3} botRace {4} newBettingSeries {5} submittedTimestamp {6}",
    //                    player1Id, player2Id, wager, eventName, botRace, newBettingSeries, submittedTimestamp));

    var raceEvent = GetRaceEventsCollection(player1Id).findOne({"EventName":eventName});
    if (raceEvent === null || raceEvent === undefined) {
        ErrorMessage(FormatString("No event data exists for event {0}", eventName));
        return null;
    }
    var now = Math.floor(GetNow() / 1000);
    var currentTrack = CurrentTrackData(raceEvent, now);
    if (currentTrack === null || currentTrack === undefined) {
        SubmitAndResetBettingSeriesData(player1Id, submittedTimestamp, raceEvent);
        SubmitAndResetBettingSeriesData(player2Id, submittedTimestamp, raceEvent);
        ErrorMessage(FormatString("currentTrack is null/undefined for {0}", eventName));
        return null;
    }
    var laps = currentTrack.Laps;
    
    // Try redeeming a free bet of this value.
    var player1FreeBetRedemptionResponse = RedeemFreeBet(player1Id, wager);

    var cost = wager;
    var totalPot = 0;

    // Starting a new betting series, get the timestamps so we can pass them back to the client
    //Spark.getLog().info("*** NEW RACE ***");
    //Spark.getLog().info(FormatString("player1Id {0} player2Id {1} botRace? {2}", player1Id, player2Id, botRace));
    if (newBettingSeries) {
        submittedTimestamp = Math.floor(GetNow() / 1000);
        StartNewBettingSeries(player1Id, eventName, submittedTimestamp);
        result.timestamp = submittedTimestamp;

        if (!botRace) {
            StartNewBettingSeries(player2Id, eventName, submittedTimestamp);
        }
    }
    else {
        totalPot = GetCurrentTotalPot(player1Id, eventName, submittedTimestamp);
    }

    if (totalPot > 0) {
        cost = (wager - (totalPot / 2));
        if (cost < 0) {
            ErrorMessage(FormatString("Cost is {0}, which isn't valid! Wager is {1} and Total Pot is {2}, Timestamp {3}", cost, wager, totalPot, submittedTimestamp));
            return null;
        }
    }

    // Reset flags for false starts
    BettingSeriesNewRace(player1Id, eventName, submittedTimestamp);
    if (!botRace) {
        BettingSeriesNewRace(player2Id, eventName, submittedTimestamp);
    }

    var player1DebitOk = false;
    var player2DebitOk = false;

    if (!player1FreeBetRedemptionResponse.hasRedeemedFreeBet) {
        //Spark.getLog().info(FormatString("{0}: Original balance {1}",
        //                    Spark.loadPlayer(player1Id).getDisplayName(), Spark.loadPlayer(player1Id).getBalance1()));
        player1DebitOk = Debit(cost, false, player1Id);
        //Spark.getLog().info(FormatString("{0}: Total pot {1}, current wager {2}, race cost {3}, new balance {4}",
        //                    Spark.loadPlayer(player1Id).getDisplayName(), totalPot, wager, cost, Spark.loadPlayer(player1Id).getBalance1()));
    }
    else {
        player1DebitOk = true;
        //Spark.getLog().info(FormatString("Free bet for race for {0}", Spark.loadPlayer(player1Id).getDisplayName()));
    }

    if (!botRace) {
        var player2FreeBetRedemptionResponse = RedeemFreeBet(player2Id, wager);

        if (!player2FreeBetRedemptionResponse.hasRedeemedFreeBet) {
            //Spark.getLog().info(FormatString("{0}: Original balance {1}",
            //                Spark.loadPlayer(player2Id).getDisplayName(), Spark.loadPlayer(player2Id).getBalance1()));
            player2DebitOk = Debit(cost, false, player2Id);
            //Spark.getLog().info(FormatString("{0}: Total pot {1}, current wager {2}, race cost {3}, new balance {4}",
            //                Spark.loadPlayer(player2Id).getDisplayName(), totalPot, wager, cost, Spark.loadPlayer(player2Id).getBalance1()));
        }
        else {
            player2DebitOk = true;
            // Spark.getLog().info(FormatString("Free bet for race for {0}", Spark.loadPlayer(player2Id).getDisplayName()));
        }
    }
    else {
        player2DebitOk = true;
        //Spark.getLog().info("Opponent is a bot, so no need to debit a wager for them");
    }

    if (!player1DebitOk || !player2DebitOk) {
        ErrorMessage(FormatString("Something went wrong with debiting wagers for players - player1 ok? {0} player2 ok? {1}",
            player1DebitOk, player2DebitOk));
        return null;
    }

    if (!player1FreeBetRedemptionResponse.hasRedeemedFreeBet) {
        IncrementLifetimeCashSpend(player1Id, cost);
    }
    if (!botRace && !player2FreeBetRedemptionResponse.hasRedeemedFreeBet) {
        IncrementLifetimeCashSpend(player2Id, cost);
    }

    // Reduce durability of cars
    var player1DurabilityOk = false;
    var player2DurabilityOk = false;

    if (!GetPlayerFTUEFlag("ChosenCar", player1Id)) {
        player1DurabilityOk = true;
    }
    else {
        player1DurabilityOk = ReduceDurabilityOfCurrentCar(player1Id, laps);
        if (!player1DurabilityOk) {
            ErrorMessage(FormatString("{0}'s current car ({1}) does not have enough durability to race (or something went wrong trying to reduce durability)",
                Spark.loadPlayer(player1Id).getDisplayName(),
                GetPlayerActiveCar(player1Id).CarVariantID));
            return null;
        }
    }

    if (!botRace) {
        player2DurabilityOk = ReduceDurabilityOfCurrentCar(player2Id, laps);
        if (!player2DurabilityOk) {
            ErrorMessage(FormatString("{0}'s current car ({1}) does not have enough durability to race (or something went wrong trying to reduce durability)",
                Spark.loadPlayer(player2Id).getDisplayName(),
                GetPlayerActiveCar(player2Id).CarVariantID));
            return null;
        }
    }
    else {
        player2DurabilityOk = true;
    }

    result.playerEnteredEvent = false;
    result.opponentEnteredEvent = false;
    // Enter players into the event at this point
    result.playerEnteredEvent = EnterRaceEvent(player1Id, eventName);
    if (!botRace) {
        result.opponentEnteredEvent = EnterRaceEvent(player2Id, eventName);
    }

    // Credit race bonus here
    var raceBonus1 = CalculateRaceBonus(player1Id, wager);
    //Spark.getLog().info(FormatString("{0}: Original balance {1}",
    //                        Spark.loadPlayer(player1Id).getDisplayName(), Spark.loadPlayer(player1Id).getBalance1()));
    Credit(raceBonus1, false, player1Id);
    IncrementLifetimeWinnings(player1Id, raceBonus1);
    //Spark.getLog().info(FormatString("{0}: got race bonus of {1} at race start, new balance {2}",
    //                                    Spark.loadPlayer(player1Id).getDisplayName(), raceBonus1, Spark.loadPlayer(player1Id).getBalance1()));
    SubmitToLeaderboard(player1Id, eventName, raceBonus1, 0, 0);

    if (!botRace) {
        var raceBonus2 = CalculateRaceBonus(player2Id, wager);
        //Spark.getLog().info(FormatString("{0}: Original balance {1}",
        //                        Spark.loadPlayer(player2Id).getDisplayName(), Spark.loadPlayer(player2Id).getBalance1()));
        Credit(raceBonus2, false, player2Id);
        IncrementLifetimeWinnings(player2Id, raceBonus2);
        //Spark.getLog().info(FormatString("{0}: got race bonus of {1} at race start, new balance {2}",
        //                                    Spark.loadPlayer(player2Id).getDisplayName(), raceBonus2, Spark.loadPlayer(player2Id).getBalance1()));
        SubmitToLeaderboard(player2Id, eventName, raceBonus2, 0, 0);
    }

    var collection = Spark.runtimeCollection("raceResults");
    var now = GetNow();
    var newEntry = {
        "startTime": now,
        "wager": wager,
        "eventName": eventName,
        "botRace": botRace,
        "laps": laps,
        "race": [
            {"playerId":player1Id, "time": -1, "falseStart": false},
            ]
        };

    if (!botRace) {
        newEntry.race.push({"playerId":player2Id, "time": -1, "falseStart": false});
    }

    var success = collection.insert(newEntry);
    if (!success) {
        ErrorMessage("\"collection.insert\" failed for the raceResults collection");
        return null;
    }

    var entryId = newEntry._id.$oid;
    result.entryId = entryId;

    SetBettingSeriesLastRaceResultId(player1Id, entryId);
    if (!botRace) {
        SetBettingSeriesLastRaceResultId(player2Id, entryId);
    }

    return result;
}

function FinishedRaceFalseStart(serverResultId, falseStarterId, nonFalseStarterId, botRace, submittedTimestamp) {
    if (botRace){
        var playerId = Spark.getPlayer().getPlayerId();

        var collection = Spark.runtimeCollection("raceResults");
        var entry = collection.findOne({"_id":{"$oid":serverResultId}});
        if (entry === null || entry === undefined) {
            ErrorMessage("We've finished a race but the runtime collection entry has vanished");
            //TODO Perhaps create a new blank one...?
            return;
        }

        var wager = entry.wager;
        if (wager === null || wager === undefined) {
            ErrorMessage("There is no \"wager\" data in the race results entry");
            return;
        }

        var eventName = entry.eventName;
        if (eventName === null || eventName === undefined) {
            ErrorMessage("There is no \"eventName\" data in the race results entry");
            return null;
        }

        var laps = entry.laps;
        if (laps === null || laps === undefined) {
            ErrorMessage("There is no \"laps\" data in the race results entry");
            return null;
        }

        var won = (nonFalseStarterId === playerId);
        UpdateBettingSeriesData(playerId, submittedTimestamp, eventName, (wager * 2), won, /*time*/-1, /*falseStarted*/!won);
        RefundCarDurabilityForCurrentCar(playerId, laps);

        AddBalancesToResponse(playerId);
        AddActiveCarDurabilityToResponse(playerId);
        RemoveRaceResultsEntry(serverResultId);
        AddRaceStatsToResponse(playerId, null);
        AddLifetimeWinningsToResponse(playerId);
    }
    else {
        // Human vs Human
        var outputData = {};
        var modified = AtomicModify(Atomic_FinishedRaceFalseStart, [serverResultId, falseStarterId, outputData], serverResultId, "raceResults");
        //Spark.getLog().info(FormatString("{0}: Client sent false start message", Spark.loadPlayer(falseStarterId).getDisplayName()));
        if (!modified) {
            ErrorMessage("AtomicModify(Atomic_FinishedRaceFalseStart) could not modify the data, and should have recorded an error.");
            return;
        }

        if (outputData === null || outputData === undefined || outputData === {}){
            ErrorMessage("We were expecting output data in \"FinishedRaceFalseStart\" Atomic Function \"Atomic_FinishedRaceFalseStart\"");
            return;
        }

        var wager = outputData.wager;
        var eventName = outputData.eventName;
        var laps = outputData.laps;

        //Spark.getLog().info(FormatString("#2 nonFalseStarterId {0}", nonFalseStarterId));

        if (outputData.falseStartAlreadyOccurred !== null && outputData.falseStartAlreadyOccurred !== undefined) {
            // Both players false started, so both have lost
            // However, when the first false starter went throught this logic they will have assumed the other player did not false start
            // and won the race, so the betting series data will be off
            //Spark.getLog().info(FormatString("{0}: False start, but our opponent false started too! Discard total pot", Spark.loadPlayer(falseStarterId).getDisplayName()));
            FalseStartResetWinningsAndUpdateTotalPot(falseStarterId, eventName, submittedTimestamp, 0);
            FalseStartResetWinningsAndUpdateTotalPot(nonFalseStarterId, eventName, submittedTimestamp, 0);

            AddBalancesToResponse(falseStarterId);
            AddActiveCarDurabilityToResponse(falseStarterId);
            AddRaceStatsToResponse(falseStarterId);
            AddLifetimeWinningsToResponse(falseStarterId);

            RemoveRaceResultsEntry(serverResultId);
        }
        else {
            //Spark.getLog().info(FormatString("{0}: False start!", Spark.loadPlayer(falseStarterId).getDisplayName()));
            var totalPot = wager * 2;
            FalseStartResetWinningsAndUpdateTotalPot(falseStarterId, eventName, submittedTimestamp, totalPot);
            // This updates the betting series data of the player who DIDN'T false start, hence the falseStarted: false.
            UpdateBettingSeriesData(nonFalseStarterId, submittedTimestamp, eventName, totalPot, /*won*/true, /*time*/-1, /*falseStarted*/false);

            RefundCarDurabilityForCurrentCar(falseStarterId, laps);
            RefundCarDurabilityForCurrentCar(nonFalseStarterId, laps);

            AddActiveCarDurabilityToResponse(falseStarterId);
            AddBalancesToResponse(falseStarterId);
            AddRaceStatsToResponse(falseStarterId);

            // Data for non-false-starter
            var dataObject = {};
            dataObject.serverResultId = serverResultId;
            AddBalancesToResponse(nonFalseStarterId, dataObject);
            AddActiveCarDurabilityToResponse(nonFalseStarterId, dataObject);
            AddRaceStatsToResponse(nonFalseStarterId, dataObject);
            AddLifetimeWinningsToResponse(nonFalseStarterId);

            Spark.sendMessageByIdExt(dataObject, "FalseStart", [nonFalseStarterId]);
        }
    }

    function Atomic_FinishedRaceFalseStart(serverResultId, falseStarterId, outputData) {
        var collection = Spark.runtimeCollection("raceResults");
        var entry = collection.findOne({"_id":{"$oid":serverResultId}});
        if (entry === null || entry === undefined) {
            ErrorMessage("We've finished a race but the runtime collection entry has vanished");
            //TODO Perhaps create a new blank one...?
            return;
        }

        var wager = entry.wager;
        if (wager === null || wager === undefined) {
            ErrorMessage("There is no \"wager\" data in the race results entry");
            return;
        }
        outputData.wager = wager;

        var eventName = entry.eventName;
        if (eventName === null || eventName === undefined) {
            ErrorMessage("There is no \"eventName\" data in the race results entry");
            return null;
        }
        outputData.eventName = eventName;

        var laps = entry.laps;
        if (laps === null || laps === undefined) {
            ErrorMessage("There is no \"laps\" data in the race results entry");
            return null;
        }
        outputData.laps = laps;

        var raceEntries = entry.race;
        if (raceEntries === null || raceEntries === undefined) {
            ErrorMessage("There is no \"race\" data in the race results entry");
            return null;
        }

        var falseStartAlreadyRecorded = false;
        for (var i = 0; i < raceEntries.length; ++i){
            var playerEntry = raceEntries[i];
            if (playerEntry.falseStart){
                falseStartAlreadyRecorded = true;
            }
        }

        if (falseStartAlreadyRecorded){
            outputData.falseStartAlreadyOccurred = true;
        }

        for (var i = 0; i < raceEntries.length; ++i){
            var playerEntry = raceEntries[i];
            if (playerEntry.playerId === falseStarterId){
                playerEntry.falseStart = true;
            }
        }

        return entry;
    }
}

function FinishedBotRaceAndUpdateSkill(serverResultId, raceTime, skillTime, averageCornerScore, playerId, won, submittedTimestamp){
    // LogMessage(FormatString("#2 raceTime: {0}, skillTime {1}", raceTime, skillTime));
    // Spark.getLog().info(FormatString("#2 raceTime: {0}, skillTime {1}", raceTime, skillTime));

    var outputData = {};
    var modified = AtomicModify(Atomic_FinishedRace, [serverResultId, raceTime, skillTime, averageCornerScore, playerId, true, outputData], serverResultId, "raceResults");

    // Data won't be modified
    if (!modified) {
        ErrorMessage("AtomicModify(Atomic_FinishedRace) could not modify the data, and should have recorded an error.");
        return;
    }

    if (outputData === null || outputData === undefined || outputData === {}){
        ErrorMessage("We were expecting output data in \"FinishedRace_v01300\" Atomic Function \"Atomic_FinishedRace\"");
        return;
    }

    var player = Spark.loadPlayer(playerId);
    var playerVersion = player.getSegmentValue("VERSION");

    if (!VersionIsOlder(playerVersion, "0.20.0")) {
        UpdatePlayerSkill(playerId, raceTime, outputData.perfectTime, outputData.wager, outputData.track, outputData.carClass);
    }
    else {
        Spark.getLog().warn("your client is too old: skipping player skill update #1");
    }

    RemoveRaceResultsEntry(serverResultId);
    SendRaceResultAndUpdateBettingSeries(playerId, won, raceTime, -1, -1, outputData.wager, outputData.eventName, serverResultId, /*isSlam*/false, /*botRace*/true, submittedTimestamp);

    AddRaceStatsToResponse(playerId);
    AddBalancesToResponse(playerId);
    AddActiveCarDurabilityToResponse(playerId);
    AddLifetimeWinningsToResponse(playerId);
}

function FinishedRaceAndUpdateSkill(serverResultId, raceTime, skillTime, averageCornerScore, playerId, /*bool*/ botRace, submittedTimestamp){
    // LogMessage(FormatString("raceTime: {0}, skillTime {1}", raceTime, skillTime));
    // Spark.getLog().info(FormatString("raceTime: {0}, skillTime {1}", raceTime, skillTime));
    //Spark.getLog().debug(FormatString("FinishedRaceAndUpdateSkill_v02201 timestamp {0}", submittedTimestamp));

    var outputData = {};
    var modified = AtomicModify(Atomic_FinishedRace, [serverResultId, raceTime, skillTime, averageCornerScore, playerId, botRace, outputData], serverResultId, "raceResults");

    if (!modified) {
        if (Spark.hasScriptErrors()) {
            ErrorMessage("AtomicModify(Atomic_FinishedRaceAndUpdateSkill) could not modify the data, and should have recorded an error.");
        }
        else {
            // If we get here our raceResultEntry was probably deleted, meaning we took too long in the race
            // Award race bonus and send a "lose" message
            Spark.getLog().info(FormatString(
                "{0}: Finished a race but the raceResultEntry data was unmodified - chances are they took too long to complete the race",
                Spark.loadPlayer(playerId).getDisplayName()));
            IncrementRaces(playerId);
            var raceBonus = CalculateRaceBonus(playerId, outputData.wager);
            SendRaceFinishedMessageToClient(Spark.loadPlayer(playerId), false, -1, -1, -1, serverResultId, raceBonus);
        }

        return;
    }

    if (outputData === null || outputData === undefined || outputData === {}){
        ErrorMessage("We were expecting output data in \"FinishedRace_v01300\" Atomic Function \"Atomic_FinishedRace\"");
        return;
    }

    var player = Spark.loadPlayer(playerId);
    var playerVersion = player.getSegmentValue("VERSION");

    if (!VersionIsOlder(playerVersion, "0.20.0")) {
        UpdatePlayerSkill(playerId, raceTime, outputData.perfectTime, outputData.wager, outputData.track, outputData.carClass);
    }
    else {
        Spark.getLog().warn("your client is too old: skipping player skill update #1");
    }

    // We've updated the collection so now can check if both players have entered a time
    // If we both have then the race is over and we can decide a winner
    // If not and we are the first to finish we can set a scheduled function and wait for a bit
    if (outputData.opponentRaceTime === -1) {
        // Opponent hasn't finished, lets schedule a function
        const delay = 5;
        Spark.getScheduler().inSeconds("Schedule_EndRaceTimeout", delay,
            {
                playerId: playerId,
                serverResultId: serverResultId,
                isSlam: false,
                submittedTimestamp: submittedTimestamp
            });
    }
    else {
        var isSlam = false;
        // We've both finished, server decides the winner
        DecideResults(raceTime, outputData.opponentRaceTime, averageCornerScore, outputData.opponentAverageCornerScore,
            playerId, outputData.opponentId, outputData.wager, outputData.eventName, serverResultId, isSlam, botRace, submittedTimestamp);

        RemoveRaceResultsEntry(serverResultId);
    }
}

function Atomic_FinishedRace(serverResultId, raceTime, skillTime, averageCornerScore, playerId, /*bool*/ botRace, outputData) {
    var collection = Spark.runtimeCollection("raceResults");
    var entry = collection.findOne({"_id":{"$oid":serverResultId}});
    var endRaceTimeout = 5;

    var player = Spark.loadPlayer(playerId);

    // Spark.getLog().info(FormatString("raceTime {0} skillTime {1} for {2}", raceTime, skillTime, player.getDisplayName()));

    if (entry === null || entry === undefined) {
        ErrorMessage("We've finished a race but the runtime collection entry has vanished");
        //TODO Perhaps create a new blank one...?
        return null;
    }

    var wager = entry.wager;
    if (wager === null || wager === undefined) {
        ErrorMessage("There is no \"wager\" data in the race results entry");
        return null;
    }
    outputData.wager = wager;

    var eventName = entry.eventName;
    if (eventName === null || eventName === undefined) {
        ErrorMessage("There is no \"eventName\" data in the race results entry");
        return null;
    }
    outputData.eventName = eventName;

    var raceEntries = entry.race;
    if (raceEntries === null || raceEntries === undefined) {
        ErrorMessage("There is no \"race\" data in the race results entry");
        return null;
    }

    if (entry.botRace === null || entry.botRace === undefined) {
        ErrorMessage("There is no \"botRace\" data in the race results entry");
        return null;
    }

    if (entry.botRace !== botRace) {
        ErrorMessage(FormatString(
            "Values for botRace at the start and end of the race do not match: {0} & {1}",
            entry.botRace,
            botRace));

        return null;
    }

    if (!((raceEntries.length === 2 && !botRace) || (raceEntries.length === 1 && botRace))) {
        if (botRace) {
            ErrorMessage(FormatString(
                "There should be 1 entry in the race results for a botRace, but there is {0} instead",
                raceEntries.length));
        }
        else {
            ErrorMessage(FormatString(
                "There should be 2 entries in the race results for multiplayer race, but there is {0} instead",
                raceEntries.length));
        }

        return null;
    }

    if (!RaceTimeIsValid(raceTime)) {
        ErrorMessage("Race time " + raceTime + " is not valid");
        return null;
    }

    var raceDetails = GetRaceDetails(playerId);
    outputData.perfectTime = raceDetails.PerfectCurrentTime;
    outputData.track = raceDetails.Track;
    outputData.carClass = raceDetails.CarClass;

    //Spark.getLog().info(FormatString("Retrieving perfect time of {0} for {1}", raceDetails.PerfectCurrentTime, player.getDisplayName()));

    outputData.opponentRaceTime = -1;

    for (var i = 0; i < raceEntries.length; ++i){
        var playerEntry = raceEntries[i];
        if (playerEntry.playerId === playerId){
            playerEntry.time = raceTime;
            playerEntry.averageCornerScore = averageCornerScore;
        }
        else{
            // Opponent entry
            outputData.opponentRaceTime = playerEntry.time;
            outputData.opponentAverageCornerScore = playerEntry.averageCornerScore;
            outputData.opponentId = playerEntry.playerId;
        }
    }

    return entry;
}

function GetSkillData(skillObj) {
    var retval = {}
    //Spark.getLog().debug(skillObj);
    retval.skill = skillObj.skill;
    retval.raceCount = skillObj.raceCount;

    return retval;
}

// Module: RaceUtilities.
// Adds the balances to either ScriptData or ScriptError
function AddSkillStatsToResponse(playerId, track, carClass) {
    var stats = GetPlayerStats(playerId);

    if (!stats.trackSkills) {
        // LogMessage("No trackSkills object");
        // Spark.getLog().debug("No trackSkills object");
        stats.trackSkills = {};
    }
    var trackSkill = stats.trackSkills[track];

    var classSkill = undefined;
    if (trackSkill) {
        var carClasses = trackSkill.carClasses;
        if (carClasses) {
            classSkill = carClasses[carClass];
        }
    }


    Spark.setScriptData("skill", stats.skill);
    if (trackSkill) {
        Spark.setScriptData("trackSkill", GetSkillData(trackSkill));
        if (classSkill) {
            Spark.setScriptData("classSkill", GetSkillData(classSkill))
        }
    }
    Spark.setScriptData("raceCount", stats.raceCount);
    Spark.setScriptData("averageBet", stats.averageBet)
}

// kept in sync with SessionManager.WorstSkill on the client via GetSkillConfig()
function GetWorstSkill() {
    return 1.25;
}

// Module: RaceUtilities.
function UpdatePlayerSkill(playerId, raceTime, perfectTime, wager, track, carClass){
    if (track === null || wager === track){
        ErrorMessage("UpdatePlayerSkill: track must be supplied");
        return;
    }
    if (wager === null || wager === undefined){
        ErrorMessage("UpdatePlayerSkill: wager must be supplied");
        return;
    }
    if (perfectTime === null || perfectTime === undefined){
        ErrorMessage("UpdatePlayerSkill: perfectTime must be supplied");
        return;
    }
    if (raceTime === null || raceTime === undefined) {
        ErrorMessage(FormatString("UpdatePlayerSkill: raceTime must be supplied: {0}", raceTime));
        return;
    }

    if (typeof raceTime !== "number") {
        ErrorMessage(FormatString("UpdatePlayerSkill: raceTime must be of type 'number': {0}", raceTime));
        return;
    }

    if (typeof perfectTime !== "number") {
        ErrorMessage(FormatString("UpdatePlayerSkill: perfectTime must be of type 'number': {0}", perfectTime));
        return;
    }

    if (typeof track !== "string") {
        ErrorMessage(FormatString("UpdatePlayerSkill: wager must be of type 'string': {0}", wager));
        return;
    }

    if (typeof wager !== "number") {
        ErrorMessage(FormatString("UpdatePlayerSkill: wager must be of type 'number': {0}", wager));
        return;
    }

    if (raceTime <= 0) {
        ErrorMessage(FormatString("UpdatePlayerSkill: raceTime must > 0!: {0}", raceTime));
        return;
    }

    if (perfectTime <= 0) {
        ErrorMessage(FormatString("UpdatePlayerSkill: perfectTime must > 0!: {0}", perfectTime));
        return;
    }

    if (wager < 25) {
        if (GetPlayerFTUEFlag("WagersEnabled", playerId)) {
            Spark.getLog().error(FormatString("UpdatePlayerSkill(playerId: {0}, raceTime: {1}, perfectTime: {2}, wager: {3}) : wager is < 25, hard setting to 25. WagersEnabled is set in the FTUE. WTF?!",
                playerId,
                raceTime,
                perfectTime,
                wager));
        }

        wager = 25;
    }

    var gameVersion = Spark.loadPlayer(playerId).getSegmentValue("VERSION");

    // Calculate
    var skillThisRace = raceTime / perfectTime;

    // LogMessage(FormatString("UpdatePlayerSkill(yourTime: {0}, perfectTime: {1}, skillThisRace: {2}, behind by: {3}, betThisRace: {4})",
    //     raceTime,
    //     perfectTime,
    //     skillThisRace,
    //     raceTime - perfectTime,
    //     wager));

    if (skillThisRace < 1.0) {
        Spark.getLog().error(FormatString("skillThisRace {0} < 1.0, version: {1}, raceTime: {2}, perfectTime: {3}, wager: {4}",
            skillThisRace,
            gameVersion,
            raceTime,
            perfectTime,
            wager));
    }
    // else if (skillThisRace > 1.4) { // more likely to be an error in counting laps than anything else
    //    Spark.getLog().warn(FormatString("skillThisRace {0} > {1} (really awful), version: {2}, raceTime: {3}, perfectTime: {4}, wager: {5}",
    //        skillThisRace,
    //        1.4,
    //        gameVersion,
    //        raceTime,
    //        perfectTime,
    //        wager));
    // }

    // Assumed to be an attempt at gaming the skill calculation, so don't update the skill in this case. Considered safe as anyone
    // actually playing that badly will never win against the AI. The only way is up!
    else if (skillThisRace > GetWorstSkill()) {
        Spark.getLog().warn(FormatString("skillThisRace {0} > {1} (our clamp), DISCARDING! version: {2}, raceTime: {3}, perfectTime: {4}, wager: {5}",
           skillThisRace,
           GetWorstSkill(),
           gameVersion,
           raceTime,
           perfectTime,
           wager));

        return;
    }
    else {
        // Spark.getLog().info(FormatString("skillThisRace {0} OK, version: {1}, raceTime: {2}, perfectTime: {3}, wager: {4}",
        //     skillThisRace,
        //     gameVersion,
        //     raceTime,
        //     perfectTime,
        //     wager));
    }

    skillThisRace = Math.min(GetWorstSkill(), skillThisRace);

    var versionedProfile = GetVersionedPlayerStats(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var stats = versionedProfile.GetData();

        // LogMessage(FormatString("UpdatePlayerSkill(): completedRaces: {0}, averageBet: {1}, skillThisRace: {2}",
        //     stats.raceCount,
        //     stats.averageBet,
        //     skillThisRace));

        var betWeighting = (stats.averageBet <= 0) ? 1.0 : Math.sqrt(wager / stats.averageBet);
        stats.averageBet = ((stats.averageBet * stats.raceCount) + wager) / (stats.raceCount + 1);

        CalculateNewSkill(stats, skillThisRace, betWeighting, gameVersion, "global");

        if (stats.trackSkills === null || stats.trackSkills === undefined) {
            //LogMessage("Creating trackSkills dictionary");
            stats.trackSkills = {};
        }
        var trackSkill = stats.trackSkills[track];
        if (trackSkill === null || trackSkill === undefined) {
            // LogMessage(FormatString("Creating trackSkill object for {0}", track));
            trackSkill = {};
            trackSkill.raceCount = 0;
            trackSkill.skill = stats.skill;
            stats.trackSkills[track] = trackSkill;
        }

        // LogMessage(FormatString("UpdatePlayerSkill(): completedRaces: {0}, track: {1}, skillThisRace: {2}, globalSkill: {3}",
        //     trackSkill.raceCount,
        //     track,
        //     skillThisRace,
        //     stats.skill));

        CalculateNewSkill(trackSkill, skillThisRace, betWeighting, gameVersion, track);

        if (carClass) {
            var carClasses = trackSkill.carClasses;
            if (!carClasses) {
                carClasses = {};
                trackSkill.carClasses = carClasses;
            }
            var classSkill = carClasses[carClass];
            if (!classSkill) {
                classSkill = {};
                carClasses[carClass] = classSkill;
                classSkill.raceCount = 0;
                classSkill.skill = trackSkill.skill;
            }

            CalculateNewSkill(classSkill, skillThisRace, betWeighting, gameVersion, track);
        }

        successfullyWritten = versionedProfile.SetData(stats);
    }
}

function GetSkillObject(stats, track, carClass)
{
    if (!track || !stats.trackSkills) {
        //Spark.getLog().info("no track or trackskills array.");
        return stats;
    }
    var trackSkill = stats.trackSkills[track];
    if (!trackSkill) {
        //Spark.getLog().info("no matching track skill.");
        return stats;
    }
    if (!carClass || !trackSkill.carClasses) {
        //Spark.getLog().info("no event class or event class array.");
        return trackSkill;
    }
    var carClass = trackSkill.carClasses[carClass];
    if (!carClass) {
        //Spark.getLog().info("no matching event class.");
        return trackSkill;
    }
    //Spark.getLog().info("Returning appropriate track / class.");
    return carClass;
}


function SetSkillObject(stats, track, carClass, skillObject)
{
    if (!track) {
        stats.skill = skillObject.skill;
        stats.raceCount = skillObject.raceCount;
        return;
    }
    if (!stats.trackSkills) {
        stats.trackSkills = {};
    }
    var trackSkill = stats.trackSkills[track];
    if (!trackSkill) {
        trackSkill = {};
        stats.trackSkills[track] = trackSkill;
    }
    if (!carClass) {
        trackSkill.skill = skillObject.skill;
        trackSkill.raceCount = skillObject.raceCount;
        return;
    }
    if (!trackSkill.carClasses) {
        trackSkill.carClasses = {};
    }
    var eventSkill = trackSkill.carClasses[carClass];
    if (!eventSkill) {
        eventSkill = {};
        trackSkill.carClasses[carClass] = eventSkill;
    }
    eventSkill.skill = skillObject.skill;
    eventSkill.raceCount = skillObject.raceCount;

}

function CalculateNewSkill(stats, skillThisRace, betWeighting, gameVersion, track) {

    // clamp relative to the current skill ...
    const worstRelativeSkill = 1.04;

    var relativeSkillLimit = stats.skill * worstRelativeSkill;

    var skillToUse = Math.min(relativeSkillLimit, skillThisRace);

    var newRaceCount = stats.raceCount + 1;
    var racesCompletedWeighting = 1.0 / Math.sqrt(newRaceCount);
    var totalWeighting = Math.min(1, (betWeighting * racesCompletedWeighting));
    var newSkill = Math.min(GetWorstSkill(), stats.skill + totalWeighting * (skillToUse - stats.skill));

    // LogMessage(FormatString("OldSkill: {0}  NewSkill: {1}  BetWeighting: {2}  RacesWeigting: {3}  TotalWeighting: {4}  Race Count: {5}",
    //     stats.skill,
    //     newSkill,
    //     betWeighting,
    //     racesCompletedWeighting,
    //     totalWeighting,
    //     newRaceCount));

    if (skillThisRace > relativeSkillLimit) {
        Spark.getLog().warn(FormatString(
            "skillThisRace {0} > {1} (= {2} * {3} (oldSkill)) (relative clamp), used: {4}, newSkill: {5}, version: {6}, track: {7}, betWeighting: {8}",
            skillThisRace,
            relativeSkillLimit,
            worstRelativeSkill,
            stats.skill,
            skillToUse,
            newSkill,
            gameVersion,
            track,
            betWeighting));
    }

    stats.skill = newSkill;
    stats.raceCount = newRaceCount;
}

// Returns true if the race time passes all the sanity checks
function RaceTimeIsValid(raceTime, perfectTime) {
    if (raceTime < 0) {
        return false;
    }

    return true;
}

function DecideResults(raceTime, opponentRaceTime, averageCornerScore, opponentAverageCornerScore, playerId, opponentId, wager, eventName,
                        serverResultId, isSlam, botRace, submittedTimestamp){
    //Spark.getLog().debug(FormatString("DecideResults_v02201 timestamp {0}", submittedTimestamp));

    // First check the validity of the race times (don't want cheaters!)
    var playerTimeOkay = RaceTimeIsValid(raceTime);
    var opponentTimeOkay = RaceTimeIsValid(opponentRaceTime);

    if (!playerTimeOkay && !opponentTimeOkay){
        // Both players cheated
        SendRaceResultAndUpdateBettingSeries(playerId, /*won*/false, -1, -1, opponentAverageCornerScore, wager, eventName, serverResultId, isSlam, botRace, submittedTimestamp);
        SendRaceResultAndUpdateBettingSeries(opponentId, false, -1, -1, averageCornerScore, wager, eventName, serverResultId, isSlam, botRace, submittedTimestamp);
    }
    else if (!playerTimeOkay && opponentTimeOkay){
        // We cheated
        SendRaceResultAndUpdateBettingSeries(playerId, false, -1, opponentRaceTime, opponentAverageCornerScore, wager, eventName, serverResultId, isSlam, botRace, submittedTimestamp);
        SendRaceResultAndUpdateBettingSeries(opponentId, true, opponentRaceTime, -1, averageCornerScore, wager, eventName, serverResultId, isSlam, botRace, submittedTimestamp);
    }
    else if (playerTimeOkay && !opponentTimeOkay){
        // Opponent cheated
        SendRaceResultAndUpdateBettingSeries(playerId, true, raceTime, -1, opponentAverageCornerScore, wager, eventName, serverResultId, isSlam, botRace, submittedTimestamp);
        SendRaceResultAndUpdateBettingSeries(opponentId, false, -1, raceTime, averageCornerScore, wager, eventName, serverResultId, isSlam, botRace, submittedTimestamp);
    }
    else{
        // Both times are okay, send the race results
        // For an exact draw we really can't pay both winning for economic reasons, and this isn't likely, so pick one.
        SendRaceResultAndUpdateBettingSeries(playerId, (raceTime <= opponentRaceTime), raceTime, opponentRaceTime, opponentAverageCornerScore, wager, eventName, serverResultId, isSlam, botRace, submittedTimestamp);
        SendRaceResultAndUpdateBettingSeries(opponentId, !(raceTime <= opponentRaceTime), opponentRaceTime, raceTime, averageCornerScore, wager, eventName, serverResultId, isSlam, botRace, submittedTimestamp);
    }
}

function SendRaceResultAndUpdateBettingSeries(playerId, won, ourTime, opponentTime, opponentAverageCornerScore, wager, eventName,
                                        serverResultId, isSlam, botRace, submittedTimestamp) {
    //Spark.getLog().debug(FormatString("SendRaceResultAndCreditWinnings timestamp {0}", submittedTimestamp));
    var player = Spark.loadPlayer(playerId);
    if (player !== null){
        if (!isSlam){
            //Spark.getLog().debug("Update betting series");
            UpdateBettingSeriesData(playerId, submittedTimestamp, eventName, (wager * 2), won, ourTime, /*falseStarted*/false);
        }

        //Spark.getLog().info(FormatString("Sending RaceFinished message to {0}: won {1}, time {2}",
        //                                     player.getDisplayName(), won, ourTime));

        if (!botRace){
            var raceBonus = CalculateRaceBonus(playerId, wager);
            SendRaceFinishedMessageToClient(player, won, ourTime, opponentTime, opponentAverageCornerScore, serverResultId, raceBonus);
        }
    }
}

function SendRaceFinishedMessageToClient(player, won, ourTime, opponentTime, opponentAverageCornerScore, serverResultId, raceBonus) {
    var playerId = player.getPlayerId();

    var stats = GetPlayerStats(playerId);
    var skill = stats.skill;

    var raceDetails = GetRaceDetails(playerId);
    var perfectTime = raceDetails.PerfectCurrentTime;

    var activeCar = GetPlayerActiveCar(playerId);

    if (activeCar !== null && activeCar !== undefined) {
        var dataObject = {};
        dataObject.won = won;
        dataObject.raceBonus = raceBonus;
        dataObject.ourTime = ourTime;
        dataObject.opponentTime = opponentTime;
        dataObject.opponentAverageCornerScore = opponentAverageCornerScore;
        dataObject.serverResultId = serverResultId;
        dataObject.skill = skill;
        dataObject.perfectTime = perfectTime;

        AddBalancesToResponse(playerId, dataObject);
        AddActiveCarDurabilityToResponse(playerId, dataObject);
        AddRaceStatsToResponse(playerId, dataObject);
        AddLifetimeWinningsToResponse(playerId);

        Spark.sendMessageExt(dataObject, "RaceFinished", player);
    }
    else {
        Spark.getLog().warn(FormatString("Can not send RaceFinished message to {0}: won {1}, time {2} as she has no cars",
            player.getDisplayName(), won, ourTime));
    }
}

function RemoveRaceResultsEntry(serverResultId){
    var collection = Spark.runtimeCollection("raceResults");
    var entry = collection.findOne({"_id":{"$oid":serverResultId}});
    if (entry !== null && entry !== undefined){
        var success = collection.remove(entry);
        if (!success){
            ErrorMessage("Failed to remove the race result from the race results runtime collection");
        }
    }
}

// Module: RaceUtilities
// Calculates the bonus the player will receive on completion of a race at the specified wager.
function CalculateRaceBonus(playerId, wager) {
    // New Race Bonus awards money depending on level and wager.
    // Each wager has a bonus cap and a level it reaches this cap.
    var player = Spark.loadPlayer(playerId);
    if (player === null || player === undefined){
        return 0;
    }

    var xpInfo = GetXPInfo(player);
    var betData = GetBetDataCollection(playerId).find().toArray();
    var finalRaceBonus = betData[0].RaceBonusByLevel[0]; // Minimum bonus by default.

    for (var i = 0; i < betData.length; i++) {
        if (wager >= betData[i].BetAmount) {
            var raceBonusIndex = Clamp(xpInfo.Level - 1, 0, betData[i].RaceBonusByLevel.length - 1);
            finalRaceBonus = betData[i].RaceBonusByLevel[raceBonusIndex];
        }
    }

    return finalRaceBonus;
}

function AddRaceStatsToResponse(playerId, dataObject){
    var lifetimeWinRate = GetLifetimeWinRate(playerId);
    // We can add all the most up-to-date stats here for races, such as lifetime win rate, current event win rate etc.
    if (dataObject === null || dataObject === undefined){
        if (Spark.hasScriptErrors()) {
            Spark.setScriptError("lifetimeWinRate", lifetimeWinRate);
        }
        else {
            Spark.setScriptData("lifetimeWinRate", lifetimeWinRate);
        }
    }
    else{
        dataObject.lifetimeWinRate = lifetimeWinRate;
    }
}

// Module: RaceUtilities. Deprecated - now removed at login.
function GetVersionedPerfectTime(playerId) {
    return MakeVersionedProfile(playerId, "perfectTime", 0);
}

// Module: RaceUtilities
function GetVersionedRaceDetails(playerId) {
    return MakeVersionedProfile(playerId, "raceDetails", {});
}

// Module: RaceUtilities
function GetRaceDetails(playerId) {
    var versionedProfile = GetVersionedRaceDetails(playerId);

    var data = versionedProfile.GetData();

    return data;
}