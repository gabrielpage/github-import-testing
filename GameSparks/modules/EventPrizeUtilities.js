// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("CurrencyUtilities");
requireOnce("RaceEventUtilities");
requireOnce("PrizeUtilities");
requireOnce("CarInventoryUtilities");
requireOnce("GachaPrizeUtilities");
requireOnce("ProPackUtilities");
requireOnce("XPUtilities");
requireOnce("GameStatsUtilities");
requireOnce("VersionedDocumentUtilities2");
requireOnce("TimeUtilities");
requireOnce("CollectionUtilities");
requireOnce("RaceEventScheduleUtilities");

// Module: EventPrizeUtilities.
function AwardPrize(playerId, currentPrize) {
    var player = Spark.loadPlayer(playerId);

    if (currentPrize.PrizeBand.Prizes === null || currentPrize.PrizeBand.Prizes === undefined) {
        return;
    }

    // Spark.getLog().debug(FormatString("Number of prizes {0}: in prize {1}",
    //     currentPrize.PrizeBand.Prizes.length,
    //     currentPrize));

    var allPrizes = currentPrize.PrizeBand.Prizes;
    // Sort the prizes so we award the XP first, incase we need to increase our level,
    // which will increase our currency cap (this makes sure monetary prizes aren't wasted).
    allPrizes.sort(function(a, b) {
        if (a.PrizeType === "XP") {
            return -1;
        }
        else if (b.PrizeType === "XP") {
            return 1;
        }
        else {
            return 0;
        }
    });

    for (var iPrize = 0; iPrize < allPrizes.length; iPrize++) {
        var prize = allPrizes[iPrize];
        var prizeType = prize.PrizeType;
        var prizeValue = prize.PrizeValue;

        // Spark.getLog().debug(FormatString("Prize Type: {0}, Prize Value: {1}", prizeType, prizeValue));

        switch (prizeType){
            case "Cash":
                var cashAmount = prize.PrizeValue;
                Credit(cashAmount, false, playerId);
                IncrementLifetimeWinnings(playerId, cashAmount);
                break;
            case "Gold":
                var goldAmount = prize.PrizeValue;
                Credit(goldAmount, true, playerId);
                break;
            case "XP":
                var xpAmount = parseInt(prize.PrizeValue);
                AddXPAmount(Spark.loadPlayer(playerId), xpAmount);
                break;
            case "Car":
                var variantID = prize.PrizeValue;
                var variantInventoryEntry = GetCarInventoryEntry(variantID, playerId);
                if (variantInventoryEntry === null)
                {
                    ErrorMessage(FormatString("Uh-oh; we tried to award player \"{0}\" (Display Name: \"{1}\" a car with Variant ID \"{2}\" " +
                    "but it doesn't exist in the CarInventory!", player.getUserName(), player.getDisplayName(), variantID));
                    continue;
                }

                // Add it to the player's garage here!
                AddNewCarToInventory(variantID, playerId, 100, true);

                // Use the model string to get the manufacturer name.
                var carModelEntry = GetCarModelsCollection(playerId).findOne({"Model": variantInventoryEntry.Model});
                var manufacturerName = "";

                // Check for errors.
                if (carModelEntry === null) {
                    var errorMessage = FormatString("ARG; couldn't find the manufacturer of model \"{0}\" in the CarModels meta collection!",
                        variantInventoryEntry.Model);
                    Spark.getLog().error(errorMessage);
                }
                else {
                    manufacturerName = carModelEntry.ClientData.ManufacturerName;
                }

                // Instead of returning the variant ID to the client, we should return the variant name.
                // Return the car name, manufacturer and variant name separately because we need to translate them on the client side.
                // Also return the Variant ID for snapshot rendering.
                prize.PrizeValue = JSON.stringify({
                    "VariantId": variantID,
                    "Manufacturer": manufacturerName,
                    "LongName": variantInventoryEntry.LongName,
                    "VariantName": variantInventoryEntry.VariantName});
                break;
            case "BronzeKeys":
                var bronzeKeys = parseInt(prize.PrizeValue);
                GiveBankBoxKeys(Spark.loadPlayer(playerId), "Bronze", bronzeKeys);
                break;
            case "SilverKeys":
                var silverKeys = parseInt(prize.PrizeValue);
                GiveBankBoxKeys(Spark.loadPlayer(playerId), "Silver", silverKeys);
                break;
            case "GoldKeys":
                var goldKeys = parseInt(prize.PrizeValue);
                GiveBankBoxKeys(Spark.loadPlayer(playerId), "Gold", goldKeys);
                break;
            case "ProPack":
                var selectedManufacturer = prizeValue;
                var selectedClass = prize.PrizeClass;
                var quantity = prize.BlueprintOrProPackCount;

                var versionedProPacks = GetVersionedPlayerProPacks(playerId);

                var successfullyWritten = false;
                while (!successfullyWritten) {
                    var proPacksArray = versionedProPacks.GetData();

                    var selectedProPackData;
                    var selectedProPackDataIndex;

                    // Get the manufacturer entry in the Pro Packs array.
                    for (var iProPackArray = 0; iProPackArray < proPacksArray.length; iProPackArray++) {
                        var entry = proPacksArray[iProPackArray];
                        if (entry.Manufacturer === selectedManufacturer) {
                            selectedProPackData = entry;
                            selectedProPackDataIndex = iProPackArray;
                            break;
                        }
                    }

                    // Create the manufacturer entry if it's nonexistent.
                    if (selectedProPackData == null) {
                        selectedProPackData = {"Manufacturer": selectedManufacturer, "Classes": {"C": 0, "B": 0, "A": 0, "S": 0} };
                        selectedProPackDataIndex = proPacksArray.push(selectedProPackData) - 1;
                    }

                    // Award the Pro Pack.
                    switch (selectedClass) {
                        case "C":
                            selectedProPackData.Classes.C += Math.max(1, quantity);
                            break;
                        case "B":
                            selectedProPackData.Classes.B += Math.max(1, quantity);
                            break;
                        case "A":
                            selectedProPackData.Classes.A += Math.max(1, quantity);
                            break;
                        case "S":
                            selectedProPackData.Classes.S += Math.max(1, quantity);
                            break;
                    }
                    proPacksArray[selectedProPackDataIndex] = selectedProPackData;

                    successfullyWritten = versionedProPacks.SetData(proPacksArray);
                }
                break;
            case "Blueprint":
                var selectedVariantID = prizeValue;
                var variantInventoryEntry = GetCarInventoryEntry(selectedVariantID, playerId);
                var quantity = prize.BlueprintOrProPackCount;

                // Check for errors!
                if (variantInventoryEntry === null)
                {
                    var errorMessage = FormatString("Uh-oh; we tried to award player \"{0}\" (Display Name: \"{1}\") a blueprint piece with Variant " +
                        "ID \"{2}\" but it doesn't exist in the CarInventory!", player.getUserName(), player.getDisplayName(), selectedVariantID);
                    ErrorMessage(errorMessage);
                    continue;
                }
                if (variantInventoryEntry.BlueprintPiecesRequired <= 0) {
                    var errorMessage = FormatString("Variant {0} requires an invalid number of Blueprint pieces to win it ({1})!",
                        selectedVariantID, variantInventoryEntry.BlueprintPiecesRequired);
                    ErrorMessage(errorMessage);
                    continue;
                }

                // Use the model string to get the manufacturer name.
                var carModelEntry = GetCarModelsCollection(playerId).findOne({"Model": variantInventoryEntry.Model});
                var manufacturerName = "";

                // Check for errors here, too!
                if (carModelEntry === null) {
                    var errorMessage = FormatString("ARG; couldn't find the manufacturer of model \"{0}\" in the CarModels meta collection!",
                        variantInventoryEntry.Model);
                    Spark.getLog().error(errorMessage);
                }
                else {
                    manufacturerName = carModelEntry.ClientData.ManufacturerName;
                }

                var versionedBlueprints = GetVersionedBlueprints(playerId);

                var carVariantToAward;
                var successfullyWritten = false;
                while (!successfullyWritten) {
                    carVariantToAward = null;
                    var blueprints = versionedBlueprints.GetData();

                    // Check to see if the Variant is already in the blueprint list.
                    var selectedBlueprintEntry = null;
                    for (var iBlueprint = 0; iBlueprint < blueprints.length; iBlueprint++) {
                        var currentBlueprint = blueprints[iBlueprint];
                        if (currentBlueprint.CarVariant !== null) {
                            // If the Variant ID of the car matches the prize Variant ID, increment the piece count.
                            if (currentBlueprint.CarVariant.CarVariantID === selectedVariantID) {
                                currentBlueprint.Pieces += Math.max(1, quantity);
                                selectedBlueprintEntry = currentBlueprint;
                                break;
                            }
                        }
                    }

                    // If it isn't in the blueprint list, add a new entry for this Variant.
                    if (selectedBlueprintEntry === null || selectedBlueprintEntry === undefined) {
                        selectedBlueprintEntry = {
                            "CarVariant": variantInventoryEntry,
                            "Pieces": Math.max(1, quantity),
                            "PiecesRequired": variantInventoryEntry.BlueprintPiecesRequired,
                            "TimesWon": 0 };
                        blueprints.push(selectedBlueprintEntry);
                    }

                    // Check if earning this piece completes the blueprint.
                    if (selectedBlueprintEntry.Pieces >= selectedBlueprintEntry.PiecesRequired) {
                        // Spark.getLog().debug(FormatString("{0} finished a Blueprint for a {1} {2}!", player.getDisplayName(),
                        //     blueprintEntry.CarVariant.Manufacturer, blueprintEntry.CarVariant.LongName));

                        // Reset the blueprint piece count.
                        selectedBlueprintEntry.Pieces -= selectedBlueprintEntry.PiecesRequired;
                        selectedBlueprintEntry.TimesWon++;

                        carVariantToAward = selectedBlueprintEntry.CarVariant.CarVariantID;
                    }

                    successfullyWritten = versionedBlueprints.SetData(blueprints);
                }

                if (carVariantToAward !== null && carVariantToAward !== undefined) {
                    // Credit the car to the profile.
                    AddNewCarToInventory(carVariantToAward, playerId, 100, true);
                }
                // Spark.getLog().debug(FormatString("Blueprint piece for {0} credited ({1}/{2})",
                //     selectedBlueprintEntry.CarVariant.CarVariantID, selectedBlueprintEntry.Pieces, selectedBlueprintEntry.PiecesRequired));

                // Instead of returning the variant ID to the client, we should return the variant name.

                // Return the car name, manufacturer and variant name separately because we need to translate them on the client side.
                prize.PrizeValue = carVariantToAward;
                prize.ManufacturerName = manufacturerName;
                prize.LongName = variantInventoryEntry.LongName;
                prize.VariantName = variantInventoryEntry.VariantName;
                break;
        }
    }
}

