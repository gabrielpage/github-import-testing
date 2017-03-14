// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("AchievementUtilities");
requireOnce("EventPrizeUtilities");
requireOnce("GameStatsUtilties");
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("RaceEventScheduleUtilities");
requireOnce("RaceEventUtilities");
requireOnce("RaceUtilities");
requireOnce("TimeUtilities");
requireOnce("UpgradeUtilities");

// Module: PrizeUtilities.
// Check if the player has won any top-down prizes since we last checked and put them in the unawarded list if they have.
function CheckIfPlayerWonATopDownPrize(playerId, versionedProfile, eventData, eventName, gameStats) {
    if (eventData.topDownPrizesAddedToUnawarded === true) {
        return;
    }

    var challengeId = eventData.challengeId;
    if (challengeId === null || challengeId === undefined) {
        Spark.getLog().error(FormatString("CheckIfPlayerWonATopDownPrize() trying to award TopDown prizes for event " +
            "{0}, but the challengeId is missing! previewChallengeId: {1}, challengeEndDate: {2}",
            eventName,
            eventData.previewChallengeId,
            eventData.challengeEndDate));
        return;
    }

    var challenge = Spark.systemCollection("challengeInstance").findOne({"_id":{"$oid":challengeId}}, {"endDate":1, "challengeName":1});
    var endDate = challenge.endDate;
    var now = GetNow();
    if (now < endDate) {
        Spark.getLog().error(FormatString("CheckIfPlayerWonATopDownPrize() trying to award TopDown prizes for event " +
            "{0}, challengeId: {1} but the endDate is in the future!? challengeEndDate: {2}",
            eventName,
            challengeId,
            endDate));
        // Challenge isn't over yet so we can't award a top down prize
        return;
    }
    //Spark.getLog().info(FormatString("CheckIfPlayerWonATopDownPrize: challengeId {0}", challengeId));
    var playerEntry = GetPlayerLeaderboardEntry(playerId, challengeId, challenge.challengeName, 0);

    if (playerEntry === "ChallengeDoesNotExist") {
        Spark.getLog().warn(FormatString("PrizeUtilities: Player {0} ({1}) tried to query the leaderboard of a non-existent challenge ({2})?! Removing data for that challenge from their profile.",
            Spark.loadPlayer(playerId).getDisplayName(), playerId, challengeId));
        return "remove";
    }
    else if (playerEntry === "NoEntries") {
        // If we couldn't find any entries for the player in the given challenge leaderboard, either
        // the player never entered the challenge and yet somehow is in the challenge, or the challenge
        // leaderboard disappeared for some reason. Either way, the situation can't get any better, so
        // all we can do is remove the event data from their profile...
        Spark.getLog().warn(FormatString("PrizeUtilities: Player {0} ({1}) has no entries in the leaderboard for challenge \"{2}\" ({3})?! Removing data for that challenge from their profile.",
            Spark.loadPlayer(playerId).getDisplayName(), playerId, challenge.challengeName, challengeId));
        return "remove";
    }
    else if (playerEntry === undefined || playerEntry === null) {
        Spark.getLog().error(FormatString("PrizeUtilities: Failed to check for top-down prizes because we couldn't get the player's entry from the challenge leaderboard! Player: {0} ({1}), Challenge: {2} ({3})",
            Spark.loadPlayer(playerId).getDisplayName(), playerId, challenge.challengeName, challengeId));
        return;
    }

    var playerRank = playerEntry.rank;
    var playerName = playerEntry.userName;
    var playerScore = playerEntry.score;

    if (playerRank === null || playerRank === undefined || isNaN(playerRank)) {
        Spark.getLog().error(FormatString("PrizeUtilities: player rank was invalid [{0}]", playerRank));
        return;
    }

    if (playerScore === null || playerScore === undefined || isNaN(playerScore) || playerScore < 0) {
        Spark.getLog().error(FormatString("PrizeUtilities: player score was invalid [{0}]", playerScore));
        return;
    }

    if (playerScore <= 0) {
        Spark.getLog().error(FormatString("PrizeUtilities: player score was <= 0!? [{0}]", playerScore));
        // Don't award them anything if they didn't do at least one race!
        return;
    }

    // Finally, we have the number we need. We now need to compare this against the event's prize data.
    var currentEvent = GetRaceEventDataFromMetaCollection(challenge.challengeName, true, playerId);

    if (currentEvent === null || currentEvent === undefined)
    {
        Spark.getLog().error("PrizeUtilities: Couldn't find an event with name: " + challenge.challengeName);
        return;
    }

    // Woo, prizes! Now we compare our rank against the requirements and see what we've got.
    var topDownPrizes = currentEvent.TopPrizes;
    if (topDownPrizes !== null && topDownPrizes !== undefined){
        for (var i = 0; i < topDownPrizes.length; i++) {
            var prizeBand = topDownPrizes[i];
            var prizeTarget = prizeBand.GoalTarget;

            if (playerRank <= prizeTarget) {
                AddPrizeToUnawardedList(playerId, challengeId, {
                    AwardType : "TopDown",
                    EventName : challenge.challengeName,
                    PrizeBand : {
                        Goal : prizeBand.Goal,
                        GoalTarget : prizeTarget,
                        Prizes : prizeBand.Prizes
                    },
                    LocalisedTextTag : currentEvent.LocalisedTextTag,
                    PlayerRank : playerRank
                });

                IncrementTopDownGoals(playerId, gameStats);
                AchievementTopDownGoal(playerId);
                break; // Award only the first prize the player is eligible for.
            }
        }
    }
    // We've awarded top-down prizes so we don't need the fake data anymore for this challenge instance
    RemovePlayerFakeData(versionedProfile, challengeId);

    return "done";
}