// Module: EventPrizeUtilities.
// Finds and returns the given player's unawarded prizes. If they have unawarded prizes, credit the
// player's profile with them, then archive them.
function GetUnawardedPrizesAndAwardThem(playerId) {
    var player = Spark.loadPlayer(playerId);
    var now = Math.floor(GetNow() / 1000);
    var versionedProfile = MakeVersionedProfileDocument(playerId);
    var versionedEvents = GetVersionedEvents2FromProfile(versionedProfile);
    var versionedGameStats = GetVersionedGameStatsFromProfile(versionedProfile);

    // see if we need to put any top down prizes into the unawarded list
    var successfullyWritten = false;
    while (!successfullyWritten) {
        var events = versionedEvents.GetData();
        var gameStats = versionedGameStats.GetData();

        for (var eventName in events) {
            var eventDatas = events[eventName];

            for (var i = eventDatas.length - 1; i >= 0; --i) {
                var eventData = eventDatas[i];
                var challengeId = eventData.challengeId;

                if (challengeId === null || challengeId === undefined) {
                    continue;
                }
                if (eventData.topDownPrizesAddedToUnawarded === true) {
                    continue;
                }
                var schedule = GetRaceEventScheduleWithChallengeId(challengeId, /*noErrorOnMissingChallenge*/false, playerId);
                if (schedule === null) {
                    ErrorMessage(FormatString("GetUnawardedTopDownPrizesAndAwardThem: schedule is null for event {0} : {1}", eventName, challengeId));
                    return;
                }

                if (now >= schedule.EndDate) {
                    CheckIfPlayerWonTopDownPrizeAndRemoveEventOrSetAddedFlag(playerId, versionedProfile, eventData, eventDatas, eventName, gameStats);
                }
            }
        }

        successfullyWritten = versionedProfile.Save();
    }

    // now we have finished with our eventData for this function
    // if prizes have been added to the unawarded list
    var oneHour = 60 * 60;
    var successfullyWritten = false;
    while (!successfullyWritten) {
        var events = versionedEvents.GetData();

        for (var eventName in events) {
            var eventDatas = events[eventName];

            for (var i = eventDatas.length - 1; i >= 0; --i) {
                var eventData = eventDatas[i];

                if (eventData.topDownPrizesAddedToUnawarded) {
                    // a real challenge after prizes added to unawarded
                    // preview challenges should *never* have topDownPrizesAddedToUnawarded set

                    if (eventData.challengeEndDate === null
                        || eventData.challengeEndDate === undefined ||
                        now >= eventData.challengeEndDate + oneHour) {
                        // eventData.challengeEndDate missing - this should be a *really* old event
                        // warn in this case
                        if (eventData.challengeEndDate === null ||
                            eventData.challengeEndDate === undefined) {
                            Warn("Culling eventData entry at position {0} for event: {1} with no 'challengEndDate' event: {2}",
                                i,
                                eventName,
                                JSON.stringify(eventData));
                        }
                        else {
                            Log("Culling eventData entry at position {0} for event: {1} which is: {2}",
                                i,
                                eventName,
                                JSON.stringify(eventData));
                        }

                        // this eventData is dead, we can remove it
                        // old challenges do not have challengeEndDate
                        eventDatas.splice(i, 1);
                    }
                }
            }
        }

        successfullyWritten = versionedProfile.Save();
    }

    // cache of challengeId -> boolean of whether the challenge has expired
    var challengesExpiredCache = {};

    // Award prizes, moving them from unawarded to archived as we do
    var versionedPrizes = GetVersionedEventPrizes(playerId);
    
    var prizesToAward = [];
    var successfullyWritten = false;
    while (!successfullyWritten) {
        var eventPrizes = versionedPrizes.GetData();

        // remove the unawarded prizes
        if (eventPrizes.unawarded.length !== 0) {
            for (var i = eventPrizes.unawarded.length - 1; i >= 0; --i) {
                var prizeToAward = eventPrizes.unawarded[i];
                var awardThisPrize = false;

                // only award TopDown prizes, EventGoals are awarded when the user clicks on them or
                // when the challenge has ended. TODO, maybe award prizes older than X days
                if (prizeToAward.AwardType === "TopDown") {
                    awardThisPrize = true;
                }
                else if (prizeToAward.AwardType === "EventGoal") {
                    var challengeExpiredInCache = challengesExpiredCache[prizeToAward.ChallengeId];

                    if (challengeExpiredInCache !== null && challengeExpiredInCache !== undefined) {
                        // ok we got a value
                        awardThisPrize = challengeExpiredInCache;
                    }
                    else {
                        if (prizeToAward.ChallengeId !== null && prizeToAward.ChallengeId !== undefined) {
                            // we only award EventGoals from expired events
                            var challengeInstances = Spark.systemCollection("challengeInstance");

                            var challenge = challengeInstances.findOne({"_id":{"$oid":prizeToAward.ChallengeId}}, {"state": 1, "endDate": 1});
                            awardThisPrize = challenge === null || challenge === undefined || ChallengeHasFinished(challenge);

                            // put the state into the cache
                            challengesExpiredCache[prizeToAward.ChallengeId] = awardThisPrize;
                        }
                        else {
                            // ChallengeId should not be null / undefined now, although years ago it wasn't there
                            // flag an error, but award the prizes now
                            awardThisPrize = true;

                            ErrorLog("No ChallengeId, awarding anyway in prize: [{0}]", JSON.stringify(prizeToAward));
                        }
                    }
                }

                if (awardThisPrize) {
                    // Add timestamp of when it was awarded
                    prizeToAward.Time = now;
                    eventPrizes.archived.push(prizeToAward);
                    prizesToAward.push(prizeToAward);
                    eventPrizes.unawarded.splice(i, 1);
                }
            }
        }

        successfullyWritten = versionedPrizes.SetData(eventPrizes);
    }

    AwardPrizes(playerId, prizesToAward);

    AddLifetimeWinningsToResponse(playerId);

    return prizesToAward;
}

// Module: EventPrizeUtilities.
function AwardPrizes(playerId, prizesToAward) {
    // the award prizes loop
    for (var i = 0; i < prizesToAward.length; ++i) {
        var currentPrize = prizesToAward[i];

        try {
            AwardPrize(playerId, currentPrize);
        }
        catch (e) {
            var player = Spark.loadPlayer(playerId);

            Spark.getLog().error(FormatString("AwardPrizes({0}:{1}) caught exception from AwardPrize({2}). Exception: {3}",
                playerId,
                player.getDisplayName(),
                currentPrize,
                e));
        }
    }
}


// Module: EventPrizeUtilities.
function CheckIfPlayerWonTopDownPrizeForChallenge(playerId, eventName, challengeId) {
    var versionedProfile = MakeVersionedProfileDocument(playerId);
    var versionedEvents = GetVersionedEvents2FromProfile(versionedProfile);
    var versionedGameStats = GetVersionedGameStatsFromProfile(versionedProfile);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var events = versionedEvents.GetData();
        var gameStats = versionedGameStats.GetData();
        
        var eventDatas = events[eventName];
        
        if (eventDatas === null || eventDatas === undefined) {
            return;
        }
        
        var eventDataForChallenge = null;
        
        for (var i = eventDatas.length - 1; i >= 0; --i) {
            var eventData = eventDatas[i];
            
            if (eventData === null || eventData === undefined) {
                continue;
            }
            if (eventData.challengeId === null || eventData.challengeId === undefined) {
                continue;
            }
            if (eventData.challengeId !== challengeId) {
                continue;
            }
            if (eventData.topDownPrizesAddedToUnawarded === true) {
                continue;
            }
            
            eventDataForChallenge = eventData;
            break;
        }
        
        if (eventDataForChallenge === null || eventDataForChallenge === undefined) {
            ErrorLog("CheckIfPlayerWonTopDownPrizeForChallenge(event: {0}, challenge: {1}) can't find eventData?!", eventName, challengeId);
            return;
        }
        
        CheckIfPlayerWonTopDownPrizeAndRemoveEventOrSetAddedFlag(playerId, versionedProfile, eventDataForChallenge, eventDatas, eventName, gameStats);
        
        successfullyWritten = versionedProfile.Save();
    }
}