// Module: PrizeUtilities.
// Check if the player has completed any Event Goals since we last checked.
function CheckIfPlayerWonAnEventGoalPrize(playerId, challengeId, scoreLastPosted, victoriesLastPosted, racesLastPosted){
    //Spark.getLog().debug("CheckIfPlayerWonAnEventGoalPrize");

    var challenge = Spark.systemCollection("challengeInstance").findOne({
        "_id" : {
            "$oid" : challengeId
        }
    },
    {
        "endDate" : 1,
        "challengeName" : 1,
        "state" : 1
    });

    if (challenge === null || challenge === undefined) {
        Spark.getLog().error(FormatString("PrizeUtilities: Failed to check for bottom-up prizes because we couldn't find challenge \"{0}\" in the challengeInstance collection!",
            challengeId));
        return;
    }

    // Don't award any prizes if the event has ended
    var endDate = challenge.endDate;
    var now = GetNow();
    if (now >= endDate) {
        return;
    }

    var challengeName = challenge.challengeName;
    //Spark.getLog().info(FormatString("CheckIfPlayerWonAnEventGoalPrize: challengeId {0}", challengeId));
    var playerEntry = GetPlayerLeaderboardEntry(playerId, challengeId, challenge.challengeName, scoreLastPosted);

    if (playerEntry === undefined){
        Spark.getLog().error(FormatString("PrizeUtilities: Failed to check for bottom-up prizes because we couldn't get the player's entry from the challenge leaderboard! Player ID: {0} ({1}), Challenge: {2} ({3})",
            Spark.loadPlayer(playerId).getDisplayName(), playerId, challenge.challengeName, challengeId));
        return;
    }

    var playerName = playerEntry.userName;
    var playerScore = playerEntry.score;
    var playerVictories = playerEntry.victories;

    //Spark.getLog().debug("PrizeUtilities: player victories: " + playerVictories);

    // Okay, we have the scores, now for the event.
    var currentEvent = GetRaceEventDataFromMetaCollection(challenge.challengeName, true, playerId);

    if (currentEvent === null){
        Spark.getLog().error("PrizeUtilities: Couldn't find an event with name: " + challenge.challengeName);
        return;
    }

    // Grab all the necessary data!
    var eventGoals = currentEvent.EventGoals;
    var player = Spark.loadPlayer(playerId);

    var versionedPlayerEventGoalProgressData = GetVersionedPlayerEventGoalProgressData(playerId);

    // Gotta get the league number for the given challengeId, so we need the race event schedule.
    // Also need this for deciding whether the event has ended and can therefore no longer award event goals
    var raceEventSchedule = GetRaceEventScheduleWithChallengeId(challengeId, /*noErrorOnMissingChallenge*/false, playerId);
    var raceDetails = GetRaceDetails(playerId);

    var prizesQueue = [];

    var eventGoalProgressData = versionedPlayerEventGoalProgressData.GetData();
    var progressDataForEvent = eventGoalProgressData[challenge.challengeName];

    // Goals such as UseCarRarity and RaceXTimesWithCarClass aren't tracking properly because they're
    // modified here but are never written back to the versioned data. We can't start a
    // successfullyWritten loop here, because if it *does* loop, we'll award goals multiple times.
    // So... this is ugly, but let's track the stats we modify as separate variables, then do the
    // writeback loop after we're done awarding goals.
    var useCarRarityStats = {
        commonRarityRaces: 0,
        uncommonRarityRaces: 0,
        rareRarityRaces: 0,
        legendaryRarityRaces: 0
    };

    var winRacesWithUpgradeStageStats = {
        basePackVictories: 0,
        proPackVictories: 0,
        tuningPackVictories: 0
    };

    var raceXTimesWithCarClassStats = {
        cClassRaces: 0,
        bClassRaces: 0,
        aClassRaces: 0,
        sClassRaces: 0
    };

    var currentCarSlot = GetPlayerSlots(playerId).activeIndex;
    var carList = GetAllPlayerCars(playerId);
    if (carList === null || carList === undefined || carList.length === 0) {
        var ftueFlags = GetPlayerFTUEFlags(playerId);

        if (ftueFlags.ChosenCar !== undefined && ftueFlags.ChosenCar !== null) {
            var message = "Player has no cars despite having completed that part of the FTUE";
            Spark.getLog().warn(message);
        }
        return;
    }

    var currentCar = carList[currentCarSlot];

    if (progressDataForEvent === null || progressDataForEvent === undefined) {
        // JA - PSIX-4122 - this is called from the RaceStartTime event. The data is only created at the end of a
        // betting series so we can get to this point multiple times before the data is created. It's not an error.
        // Potentially we should create the data earlier - at the point UpdatePlayerEventDataForNewChallenge()
        // is called. However time is short and that is a much more intrusive change. Partial changes in the
        // "PSIX-4122-early-create-event-goal-progress-data" branch
        //Spark.getLog().error(FormatString("Objective data for {0} is non-existent.", challenge.challengeName));
        return;
    }

    var objectiveDataChallengeId = progressDataForEvent.challengeId;
    if (objectiveDataChallengeId === null || objectiveDataChallengeId === undefined) {
        Spark.getLog().error(FormatString("Objective data for {0} has a null/undefined challengeId", challenge.challengeName));
        return;
    }

    if (objectiveDataChallengeId !== challengeId) {
        //Spark.getLog().warn(FormatString("Objective data for {0} has a mismatch on challenge ids: data has {1}, we're expecting {2}",
        //    challenge.challengeName, objectiveDataChallengeId, challengeId));
        return;
    }

    if (eventGoals !== null && eventGoals !== undefined) {
        var track = raceDetails.Track;
        var tracksData = progressDataForEvent.TracksData;
        if (tracksData === null || tracksData === undefined) {
            Spark.getLog().error(FormatString("{0}: Event Goal Progress Data has no tracks data for challenge {1}",
                player.getDisplayName(), challenge.challengeName));
            return;
        }
        var trackData = tracksData[track];
        if (trackData === null || trackData === undefined) {
            // JA - PSIX-4842 as per PSIX-4122 above
            return;
        }

        for (var i = 0; i < eventGoals.length; i++){
            var goalInfo = eventGoals[i];

            switch (goalInfo.Goal) {
                case "WinRaces":
                    // Spark.getLog().debug(FormatString("Checking if {0} won a WinRaces event goal prize: {1} >= {2} && {1} - {3} < {2}",
                    //     playerName, playerVictories, goalInfo.GoalTarget, victoriesLastPosted));
                    // Spark.getLog().debug(FormatString("Checking if {0} won a WinRaces event goal prize: {1} >= {2}",
                    //     playerName, playerVictories, goalInfo.GoalTarget));

                    if (playerVictories >= goalInfo.GoalTarget /*&& playerVictories - victoriesLastPosted < goalInfo.GoalTarget*/) {
                        AddPrizeToQueue(prizesQueue, "EventGoal", challenge.challengeName, goalInfo.Goal, goalInfo.GoalTarget, goalInfo.Prizes, currentEvent.LocalisedTextTag);
                    }
                    break;
                case "EarnCash":
                    // Spark.getLog().debug(FormatString("Checking if {0} won an EarnCash event goal prize: {1} >= {2} && {1} - {3} < {2}",
                    //     playerName, playerScore, goalInfo.GoalTarget, scoreLastPosted));
                    // Spark.getLog().debug(FormatString("Checking if {0} won an EarnCash event goal prize: {1} >= {2}",
                    //     playerName, playerScore, goalInfo.GoalTarget));

                    if (playerScore >= goalInfo.GoalTarget /* && playerScore - scoreLastPosted < goalInfo.GoalTarget*/) {
                        AddPrizeToQueue(prizesQueue, "EventGoal", challenge.challengeName, goalInfo.Goal, goalInfo.GoalTarget, goalInfo.Prizes, currentEvent.LocalisedTextTag);
                    }
                    break;
                case "TimeUnder":
                    var timeUnderData = trackData.timeUnder;
                    if (timeUnderData === null || timeUnderData === undefined || timeUnderData.length === 0) {
                        continue;
                    }
                    if (goalInfo.TrackName !== track){
                        continue;
                    }
                    var requiredTime = parseFloat(goalInfo.GoalTarget);
                    var requiredCount = parseInt(goalInfo.GoalTarget2);
                    for (var j = 0; j < timeUnderData.length; ++j) {
                        var entry = timeUnderData[j];
                        if (FloatsEqual(requiredTime, entry.time)) {
                            var count = entry.count;
                            if (count >= requiredCount) {
                                AddPrizeToQueue(prizesQueue, "EventGoal", challenge.challengeName, goalInfo.Goal, goalInfo.GoalTarget, goalInfo.Prizes,
                                    currentEvent.LocalisedTextTag, /*rank*/null, goalInfo.GoalTarget2, goalInfo.TrackName);
                            }
                        }
                    }
                    break;
                case "CloseRace":
                    var closeRace = trackData.closeRace;
                    if (closeRace === null || closeRace === undefined || closeRace.length === 0) {
                        continue;
                    }
                    if (goalInfo.TrackName !== track){
                        continue;
                    }
                    var requiredTime = parseFloat(goalInfo.GoalTarget);
                    var requiredCount = parseInt(goalInfo.GoalTarget2);
                    for (var j = 0; j < closeRace.length; ++j) {
                        var entry = closeRace[j];
                        if (FloatsEqual(requiredTime, entry.time)) {
                            var count = entry.count;
                            if (count >= requiredCount) {
                                AddPrizeToQueue(prizesQueue, "EventGoal", challenge.challengeName, goalInfo.Goal, goalInfo.GoalTarget, goalInfo.Prizes,
                                    currentEvent.LocalisedTextTag, /*rank*/null, goalInfo.GoalTarget2, goalInfo.TrackName);
                            }
                        }
                    }
                    break;
                case "AchieveLapTime":
                    var bestLapTime = trackData.bestLapTime;
                    if (bestLapTime === null || bestLapTime === undefined) {
                        continue;
                    }
                    // Spark.getLog().debug(FormatString("Checking if {0} won an AchieveLapTime event goal prize: {1} <= {2}",
                    //     playerName, bestLapTime, goalInfo.GoalTarget));
                    if (goalInfo.TrackName !== track){
                        continue;
                    }
                    if (bestLapTime <= goalInfo.GoalTarget && bestLapTime > 0) {
                        AddPrizeToQueue(prizesQueue, "EventGoal", challenge.challengeName, goalInfo.Goal, goalInfo.GoalTarget, goalInfo.Prizes,
                            currentEvent.LocalisedTextTag, /*rank*/null, /*GoalTarget2*/null, goalInfo.TrackName);
                    }
                    break;
                case "Participation":
                    // Spark.getLog().debug(FormatString("I'd love to go about awarding a prize for a {0} Goal, but it's not implemented yet, heh!", goalInfo.Goal));
                    break;
                case "UseCarRarity":
                    // Just like with Class and Upgrade Stage prizes, we kinda need to track the number of times we've raced with the given
                    // rarity so the client can correctly display the goal as completed. Plus, this is good for if/when someone decides this
                    // should be "RaceXTimesWithYRarity".
                    var currentCarRarity = currentCar.Item.Rarity;
                    var awardPrize = false;
                    var targetRaces = 1; // TODO: We can expand this to "RaceXTimesWithYRarity".

                    if (currentCarRarity === "Common") {
                        useCarRarityStats.commonRarityRaces = racesLastPosted;
                    }
                    else if (currentCarRarity === "Uncommon") {
                        useCarRarityStats.uncommonRarityRaces = racesLastPosted;
                    }
                    else if (currentCarRarity === "Rare") {
                        useCarRarityStats.rareRarityRaces = racesLastPosted;
                    }
                    else if (currentCarRarity === "Legendary") {
                        useCarRarityStats.legendaryRarityRaces = racesLastPosted;
                    }

                    var racesOfRequiredRarity = 0;
                    if (goalInfo.GoalTarget === "Common") {
                        // Add everything from the current progress data.
                        if (progressDataForEvent.commonRarityRaces != null && progressDataForEvent.commonRarityRaces != undefined) {
                            racesOfRequiredRarity += progressDataForEvent.commonRarityRaces;
                        }
                        if (progressDataForEvent.uncommonRarityRaces != null && progressDataForEvent.uncommonRarityRaces != undefined) {
                            racesOfRequiredRarity += progressDataForEvent.uncommonRarityRaces;
                        }
                        if (progressDataForEvent.rareRarityRaces != null && progressDataForEvent.rareRarityRaces != undefined) {
                            racesOfRequiredRarity += progressDataForEvent.rareRarityRaces;
                        }
                        if (progressDataForEvent.legendaryRarityRaces != null && progressDataForEvent.legendaryRarityRaces != undefined) {
                            racesOfRequiredRarity += progressDataForEvent.legendaryRarityRaces;
                        }
                        // Add our new races.
                        racesOfRequiredRarity += useCarRarityStats.commonRarityRaces + useCarRarityStats.uncommonRarityRaces + useCarRarityStats.rareRarityRaces + useCarRarityStats.legendaryRarityRaces;
                    }
                    else if (goalInfo.GoalTarget === "Uncommon") {
                        // Add everything from the current progress data.
                        if (progressDataForEvent.uncommonRarityRaces != null && progressDataForEvent.uncommonRarityRaces != undefined) {
                            racesOfRequiredRarity += progressDataForEvent.uncommonRarityRaces;
                        }
                        if (progressDataForEvent.rareRarityRaces != null && progressDataForEvent.rareRarityRaces != undefined) {
                            racesOfRequiredRarity += progressDataForEvent.rareRarityRaces;
                        }
                        if (progressDataForEvent.legendaryRarityRaces != null && progressDataForEvent.legendaryRarityRaces != undefined) {
                            racesOfRequiredRarity += progressDataForEvent.legendaryRarityRaces;
                        }
                        // Add our new races.
                        racesOfRequiredRarity += useCarRarityStats.uncommonRarityRaces + useCarRarityStats.rareRarityRaces + useCarRarityStats.legendaryRarityRaces;
                    }
                    else if (goalInfo.GoalTarget === "Rare") {
                        // Add everything from the current progress data.
                        if (progressDataForEvent.rareRarityRaces != null && progressDataForEvent.rareRarityRaces != undefined) {
                            racesOfRequiredRarity += progressDataForEvent.rareRarityRaces;
                        }
                        if (progressDataForEvent.legendaryRarityRaces != null && progressDataForEvent.legendaryRarityRaces != undefined) {
                            racesOfRequiredRarity += progressDataForEvent.legendaryRarityRaces;
                        }
                        // Add our new races.
                        racesOfRequiredRarity += useCarRarityStats.rareRarityRaces + useCarRarityStats.legendaryRarityRaces;
                    }
                    else if (goalInfo.GoalTarget === "Legendary") {
                        // Add everything from the current progress data.
                        if (progressDataForEvent.legendaryRarityRaces != null && progressDataForEvent.legendaryRarityRaces != undefined) {
                            racesOfRequiredRarity += progressDataForEvent.legendaryRarityRaces;
                        }
                        // Add our new races.
                        racesOfRequiredRarity += useCarRarityStats.legendaryRarityRaces;
                    }

                    // Spark.getLog().info(FormatString("Checking if {0} won an UseCarRarity event goal prize: {1} >= {2} && {3} >= {4}",
                    //     playerName, currentCarRarity, goalInfo.GoalTarget, racesOfRequiredRarity, targetRaces));

                    if (racesOfRequiredRarity >= targetRaces) {
                        AddPrizeToQueue(prizesQueue, "EventGoal", challenge.challengeName, goalInfo.Goal, goalInfo.GoalTarget, goalInfo.Prizes, currentEvent.LocalisedTextTag);
                    }
                    break;
                case "GetPerfectCorners":
                    var totalCorners = trackData.totalCorners;
                    var perfectCorners = trackData.bestPerfectCorners;

                    if (totalCorners === null || totalCorners === undefined ||
                        perfectCorners === null || perfectCorners === undefined) {

                        continue;
                    }
                    if (goalInfo.TrackName !== track){
                        continue;
                    }
                    // Zero or less means ALL corners must be perfected to achieve the goal.
                    if (goalInfo.GoalTarget <= 0)
                    {
                        if (totalCorners != null) {
                            // Spark.getLog().debug(FormatString("Checking if {0} won an GetPerfectCorners event goal prize: {1} === {2}",
                            // playerName, perfectCorners, totalCorners));

                            if (perfectCorners === totalCorners) {
                                AddPrizeToQueue(prizesQueue, "EventGoal", challenge.challengeName, goalInfo.Goal, goalInfo.GoalTarget, goalInfo.Prizes,
                                    currentEvent.LocalisedTextTag, /*rank*/null, /*GoalTarget2*/null, goalInfo.TrackName);
                            }
                        }
                        else {
                            // Spark.getLog().debug(FormatString("progressDataForEvent.totalCorners was null/undefined; the total corners probably hasn't been uploaded!"));
                        }
                    }
                    else
                    {
                        // Spark.getLog().debug(FormatString("Checking if {0} won an GetPerfectCorners event goal prize: {1} >= {2}",
                        // playerName, perfectCorners, goalInfo.GoalTarget));

                        if (perfectCorners >= goalInfo.GoalTarget) {
                            AddPrizeToQueue(prizesQueue, "EventGoal", challenge.challengeName, goalInfo.Goal, goalInfo.GoalTarget, goalInfo.Prizes,
                                currentEvent.LocalisedTextTag, /*rank*/null, /*GoalTarget2*/null, goalInfo.TrackName);
                        }
                    }
                    break;
                case "WinRacesWithUpgradeStage":
                    // Credit the victories if the current car's upgrade stage is correct.
                    var parsedUpgradeStage = parseInt(goalInfo.GoalTarget2);
                    var packFitted = parseInt(currentCar.Status.CarUpgradeStatus.PackFitted);
                    var awardPrize = false;
                    var targetPackVictories = 0;

                    if (packFitted === 0) {
                        winRacesWithUpgradeStageStats.basePackVictories = victoriesLastPosted;

                        if (parsedUpgradeStage === 0 && packFitted === 0) {
                            if (progressDataForEvent.basePackVictories != null) {
                                targetPackVictories += progressDataForEvent.basePackVictories;
                            }
                            targetPackVictories += victoriesLastPosted;
                        }
                    }
                    else if (packFitted === 1) {
                        winRacesWithUpgradeStageStats.proPackVictories = victoriesLastPosted;

                        if (parsedUpgradeStage === 1 && packFitted >= 1) {
                            // Wins with a tuning pack also count towards pro pack goals.
                            if (progressDataForEvent.proPackVictories != null) {
                                targetPackVictories += progressDataForEvent.proPackVictories;
                            }
                            if (progressDataForEvent.tuningPackVictories != null) {
                                targetPackVictories += progressDataForEvent.tuningPackVictories;
                            }
                            targetPackVictories += victoriesLastPosted;
                        }
                    }
                    else if (packFitted >= 2) {
                        winRacesWithUpgradeStageStats.tuningPackVictories = victoriesLastPosted;

                        if (parsedUpgradeStage >= 2) {
                            if (progressDataForEvent.tuningPackVictories != null) {
                                targetPackVictories += progressDataForEvent.tuningPackVictories;
                            }
                            targetPackVictories += victoriesLastPosted;
                        }
                    }

                    // Spark.getLog().debug(FormatString("Checking if {0} won an WinRacesWithUpgradeStage event goal prize (upgrade stage {1}): {2} >= {3} && {2} - {4} < {3}",
                    //         playerName, parsedUpgradeStage, targetPackVictories, goalInfo.GoalTarget, victoriesLastPosted));

                    if (targetPackVictories >= goalInfo.GoalTarget && targetPackVictories - victoriesLastPosted < goalInfo.GoalTarget) {
                        AddPrizeToQueue(prizesQueue, "EventGoal", challenge.challengeName, goalInfo.Goal, goalInfo.GoalTarget, goalInfo.Prizes, currentEvent.LocalisedTextTag);
                    }
                    break;
                case "RaceXTimesWithCarClass":
                    // Just like WinRacesWithUpgradeStage, it's possible that there may be several goals of this type which requireOnce
                    // you to race a different number of times with each class... yep, this is getting complicated.
                    var parsedRaceCountTarget = parseInt(goalInfo.GoalTarget);
                    var racesOfTargetClass = 0;
                    var visibleCarClass = GetVisibleClass(currentCar);

                    // Credit the race count if the current car's class is correct.
                    if (visibleCarClass === goalInfo.GoalTarget2) {
                        if (goalInfo.GoalTarget2 === "S") {
                            if (progressDataForEvent.sClassRaces != null) {
                                racesOfTargetClass += progressDataForEvent.sClassRaces;
                            }
                            raceXTimesWithCarClassStats.sClassRaces = racesLastPosted;
                            racesOfTargetClass += racesLastPosted;
                        }
                        else if (goalInfo.GoalTarget2 === "A") {
                            if (progressDataForEvent.aClassRaces != null) {
                                racesOfTargetClass += progressDataForEvent.aClassRaces;
                            }
                            raceXTimesWithCarClassStats.aClassRaces = racesLastPosted;
                            racesOfTargetClass += racesLastPosted;
                        }
                        else if (goalInfo.GoalTarget2 === "B") {
                            if (progressDataForEvent.bClassRaces != null) {
                                racesOfTargetClass += progressDataForEvent.bClassRaces;
                            }
                            raceXTimesWithCarClassStats.bClassRaces = racesLastPosted;
                            racesOfTargetClass += racesLastPosted;
                        }
                        else if (goalInfo.GoalTarget2 === "C") {
                            if (progressDataForEvent.cClassRaces != null) {
                                racesOfTargetClass += progressDataForEvent.cClassRaces;
                            }
                            raceXTimesWithCarClassStats.cClassRaces = racesLastPosted;
                            racesOfTargetClass += racesLastPosted;
                        }
                        else {
                            // Spark.getLog().error(FormatString("ARG; can't award a RaceXTimesWithCarClass goal because the GoalTarget2 is invalid ({0})!", goalInfo.GoalTarget2));
                        }

                        if (racesOfTargetClass > 0) {
                            // Spark.getLog().debug(FormatString("Checking if {0} won an RaceXTimesWithCarClass event goal prize: {1} >= {2} && {1} - {3} < {2}",
                            //     playerName, racesOfTargetClass, goalInfo.GoalTarget, racesLastPosted));

                            if (racesOfTargetClass >= goalInfo.GoalTarget && racesOfTargetClass - racesLastPosted < goalInfo.GoalTarget) {
                                AddPrizeToQueue(prizesQueue, "EventGoal", challenge.challengeName, goalInfo.Goal, goalInfo.GoalTarget, goalInfo.Prizes, currentEvent.LocalisedTextTag, /*rank*/null, /*class*/goalInfo.GoalTarget2);
                            }
                        }
                    }
                    else {
                        // Spark.getLog().debug(FormatString("Car class {0} didn't match target class {1}.", visibleCarClass, goalInfo.GoalTarget2));
                    }
                    break;
                default:
                    Spark.getLog().error(FormatString("I'd love to go about awarding a prize for a {0} Goal, but it's not implemented yet, heh!", goalInfo.Goal));
                    break;
            }
        }
    }

    var successfullyWritten = false;
    while (!successfullyWritten) {
        eventGoalProgressData = versionedPlayerEventGoalProgressData.GetData();
        progressDataForEvent = eventGoalProgressData[challenge.challengeName];

        // Add our new stats on top of the ones we have.
        // UseCarRarity:
        if (progressDataForEvent.commonRarityRaces == null) {
            progressDataForEvent.commonRarityRaces = 0;
        }
        progressDataForEvent.commonRarityRaces += useCarRarityStats.commonRarityRaces;

        if (progressDataForEvent.uncommonRarityRaces == null) {
            progressDataForEvent.uncommonRarityRaces = 0;
        }
        progressDataForEvent.uncommonRarityRaces += useCarRarityStats.uncommonRarityRaces;

        if (progressDataForEvent.rareRarityRaces == null) {
            progressDataForEvent.rareRarityRaces = 0;
        }
        progressDataForEvent.rareRarityRaces += useCarRarityStats.rareRarityRaces;

        if (progressDataForEvent.legendaryRarityRaces == null) {
            progressDataForEvent.legendaryRarityRaces = 0;
        }
        progressDataForEvent.legendaryRarityRaces += useCarRarityStats.legendaryRarityRaces;

        // WinRacesWithUpgradeStage:
        if (progressDataForEvent.basePackVictories == null) {
            progressDataForEvent.basePackVictories = 0;
        }
        progressDataForEvent.basePackVictories += winRacesWithUpgradeStageStats.basePackVictories;

        if (progressDataForEvent.proPackVictories == null) {
            progressDataForEvent.proPackVictories = 0;
        }
        progressDataForEvent.proPackVictories += winRacesWithUpgradeStageStats.proPackVictories;

        if (progressDataForEvent.tuningPackVictories == null) {
            progressDataForEvent.tuningPackVictories = 0;
        }
        progressDataForEvent.tuningPackVictories += winRacesWithUpgradeStageStats.tuningPackVictories;

        // RaceXTimesWithCarClass:
        if (progressDataForEvent.sClassRaces == null) {
            progressDataForEvent.sClassRaces = 0;
        }
        progressDataForEvent.sClassRaces += raceXTimesWithCarClassStats.sClassRaces;

        if (progressDataForEvent.aClassRaces == null) {
            progressDataForEvent.aClassRaces = 0;
        }
        progressDataForEvent.aClassRaces += raceXTimesWithCarClassStats.aClassRaces;

        if (progressDataForEvent.bClassRaces == null) {
            progressDataForEvent.bClassRaces = 0;
        }
        progressDataForEvent.bClassRaces += raceXTimesWithCarClassStats.bClassRaces;

        if (progressDataForEvent.cClassRaces == null) {
            progressDataForEvent.cClassRaces = 0;
        }
        progressDataForEvent.cClassRaces += raceXTimesWithCarClassStats.cClassRaces;

        successfullyWritten = versionedPlayerEventGoalProgressData.SetData(eventGoalProgressData);
    }

    // now we've written back the event goals we can do the side-effects i.e. put the prizes in the unawarded list
    var awardedPrizeCounts = AddPrizesInQueueToUnawardedList(playerId, challengeId, prizesQueue);

    if (awardedPrizeCounts !== null) {
        IncrementBottomUpGoals(playerId, awardedPrizeCounts.EventGoalsAwarded);
        AchievementBottomUpGoal(playerId);
    }
}