// Module: EventPrizeUtilities.
function CheckIfPlayerWonTopDownPrizeAndRemoveEventOrSetAddedFlag(playerId, versionedProfile, eventData, eventDatas, eventName, gameStats) {
    var result = CheckIfPlayerWonATopDownPrize(playerId, versionedProfile, eventData, eventName, gameStats);
    switch (result) {
        case "remove":
            for (var i = eventDatas.length - 1; i >= 0; --i) {
                if (eventDatas[i] === eventData) {
                    eventDatas.splice(i, 1);
                    Log("removing {0} from eventDatas for event: {1}", eventData, eventName);
                    break;
                }
            }
        break;
        case "done":
            eventData.topDownPrizesAddedToUnawarded = true;
        break;
    }
}

// Module: EventPrizeUtilities.
// Adds a prize to the list passed as the first parameter
function AddPrizeToQueue(/*array*/ prizesQueue, awardType, challengeName, awardGoal, awardTarget, prizeData, localisedTextTag, playerRank, /*optional*/awardTarget2, /*optional*/trackName) {
    var prize = {
        AwardType : awardType,
        EventName : challengeName,
        PrizeBand : {
            Goal : awardGoal,
            GoalTarget : awardTarget,
            Prizes : prizeData
        },
        LocalisedTextTag : localisedTextTag,
        PlayerRank : playerRank
    };
    if (awardTarget2 !== null && awardTarget2 !== undefined) {
        prize.PrizeBand.GoalTarget2 = awardTarget2;
    }
    if (trackName !== null && trackName !== undefined) {
        prize.PrizeBand.TrackName = trackName;
    }
    prizesQueue.push(prize);
}

// Module: EventPrizeUtilities.
// Adds all the prizes in the queue to the given player's unawarded prize list.
function AddPrizesInQueueToUnawardedList(playerId, challengeId, /*array*/ prizesQueue) {
    var eventGoalsAwarded = 0;
    var topDownGoalsAwarded = 0;

    for (var i = 0; i < prizesQueue.length; i++) {
        var prize = prizesQueue[i];

        try {
            var success = AddPrizeToUnawardedList(playerId, challengeId, prize);
            if (success) {
                if (prize.AwardType === "EventGoal") {
                    eventGoalsAwarded++;
                }
                else if (prize.AwardType === "TopDown") {
                    topDownGoalsAwarded++;
                }
            }
        }
        catch (e) {
            var player = Spark.loadPlayer(playerId);

            Spark.getLog().error(FormatString("AwardPrizesInQueue({0}:{1}, {2}) caught exception from AddPrizeToUnawardedList({3}). Exception: {4}",
                playerId,
                player.getDisplayName(),
                challengeId,
                AddPrizeToUnawardedList,
                e));
        }
    }

    return { EventGoalsAwarded: eventGoalsAwarded, TopDownGoalsAwarded: topDownGoalsAwarded };
}


// Module:  EventPrizeUtilities.
// Adds a prize to the given player's unawarded prize list.
function AddPrizeToUnawardedList(playerId, challengeId, prize) {
    //Spark.getLog().debug("AddPrizeToUnawardedList");

    if (challengeId === null || challengeId === undefined) {
        ErrorLog("AddPrizeToUnawardedList() : challengeId is null/undefined: can't add prize for event: {0} " +
            "for player: {1}:{2}",
            prize.EventName,
            playerId,
            Spark.loadPlayer(playerId).getDisplayName());
        return false;
    }

    prize.ChallengeId = challengeId;

    var versionedPrizes = GetVersionedEventPrizes(playerId);

    var successfullyWritten = false;

    while (!successfullyWritten) {
        var eventPrizes = versionedPrizes.GetData();

        // Check we can actually award the prize (make sure it isn't a duplicate)
        if (PrizeExistsInList(eventPrizes.unawarded, prize)) {
            //Spark.getLog().debug("Prize is a duplicate in unawarded");
            return false;
        }
        if (PrizeExistsInList(eventPrizes.archived, prize)) {
            //Spark.getLog().debug("Prize is a duplicate in archived");
            return false;
        }

        eventPrizes.unawarded.push(prize);

        // LogMessage(FormatString("Adding prize for collection: {0} {1} {2} for {3} [{4}]",
        //                         eventPrize.AwardType,
        //                         eventPrize.PrizeBand.TargetPrizeValue,
        //                         eventPrize.PrizeBand.TargetPrizeType,
        //                         eventPrize.EventName,
        //                         eventPrize.ChallengeId));
        successfullyWritten = versionedPrizes.SetData(eventPrizes);
    }

    return true;
}