// Module: PrizeUtilities.
// Gets the player's leaderboard entry for the given challenge.
function GetPlayerLeaderboardEntry(playerId, challengeId, challengeName, lastScore){
    var playerEntry = undefined;

    var challengeCollection = Spark.systemCollection("challengeInstance");
    var challenge = challengeCollection.findOne({"_id":{"$oid":challengeId}}, {"state": 1, "endDate": 1});

    if (ChallengeInstanceExpiredAndNeverStarted(challenge) /*EXPIRED/LAPSED*/
        || ChallengeInstanceIsWaitingToStart(challenge) /*ISSUED/WAITING*/) {

        var displayName = Spark.loadPlayer(playerId).getDisplayName();
        //Spark.getLog().info(FormatString("{0}: GetPlayerLeaderboardEntry will use fake leaderboard data for challenge {1} [{2}]",
        //    displayName, challengeName, challengeId));

        var fakeData = GetAllPlayerFakeData(challengeId, playerId);
        playerEntry = {};
        playerEntry.rank = 1; // TODO: Make this accurate, maybe?!
        playerEntry.score = fakeData.score;
        playerEntry.victories = fakeData.victories;
        playerEntry.races = fakeData.races;
        playerEntry.userName = displayName;
        return playerEntry;
    }
    else {
        var leaderboard = Spark.getLeaderboards().getChallengeLeaderboard(challengeId);
        if (leaderboard === null || leaderboard === undefined){
            // ErrorMessage(FormatString("Couldn't find leaderboard with challengeId {0}", challengeId));
            return "ChallengeDoesNotExist";
        }
        var entry = leaderboard.getEntriesFromPlayer(playerId, 1).next();
        if (entry === null || entry === undefined){
            ErrorMessage(FormatString("SparkLeaderboardCursor appears to contain no entries for player {0} in leaderboard for challengeId {1}", playerId, challengeId));
            return "NoEntries";
        }

        playerEntry = {};
        playerEntry.rank = entry.getRank();
        playerEntry.score = entry.getAttribute("score");
        playerEntry.victories = entry.getAttribute("victories");
        playerEntry.userName = entry.getUserName();

        //Spark.getLog().info(FormatString("{0}: GetPlayerLeaderboardEntry will use actual leaderboard data for challenge {1} [{2}]",
        //    playerEntry.userName, challengeName, challengeId));

        return playerEntry;
    }
}