// Module: EventPrizeUtilities
// If an event's goals give out Car or Blueprint prizes, this adds data into the PrizeClass and PrizeRarity entries
// of Car and Blueprint prizes to let the client know the class and rarity of the Variants.
function InsertAdditionalPrizeDataIntoRaceEvent(raceEvent, playerId) {
    function InsertRarityAndClass(prize, playerId) {
        // Get the car inventory entry.
        var variantId = prize.PrizeValue;
        var variant = GetCarInventoryEntry(variantId, playerId);

        if (variant === null || variant === undefined) {
            Spark.getLog().error(FormatString("Variant id for car prize is either null or undefined: {0} in {1}", variantId, raceEvent.EventName));
            return null;
        }
        // Get the rarity.
        prize.PrizeRarity = variant.Rarity;

        // Now get the model.
        var model = GetCarModelsCollection(playerId).findOne({"Model": variant.Model});

        // Get the class.
        prize.PrizeClass = model.ClientData.Class;
        return prize;
    }

    if (raceEvent.TopPrizes != null) {
        for (var iGoals = 0; iGoals < raceEvent.TopPrizes.length; iGoals++) {
            var topPrize = raceEvent.TopPrizes[iGoals];
            for (var iPrizes = 0; iPrizes < topPrize.Prizes.length; iPrizes++) {
                var prize = topPrize.Prizes[iPrizes];
                if (prize.PrizeType === "Car" || prize.PrizeType === "Blueprint") {
                    prize = InsertRarityAndClass(prize, playerId);
                    if (prize === null) {
                        return null;
                    }
                }
            }
        }
    }

    if (raceEvent.EventGoals != null) {
        for (var iGoals = 0; iGoals < raceEvent.EventGoals.length; iGoals++) {
            var eventGoal = raceEvent.EventGoals[iGoals];
            for (var iPrizes = 0; iPrizes < eventGoal.Prizes.length; iPrizes++) {
                var prize = eventGoal.Prizes[iPrizes];
                if (prize.PrizeType === "Car" || prize.PrizeType === "Blueprint") {
                    prize = InsertRarityAndClass(prize, playerId);
                    if (prize === null) {
                        return null;
                    }
                }
            }
        }
    }

    return raceEvent;
}

// Module: EventPrizeUtilities
function SetUnawardedGoalsForEventInScriptData(playerId, versionedProfile, eventName) {
    var currentEvents = GetVersionedEvents2FromProfile(versionedProfile).GetData();
    var currentEvent = GetMostRecentEventData(currentEvents[eventName]);
    var challengeId = (currentEvent !== null && currentEvent !== undefined) ? currentEvent.challengeId : null;

    var prizes = GetVersionedEventPrizes(playerId).GetData();
    var unawardedPrizes = prizes.unawarded;

    var currentUnawarded = [];

    for (var i = 0; i < unawardedPrizes.length; ++i) {
        var prize = unawardedPrizes[i];

        if (prize.AwardType === "EventGoal" &&
            prize.EventName === eventName &&
            prize.ChallengeId === challengeId) {
            currentUnawarded.push(prize);
        }
    }

    Spark.setScriptData("unawardedGoals", currentUnawarded);
}

// Module: EventPrizeUtilities
function PrizeExistsInList(prizeList, prizeToInsert) {
    for (var i = 0; i < prizeList.length; ++i) {
        if (PrizesMatch(prizeList[i], prizeToInsert)) {
            return true;
        }
    }

    return false;
}

// Module: EventPrizeUtilities
// Do these two prizes match?
function PrizesMatch(lhsPrize, rhsPrize) {
    if (lhsPrize === null || lhsPrize === undefined) {
        return (rhs === null || rhs === undefined);
    }

    // JA - not sure if we should change ChallengeId to use StringsMatch(). Since this comparison isn't
    // on the client yet I'm going to leave it.
    var hasChallengeId = (lhsPrize.ChallengeId !== undefined && rhsPrize.ChallengeId !== undefined);

    if (!(hasChallengeId ? (lhsPrize.ChallengeId === rhsPrize.ChallengeId) : true) ||
        !AreStringsEqual(lhsPrize.AwardType, rhsPrize.AwardType) ||
        !AreStringsEqual(lhsPrize.EventName, rhsPrize.EventName) ||
        !AreStringsEqual(lhsPrize.PrizeBand.Goal, rhsPrize.PrizeBand.Goal) ||
        !AreStringsEqual(lhsPrize.PrizeBand.GoalTarget, rhsPrize.PrizeBand.GoalTarget) ||
        !AreStringsEqual(lhsPrize.PrizeBand.GoalTarget2, rhsPrize.PrizeBand.GoalTarget2) ||
        !AreStringsEqual(lhsPrize.PrizeBand.GoalTarget3, rhsPrize.PrizeBand.GoalTarget3) ||
        !AreStringsEqual(lhsPrize.PrizeBand.TrackName, rhsPrize.PrizeBand.TrackName)) {

        return false;
    }

    var lhsPrizesCount = (lhsPrize.PrizeBand.Prizes !== null && lhsPrize.PrizeBand.Prizes !== undefined) ? lhsPrize.PrizeBand.Prizes.length : 0;
    var rhsPrizesCount = (rhsPrize.PrizeBand.Prizes !== null && rhsPrize.PrizeBand.Prizes !== undefined) ? rhsPrize.PrizeBand.Prizes.length : 0;

    if (lhsPrizesCount != rhsPrizesCount) {
        return false;
    }

    // if one is zero the other is too ...
    if (lhsPrizesCount === 0) {
        return true;
    }

    for (var i = 0; i < lhsPrizesCount; ++i)
    {
        var lhsPrizeReward = lhsPrize.PrizeBand.Prizes[i];
        var rhsPrizeReward = rhsPrize.PrizeBand.Prizes[i];

        if (!AreStringsEqual(lhsPrizeReward.PrizeType, rhsPrizeReward.PrizeType) ||
            !AreStringsEqual(lhsPrizeReward.PrizeValue, rhsPrizeReward.PrizeValue)) {
            return false;
        }
    }

    return true;
}