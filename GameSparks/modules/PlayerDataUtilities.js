requireOnce("CarInventoryUtilities");
requireOnce("CurrencyUtilities");
requireOnce("FreeBetUtilities");
requireOnce("GachaPrizeUtilities");
requireOnce("GeneralUtilities");
requireOnce("MathUtilities");
requireOnce("RaceEventUtilities");
requireOnce("RaceUtilities");
requireOnce("SessionUtilities");
requireOnce("TimeUtilities");
requireOnce("VersionedDocumentUtilities");
requireOnce("CollectionUtilities");
requireOnce("VersionedDocumentUtilities2");

// Module: PlayerDataUtilities
function PlayerHasProPackToken(playerId, carClass, manufacturer) {
    var proPacks = GetPlayerProPacks(playerId);
    for (var i = 0; i < proPacks.length; ++i) {
        if (proPacks[i].Manufacturer === manufacturer) {
            var classes = proPacks[i].Classes;
            if (classes[carClass] !== null && classes[carClass] !== undefined) {
                return (classes[carClass] > 0);
            }
            else {
                return false;
            }
        }
    }
    return false;
}

// Module: PlayerDataUtilities
function UsePlayerProPackToken(playerId, carClass, manufacturer){
    var player = Spark.loadPlayer(playerId);

    var versionedProPacks = GetVersionedPlayerProPacks(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var proPacksArray = versionedProPacks.GetData();

        for (var i = 0; i < proPacksArray.length; ++i) {
            if (proPacksArray[i].Manufacturer === manufacturer) {
                var classes = proPacksArray[i].Classes;
                if (classes[carClass] !== null && classes[carClass] !== undefined) {
                    --classes[carClass];
                    break;
                }
                else {
                    ErrorMessage(FormatString("Not enough pro pack tokens for {0} {1} to deduct one", manufacturer, carClass));
                    return;
                }
            }
        }

        successfullyWritten = versionedProPacks.SetData(proPacksArray);
    }
}


// Module: PlayerDataUtilities
function UpdateProPackTokenStructure(playerId) {
    var player = Spark.loadPlayer(playerId);

    // moderately expensive - don't do this in a loop!
    var models = GetCarModelsCollection(playerId);
    var allEntries = models.find();
    var manufacturers = [];
    while (allEntries.hasNext()){
        var entry = allEntries.next();

        var manufacturer = entry.ClientData.Manufacturer;
        if (manufacturers.indexOf(manufacturer) === -1){
            manufacturers.push(manufacturer);
        }
    }

    // This will create a shallow copy of the manufacturers list
    var allManufacturers = manufacturers.slice();

    var versionedProPacks = GetVersionedPlayerProPacks(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var proPacks = versionedProPacks.GetData();

        // as this is a loop shallow copy the manufacturers list from the allManufacturers which should not change
        manufacturers = allManufacturers.slice();

        var toRemove = [];
        // Find the manufacturers we already have, and remove them from the manufacturers list
        for (var i = 0; i < proPacks.length; ++i) {
            var proPack = proPacks[i];
            var removeIndex = manufacturers.indexOf(proPack.Manufacturer);
            if (removeIndex !== -1) {
                manufacturers.splice(removeIndex, 1);
            }
            else {
                if (allManufacturers.indexOf(proPack.Manufacturer) === -1) {
                    // Found a manufacturer in the player's data that doesn't exist
                    toRemove.push(proPack.Manufacturer);
                }
            }
        }

        // Remove manufacturers that no longer exist
        for (var i = 0; i < toRemove.length; ++i) {
            var removeIndex = proPacks.indexOf(toRemove[i]);
            if (removeIndex !== -1) {
                proPacks.splice(removeIndex, 1);
            }
        }

        // Add the remaining manufacturers to our private data
        for (var i = 0; i < manufacturers.length; ++i) {
            var newEntry = {
                Manufacturer : manufacturers[i],
                Classes : {
                    C : 0,
                    B : 0,
                    A : 0,
                    S : 0
                }
            };

            proPacks.push(newEntry);
        }
        successfullyWritten = versionedProPacks.SetData(proPacks);
    }
}

// Module: PlayerDataUtilities
function GetVersionedEventPrizes(playerId) {
    return MakeVersionedPrizeProfile(playerId, "eventPrizes", {
        unawarded : [],
        archived : []
    });
}

// Module: PlayerDataUtilities
function GetVersionedPlayerStats(playerId) {
    function GetDefaultPlayerStats() {
        var stats = {};
        stats.skill = GetWorstSkill();
        stats.trackSkills = {};
        stats.raceCount = 0;
        stats.averageBet = 0;
        return stats;
    }
    return MakeVersionedProfile(playerId, "stats", GetDefaultPlayerStats());
}

// Module: PlayerDataUtilities
function GetPlayerStats(playerId) {
    var versionedProfile = GetVersionedPlayerStats(playerId);

    var data = versionedProfile.GetData();

    if (data.trackSkills === undefined || data.trackSkills === null) {
        data.trackSkills = {};
    }

    return data;
}

// Module: PlayerDataUtilities
// returns the player cars, WITHOUT the car inventory items patched in
function GetAllPlayerCarsNoInventoryItems(playerId) {
    var versionedData = GetVersionedCars(playerId);
    if (versionedData === null || versionedData === undefined) {
        return [];
    }

    // Remove cars that were not fully owned and had expired
    var carPrivateData = versionedData.GetData();
    if (carPrivateData === null || carPrivateData === undefined) {
        return [];
    }

    var now = GetNow() / 1000;
    for (var i = carPrivateData.length - 1; i >= 0; --i) {
        var car = carPrivateData[i];
        if (car.Status.PercentageOwned < 100) {
            var expiryTime = car.Timers.GhostCarRemovalTime;
            if (expiryTime === null || expiryTime === undefined || isNaN(expiryTime)) {
                ErrorMessage(FormatString("{0}:{1} car isn't fully owned and doesn't have a valid expiry time", car.CarVariantID, car.CarID));
                continue;
            }
            if (now >= expiryTime) {
                DeletePlayerCarAtIndex(i, playerId);
            }
        }
    }

    carPrivateData = versionedData.GetData();

    return carPrivateData;
}

// Module: PlayerDataUtilities
// returns the player cars, with the car inventory items patched in
function GetAllPlayerCars(playerId) {
    var carPrivateData = GetAllPlayerCarsNoInventoryItems(playerId);

    for (var i = 0; i < carPrivateData.length; i++)
    {
	    // Link in the car inventory entry
	    var item = GetCarInventoryEntry(carPrivateData[i].CarVariantID, playerId);
		delete item._id;
	    carPrivateData[i].Item = item;
    }

    return carPrivateData;
}

// Module: PlayerDataUtilities
function GetPlayerCar(variantId, carId, playerId) {
    var carPrivateData = GetCars(playerId);
    if (carPrivateData === null || carPrivateData === undefined) {
        return null;
    }

    var car = null;
    for (var i = 0; i < carPrivateData.length; ++i) {
        var entry = carPrivateData[i];
        if (entry.CarVariantID === variantId && entry.CarID === carId) {
            car = entry;
            break;
        }
    }

    if (car === null) {
        ErrorMessage("Couldn't find " + variantId + ":" + carId + " in the player's car collection");
        return null;
    }

    car.Item = GetCarInventoryEntry(car.CarVariantID, playerId);

    return car;
}

// Module: PlayerDataUtilities
function SetPlayerCar(variantId, carId, playerId, newDetails) {
    var versionedCars = GetVersionedCars(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var carPrivateData = versionedCars.GetData();

        if (carPrivateData === null || carPrivateData === undefined) {
            ErrorMessage(variantId  + ":" + carId + " doesn't exist in the player's car inventory, so we cannot set any details");
            return;
        }
        for (var i = 0; i < carPrivateData.length; ++i) {
            // Find the car we're wanting to service in our collection
            var details = carPrivateData[i];
            if (details["CarVariantID"] === variantId && details["CarID"] === carId) {
                carPrivateData[i] = newDetails;
                if (carPrivateData[i].Item != undefined) {
                    delete carPrivateData[i].Item;
                }
                break;
            }
        }

        successfullyWritten = versionedCars.SetData(carPrivateData);
    }
}

// Module: PlayerDataUtilities
function GetPlayerActiveCar(playerId) {
    var cars = GetCars(playerId);
    if (cars === null || cars === undefined) {
        return null;
    }
    var slots = GetPlayerSlots(playerId);

    var activeIndex = slots.activeIndex;

    if (activeIndex < 0) {
        return null;
    }

    if (activeIndex > cars.length - 1) {
        return null;
    }

    var activeCar = cars[activeIndex];
    if (activeCar === undefined) {
        return null;
    }

    return activeCar;
}

// Module: PlayerDataUtilities
function ReduceDurabilityOfCurrentCar(playerId, laps) {
    var player = Spark.loadPlayer(playerId);
    if (player === null || player === undefined) {
        ErrorMessage("PlayerDataUtilities.ReduceDurabilityOfCurrentCar: player is null or undefined.");
        return false;
    }

    return ReduceDurabilityOfCurrentCarByAmount(playerId, laps);
}

function ReduceDurabilityOfCurrentCarByAmount(playerId, laps) {
    if (laps === null || laps === undefined || isNaN(laps)) {
        ErrorMessage("PlayerDataUtilities.ReduceDurabilityOfCurrentCarByAmount: laps value is invalid.");
        return false;
    }

    if (laps <= 0) {
        ErrorMessage("PlayerDataUtilities.ReduceDurabilityOfCurrentCarByAmount: laps <= 0.");
        return false;
    }

    var slots = GetPlayerSlots(playerId);

    var versionedCars = GetVersionedCars(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var cars = versionedCars.GetData();

        if (cars === null || cars === undefined) {
            ErrorMessage("PlayerDataUtilities.ReduceDurabilityOfCurrentCarByAmount: cars is null or undefined.");
            return false;
        }
        var activeIndex = slots.activeIndex;
        if (activeIndex > cars.length - 1) {
            ErrorMessage("PlayerDataUtilities.ReduceDurabilityOfCurrentCarByAmount: activeIndex is null or undefined.");
            return false;
        }
        var activeCar = cars[activeIndex];
        if (activeCar === null || activeCar === undefined) {
            ErrorMessage("PlayerDataUtilities.ReduceDurabilityOfCurrentCarByAmount: activeCar is null or undefined.");
            return false;
        }

        activeCar.Status.Durability -= laps;
        if (isNaN(activeCar.Status.Durability)) {
            var errorMessage = FormatString("Eh? Durability is nan: {0}", activeCar.Status.Durability);
            Spark.getLog().error(errorMessage);
            ErrorMessage(errorMessage);
            // Something weird happened here
            activeCar.Status.Durability = activeCar.Status.MaxDurability;
            return false;
        }
        cars[activeIndex] = activeCar;

        successfullyWritten = versionedCars.SetData(cars);

        if (successfullyWritten) {
            // Spark.getLog().info(FormatString("Reduced durability of {0}'s {1} to {2}",
            //         player.getDisplayName(), activeCar.CarVariantID, activeCar.Status.Durability));
        }
    }

    return true;
}

// Module: PlayerUtilities
function RefundCarDurabilityForCurrentCar(playerId, laps) {
    var player = Spark.loadPlayer(playerId);
    if (player === null || player === undefined) {
        return false;
    }

    if (GetPlayerFTUEFlag("PlayedSecondRace", playerId)) {
        if (isNaN(laps) || laps === undefined || laps === null || laps === 0) {
            Spark.getLog().error(FormatString("Cannot refund durability because number of laps: [{0}] is not valid", laps));
            return false;
        }
    }
    else {
        return true;
    }

    var slots = GetPlayerSlots(playerId);

    var versionedCars = GetVersionedCars(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var cars = versionedCars.GetData();

        if (cars === null || cars === undefined) {
            return false;
        }

        var activeIndex = slots.activeIndex;
        if (activeIndex > cars.length - 1) {
            return false;
        }
        var activeCar = cars[activeIndex];
        if (activeCar === null || activeCar === undefined) {
            return false;
        }
        activeCar.Status.Durability += laps;
        cars[activeIndex] = activeCar;

        successfullyWritten = versionedCars.SetData(cars);

        if (successfullyWritten) {
            // Spark.getLog().info(FormatString("Refunded durability of {0}'s {1} to {2} (+{3})",
            //         player.getDisplayName(), activeCar.CarVariantID, activeCar.Status.Durability, laps));
        }
    }
    return true;
}

// Module: PlayerDataUtilities
function AddActiveCarDurabilityToResponse(playerId, dataObject) {
    var car = GetPlayerActiveCar(playerId);
    if (car === null) {
        return;
    }

    // PSIX-1895
    // Don't let a car's durability fall below 0
    car.Status.Durability = Math.max(car.Status.Durability, 0);
    var durability = car.Status.Durability;
    if (dataObject === null || dataObject === undefined) {
        if (Spark.hasScriptErrors()) {
            Spark.setScriptError("durability", durability);
        }
        else {
            Spark.setScriptData("durability", durability);
        }
    }
    else {
        dataObject.durability = durability;
    }
}

// Module: PlayerDataUtilities
// Deprecated. Modifies the given player's car slot count (doing it's own database query / writeback).
function AdjustPlayerCarSlots(playerId, adjustment) {
    var versionedSlots = GetVersionedPlayerSlots(playerId);

    var successfullyWritten = false;
    var carSlots = {};
    while (!successfullyWritten) {
        carSlots = versionedSlots.GetData();

        AdjustPlayerCarSlotsObject(carSlots, adjustment);

        successfullyWritten = versionedSlots.SetData(carSlots);
    }

    return carSlots.count;
}

// Module: PlayerDataUtilities
// Modifies the given player's car slot count (given the VersionProfile object)
function AdjustPlayerCarSlotsInProfile(/*VersionedProfile*/ versionedProfile, adjustment, playerId) {
    var versionedSlots = GetVersionedPlayerSlotsFromProfile(versionedProfile, playerId);
    return AdjustPlayerCarSlotsObject(versionedSlots.GetData(), adjustment);
}

// Module: PlayerDataUtilities
// Modifies the given player's car slot count (given the carSlots object)
function AdjustPlayerCarSlotsObject(/*object*/ carSlots, adjustment) {
    if (adjustment < 0) {
        if (carSlots.count > -adjustment) {
            carSlots.count += adjustment;
        }
    }
    else {
        carSlots.count += adjustment;
    }

    return carSlots.count;
}

// Module: PlayerDataUtilities
// Returns the number of car slots the player has.
function GetPlayerCarSlotsCount(playerId) {
    var player = Spark.loadPlayer(playerId);
    var carSlots = GetPlayerSlots(playerId);
    var count = carSlots.count;
    return count;
}

// Module: PlayerDataUtilities
function GetPlayerCarSlotsDefault(playerId) {
    var carSlotCostData = GetCarSlotCostsCollection(playerId).findOne();
    var freeSlots = carSlotCostData.ClientData.FreeSlots;
    var carSlots = {};
    carSlots.count = freeSlots;
    carSlots.activeIndex = 0;
    return carSlots;
}

// Module: PlayerDataUtilities
function GetVersionedPlayerSlots(playerId) {
    return MakeVersionedProfile(playerId, "slots", GetPlayerCarSlotsDefault(playerId));
}

// Module: PlayerDataUtilities
function GetVersionedPlayerSlotsFromProfile(versionedProfile, playerId) {
    return versionedProfile.GetVersionedKey("slots", GetPlayerCarSlotsDefault(playerId));
}

// Module: PlayerDataUtilities
function GetPlayerSlots(playerId) {
    var versionedProfile = GetVersionedPlayerSlots(playerId);

    var data = versionedProfile.GetData();

    return data;
}

// Module: PlayerDataUtilities.
// Gets the cost of the given slot number.
function GetCostOfSlot(slotNumber, playerId) {
    var carSlotCostData = GetCarSlotCostsCollection(playerId).findOne();
    var freeSlots = carSlotCostData.ClientData.FreeSlots;
    if (slotNumber <= freeSlots) {
        return 0;
    }
    else {
        var slotIndex = slotNumber - 1;
        var slotIndexToPurchase = Math.min(slotIndex - freeSlots, carSlotCostData.ClientData.CarSlotCosts.length - 1);
        return carSlotCostData.ClientData.CarSlotCosts[slotIndexToPurchase];
    }
}

// Module: PlayerDataUtilities
function GetPlayerActiveIndex(playerId) {
    var carSlots = GetPlayerSlots(playerId);
    return carSlots["activeIndex"];
}

// Module: PlayerDataUtilities
function SetPlayerActiveIndex(versionedProfile, playerId, activeIndex) {
    var versionedSlots = GetVersionedPlayerSlotsFromProfile(versionedProfile, playerId);

    var carSlots = versionedSlots.GetData();

    carSlots["activeIndex"] = activeIndex;
}

// Module: PlayerDataUtilities
function DeletePlayerCarAtIndex(slotIndex, playerId) {
    var activeIndex = GetPlayerActiveIndex(playerId);

    var versionedProfile = MakeVersionedProfileDocument(playerId);

    var versionedCars = GetVersionedCarsFromProfile(versionedProfile);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var cars = versionedCars.GetData();

        if (cars === null || cars === undefined) {
            return;
        }

        if (slotIndex >= cars.length) {
            ErrorMessage("PlayerDataUtilities.DeletPlayerCar(): There is no car at index " + slotIndex);
            return;
        }

        var decIndex = (slotIndex < activeIndex);
        var resetIndex = (slotIndex == activeIndex);
        cars.splice(slotIndex, 1);

        if (decIndex) {
            SetPlayerActiveIndex(versionedProfile, playerId, activeIndex - 1);
        }
        if (resetIndex) {
            SetPlayerActiveIndex(versionedProfile, playerId, 0);
        }

        successfullyWritten = versionedProfile.Save();
    }
}

// Module: PlayerDataUtilities
function SellPlayerCarAtIndex(slotIndex, playerId) {
    var sellValue = 0;

    var activeIndex = GetPlayerActiveIndex(playerId);

    var versionedProfile = MakeVersionedProfileDocument(playerId);

    var versionedCars = GetVersionedCarsFromProfile(versionedProfile);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var carPrivateData = versionedCars.GetData();

        if (carPrivateData === null || carPrivateData === undefined) {
            return;
        }

        if (slotIndex >= carPrivateData.length){
            ErrorMessage("PlayerDataUtilities.SellPlayerCarAtIndex(): There is no car at index " + slotIndex);
            return;
        }
        // Get the car's value and current Life.
        var carInventoryData = GetCarInventoryEntry(carPrivateData[slotIndex].CarVariantID, playerId);
        var carHardValue = carInventoryData.Value.Hard;

        // Figure out how much we get for it (between 50% and 2% of the car's value depending on its current Life)
        var lowSellValue = Math.ceil(carHardValue * 0.25);
        sellValue = lowSellValue;

        carPrivateData.splice(slotIndex, 1);

        if (activeIndex === slotIndex && activeIndex > 0) {
            // We just removed the car we were in so start at the next slot down
            --activeIndex;
        }
        if (activeIndex > slotIndex) {
            --activeIndex;
        }
        // Iterate downwards through the cars and pick the first fully-owned car we find
        var activeIndexReset = false;
        for (var i = activeIndex; i >= 0; --i) {
            if (carPrivateData[i].Status.PercentageOwned === 100) {
                SetPlayerActiveIndex(versionedProfile, playerId, i);
                activeIndexReset = true;
                break;
            }
        }
        // If we didn't find any cars below us that are fully-owned
        // go back up the list until we find one
        if (!activeIndexReset) {
            for (var i = 0; i < carPrivateData.length; ++i) {
                if (carPrivateData[i].Status.PercentageOwned === 100) {
                    SetPlayerActiveIndex(versionedProfile, playerId, i);
                    activeIndexReset = true;
                    break;
                }
            }
        }
        // If we still haven't found a car to be put in something has gone horribly wrong
        if (!activeIndexReset) {
            ErrorMessage("PlayerDataUtilities.SellPlayerCarAtIndex(): Failed to find a fully-owned car to become the active car!");
            return;
        }

        successfullyWritten = versionedProfile.Save();
    }

    // Credit the player with the bling bling.
    Credit(sellValue, true, playerId);
}

// Module: PlayerDataUtilities
// Retrieves a score stored in the player's private data for the given challenge.
function GetPlayerFakeScoreForChallenge(challengeId, playerId, startingScore) {
    //LogMessage("GetPlayerFakeScoreForChallenge");

    var versionedTempScores = GetVersionedTempScores(playerId);
    var tempScores = versionedTempScores.GetData();

    if (tempScores === null || tempScores === undefined){
        return 0;
    }

    for (var i = 0; i < tempScores.length; ++i) {
        for (var key in tempScores[i]) {
            if (key === challengeId) {
                //LogMessage("Found tempScores");
                var score = tempScores[i][key];
                if (score === null || score === undefined) {
                    return 0;
                }
                else if (isNaN(score)) {
                    Spark.getLog.error(FormatString("PlayerDataUtilities.GetPlayerFakeScoreForChallenge() tempScore for {0} is NaN", key));
                    return 0;
                }
                else {
                    return score;
                }
            }
        }
    }

    //LogMessage("No tempScores with the challenge key that we need");
    return 0;
}

// Module: PlayerDataUtilities
// Stores a score in the player's private data to post later. This is used when the player is the only
// participant in a challenge, because you can't post to a challenge leaderboard until at least two
// people have entered the challenge.
function AddToPlayerFakeScore(challengeId, playerId, value) {
    var player = Spark.loadPlayer(playerId);
    var versionedTempScores = GetVersionedTempScores(playerId);
    var successfullyWritten = false;

    while (!successfullyWritten) {

        var data = {};

        data.score = FindChallengeEntryAndReturnValue(fakeScores, challengeId);
        data.victories = FindChallengeEntryAndReturnValue(fakeVictories, challengeId);
        data.races = FindChallengeEntryAndReturnValue(fakeRaces, challengeId);

        return data;
    }
}

// Module: PlayerDataUtilities
function FindChallengeEntryAndReturnValue(array, challengeId) {
    for (var i = 0; i < array.length; ++i) {
        var entry = array[i];
        for (var key in entry) {
            if (key === challengeId) {
                var value = entry[key];
                if (value === null || value === undefined) {
                    return 0;
                }
                else if (isNaN(value)) {
                    Spark.getLog.error(FormatString("PlayerDataUtilities.FindChallengeEntryAndReturnValue() value for {0} is NaN", key));
                    return 0;
                }
                else {
                    return value;
                }
            }
        }
    }
    return 0;
}

// Module: PlayerDataUtilities
function GetVersionedFakeDataScoresFromProfile(versionedProfile) {
    return versionedProfile.GetVersionedKey("tempScores", []);
}

// Module: PlayerDataUtilities
function GetVersionedFakeDataVictoriesFromProfile(versionedProfile) {
    return versionedProfile.GetVersionedKey("tempVictories", []);
}

// Module: PlayerDataUtilities
function GetVersionedFakeDataRacesFromProfile(versionedProfile) {
    return versionedProfile.GetVersionedKey("tempRaces", []);
}

// Module: PlayerDataUtilities
function GetAllPlayerFakeData(challengeId, playerId) {
    var versionedProfile = MakeVersionedProfileDocument(playerId);

    var versionedFakeScores = GetVersionedFakeDataScoresFromProfile(versionedProfile);
    var versionedFakeVictories = GetVersionedFakeDataVictoriesFromProfile(versionedProfile);
    var versionedFakeRaces = GetVersionedFakeDataRacesFromProfile(versionedProfile);

    var fakeScores = versionedFakeScores.GetData();
    var fakeVictories = versionedFakeVictories.GetData();
    var fakeRaces = versionedFakeRaces.GetData();

    var data = {};

    data.score = FindChallengeEntryAndReturnValue(fakeScores, challengeId);
    data.victories = FindChallengeEntryAndReturnValue(fakeVictories, challengeId);
    data.races = FindChallengeEntryAndReturnValue(fakeRaces, challengeId);

    return data;
}

function UpdatePlayerFakeData(challengeId, playerId, score, victories, races) {
    var versionedProfile = MakeVersionedProfileDocument(playerId);

    var versionedFakeScores = GetVersionedFakeDataScoresFromProfile(versionedProfile);
    var versionedFakeVictories = GetVersionedFakeDataVictoriesFromProfile(versionedProfile);
    var versionedFakeRaces = GetVersionedFakeDataRacesFromProfile(versionedProfile);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var fakeScores = versionedFakeScores.GetData();
        var fakeVictories = versionedFakeVictories.GetData();
        var fakeRaces = versionedFakeRaces.GetData();

        FindChallengeEntryAndIncrementValue(fakeScores, challengeId, score);
        FindChallengeEntryAndIncrementValue(fakeVictories, challengeId, victories);
        FindChallengeEntryAndIncrementValue(fakeRaces, challengeId, races);

        versionedFakeScores.SetData(fakeScores);
        versionedFakeVictories.SetData(fakeVictories);
        versionedFakeRaces.SetData(fakeRaces);

        successfullyWritten = versionedProfile.Save();
    }

    function FindChallengeEntryAndIncrementValue(array, challengeId, increment) {
        var found = false;
        var done = false;
        if (array !== null && array !== undefined) {
            for (var i = 0; i < array.length; ++i) {
                var entry = array[i];
                for (var key in entry) {
                    if (key === challengeId) {
                        var value = entry[key];
                        if (value === null || value === undefined) {
                            value = 0;
                        }
                        else if (isNaN(value)) {
                            Spark.getLog.error(FormatString("PlayerDataUtilities.FindChallengeEntryAndIncrementValue() value for {0} is NaN", key));
                            value = 0;
                        }

                        value += increment;
                        entry[key] = value;
                        found = true;
                    }

                    if (found) {
                        break;
                    }
                }

                if (done) {
                    break;
                }
            }
        }

        if (!found && increment > 0) {
            var newEntry = {};
            newEntry[challengeId] = increment;
            if (array === null || array === undefined) {
                array = [];
            }
            array.push(newEntry);
        }
    }
}

// Module: PlayerDataUtilities
// Prefer the version taking a the versionedProfile ...
function RemovePlayerFakeDataFromPlayerId(playerId, challengeId) {
    var versionedProfile = MakeVersionedProfileDocument(playerId);

    var versionedFakeScores = GetVersionedFakeDataScoresFromProfile(versionedProfile);
    var versionedFakeVictories = GetVersionedFakeDataVictoriesFromProfile(versionedProfile);
    var versionedFakeRaces = GetVersionedFakeDataRacesFromProfile(versionedProfile);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var fakeScores = versionedFakeScores.GetData();
        var fakeVictories = versionedFakeVictories.GetData();
        var fakeRaces = versionedFakeRaces.GetData();

        RemovePlayerFakeDataFromArrays(fakeScores, fakeVictories, fakeRaces, challengeId);

        successfullyWritten = versionedProfile.Save();
    }
}

// Module: PlayerDataUtilities
// Removes the fake leaderboard data from the passed versioned profile.
function RemovePlayerFakeData(versionedProfile, challengeId) {
    var versionedFakeScores = GetVersionedFakeDataScoresFromProfile(versionedProfile);
    var versionedFakeVictories = GetVersionedFakeDataVictoriesFromProfile(versionedProfile);
    var versionedFakeRaces = GetVersionedFakeDataRacesFromProfile(versionedProfile);

    var fakeScores = versionedFakeScores.GetData();
    var fakeVictories = versionedFakeVictories.GetData();
    var fakeRaces = versionedFakeRaces.GetData();

    RemovePlayerFakeDataFromArrays(fakeScores, fakeVictories, fakeRaces, challengeId);
}

// Module: PlayerDataUtilities
// Removes the fake leaderboard data from the passed arrays.
function RemovePlayerFakeDataFromArrays(fakeScores, fakeVictories, fakeRaces, challengeId) {
    RemoveExpiredChallengeEntry(challengeId, fakeScores);
    RemoveExpiredChallengeEntry(challengeId, fakeVictories);
    RemoveExpiredChallengeEntry(challengeId, fakeRaces);

    function RemoveExpiredChallengeEntry(challengeId, array) {
        if (array !== null && array !== undefined) {
            for (var i = array.length - 1; i >= 0; --i) {
                var entry = array[i];
                for (var key in entry) {
                    if (key === challengeId) {
                        array.splice(i, 1);
                        return;
                    }
                }
            }
        }
    }
}

// Module: PlayerDataUtilities
function ClearUnusedPlayerFakeLeaderboardData(playerId) {
    var versionedProfile = MakeVersionedProfileDocument(playerId);

    var versionedFakeScores = GetVersionedFakeDataScoresFromProfile(versionedProfile);
    var versionedFakeVictories = GetVersionedFakeDataVictoriesFromProfile(versionedProfile);
    var versionedFakeRaces = GetVersionedFakeDataRacesFromProfile(versionedProfile);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var fakeScores = versionedFakeScores.GetData();
        var fakeVictories = versionedFakeVictories.GetData();
        var fakeRaces = versionedFakeRaces.GetData();

        var expiredChallengeIds = {};
        RemoveExpiredChallengeEntries(expiredChallengeIds, fakeScores, playerId);
        RemoveExpiredChallengeEntries(expiredChallengeIds, fakeVictories, playerId);
        RemoveExpiredChallengeEntries(expiredChallengeIds, fakeRaces, playerId);

        versionedFakeScores.SetData(fakeScores);
        versionedFakeVictories.SetData(fakeVictories);
        versionedFakeRaces.SetData(fakeRaces);

        successfullyWritten = versionedProfile.Save();
    }

    function RemoveExpiredChallengeEntries(expiredChallengeIds, array, playerId) {
        if (array !== null && array !== undefined) {
            for (var i = array.length - 1; i >= 0; --i) {
                var entry = array[i];
                for (var key in entry) {
                    var challengeDoesNotNeedFakeDataAnymore = (expiredChallengeIds[key] === undefined);
                    if (!challengeDoesNotNeedFakeDataAnymore) {
                        challengeDoesNotNeedFakeDataAnymore = ChallengeDoesNotNeedFakeDataAnymore(key, playerId);
                    }
                    if (challengeDoesNotNeedFakeDataAnymore) {
                        //Spark.getLog().info(FormatString("removing temp scores for {0}", key));
                        array.splice(i, 1);
                        if (!expiredChallengeIds[key]) {
                            expiredChallengeIds[key] = true;
                        }
                    }
                }
            }
        }
    }

    function ChallengeDoesNotNeedFakeDataAnymore(challengeId, playerId) {
        var challengeInstances = Spark.systemCollection("challengeInstance");
        var challenge = challengeInstances.findOne({"_id":{"$oid":challengeId}}, {"state": 1, "endDate": 1});
        // Instance doesn't exist at all!
        if (challenge === null || challenge === undefined) {
            //Spark.getLog().info(FormatString("ChallengeDoesNotNeedFakeDataAnymore: {0} challenge is null/undefined", challengeId));
            return true;
        }
        // Instance has finished
        if (ChallengeHasFinished(challenge)/*COMPLETE, EXPIRED, LAPSED, CHALLENGE_TEMPLATE_DELETED*/) {
            //Spark.getLog().info(FormatString("ChallengeDoesNotNeedFakeDataAnymore: {0} challenge has finished", challengeId));
            return true;
        }
        var leaderboard = Spark.getLeaderboards().getChallengeLeaderboard(challengeId);
        var entryCount = leaderboard.getEntryCountForIdentifier(playerId);
        // If we have at least one entry in the leaderboard then we have no use for the fake data
        if (entryCount > 0) {
            //Spark.getLog().info(FormatString("ChallengeDoesNotNeedFakeDataAnymore: {0} challenge has at least 1 entry", challengeId));
            return true;
        }

        return false;
    }
}

// Module: PlayerDataUtilities
function UpdateAllCarsToMatchCarInventory(playerId) {
    var collection = GetCarInventoryCollection(playerId);
    if (collection === null || collection === undefined){
        return;
    }

    var versionedCars = GetVersionedCars(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var carPrivateData = versionedCars.GetData();

        if (carPrivateData !== null && carPrivateData !== undefined) {
            if (carPrivateData.length > 0) {
                for (var i = carPrivateData.length - 1; i >= 0; --i) {
                    var playerCar = carPrivateData[i];
                    var inventoryCar = collection.findOne({"CarVariantID": playerCar.CarVariantID});
                    if (inventoryCar === null || inventoryCar === undefined) {
                        // Car isn't in the CarInventory anymore, so remove it from the player's inventory
                        carPrivateData.splice(i, 1);
                    }
                }
            }
        }

        successfullyWritten = versionedCars.SetData(carPrivateData);
    }
}

// Module: PlayerDataUtilities
function GetVersionedFTUEFlags(playerId) {
    return MakeVersionedProfile(playerId, "FTUEFlags", {});
}

// Module: PlayerDataUtilities
function GetPlayerFTUEFlags(playerId) {

    var ftueFlags = GetVersionedFTUEFlags(playerId).GetData();

    return ftueFlags;
}

// Module: PlayerDataUtilities
function SetPlayerFTUEFlag(flagName, playerId) {
    var versionedFlags = GetVersionedFTUEFlags(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var ftueFlags = versionedFlags.GetData();

        ftueFlags[flagName] = 1;

        successfullyWritten = versionedFlags.SetData(ftueFlags);
    }
}

// Module: PlayerDataUtilities
function UnsetPlayerFTUEFlag(flagName, playerId) {
    var versionedFlags = GetVersionedFTUEFlags(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var ftueFlags = versionedFlags.GetData();

        delete ftueFlags[flagName];

        successfullyWritten = versionedFlags.SetData(ftueFlags);
    }
}

// Module: PlayerDataUtilities
function GetPlayerFTUEFlag(flagName, playerId) {
    var ftueFlags = GetPlayerFTUEFlags(playerId);
    return (flagName in ftueFlags) || ("AllFTUEComplete" in ftueFlags);
}

function GetVersionedLevelUpShown(playerId) {
    return MakeVersionedProfile(playerId, "levelUpShown", 0);
}

function AddLevelUpShownToResponse(playerId) {
    Spark.setScriptData("levelUpShown", GetVersionedLevelUpShown(playerId).GetData());
}

function SetPlayerLevelUpShown(playerId, level) {
    var versionedLevelUpShown = GetVersionedLevelUpShown(playerId);
    var successfullyWritten = false;
    while (!successfullyWritten) {
        versionedLevelUpShown.GetData();
        successfullyWritten = versionedLevelUpShown.SetData(level);
    }
}

// Module: PlayerDataUtilities
function GetVersionedBankBoxKeys(playerId) {
    return MakeVersionedProfile(playerId, "bankBoxKeys", {"bronze": 0, "silver": 0, "gold": 0});
}

// Module: PlayerDataUtilities
function GetVersionedPlayerProPacks(playerId) {
    return MakeVersionedProfile(playerId, "proPacks", []);
}

// Module: PlayerDataUtilities
function GetPlayerProPacks(playerId) {
    var versionedProfile = GetVersionedPlayerProPacks(playerId);

    var data = versionedProfile.GetData();

    return data;
}

function GetVersionedBlueprints(playerId) {
    return MakeVersionedProfile(playerId, "blueprints", []);
}

// Module: PlayerDataUtilities
function GetVersionedPlayerEventGoalProgressData(playerId) {
    return MakeVersionedProfile(playerId, "eventGoalData", {});
}

// Module: PlayerDataUtilities
function GetVersionedPlayerLadderProgressData(playerId) {
    return MakeVersionedProfile(playerId, "ladderProgressData", {});
}

// Module: PlayerDataUtilities
function GetPlayerLadderProgressData(playerId) {
    var versionedLadderProgressData = GetVersionedPlayerLadderProgressData(playerId);
    return versionedLadderProgressData.GetData();
}

// Module: PlayerDataUtilities
function AddLadderProgressToResponse(playerId) {
    Spark.setScriptData("ladderProgressData", GetVersionedPlayerLadderProgressData(playerId).GetData());
}

// Module: PlayerDataUtilities
function ActiveIndex(playerId){
    Spark.setScriptData("activeIndex", GetPlayerActiveIndex(playerId));
}

// Module: PlayerDataUtilities
function OwnerCarSlots(playerId) {
    Spark.setScriptData("slots", GetPlayerCarSlotsCount(playerId));
}

// Module: PlayerDataUtilities
// Puts all the player cars into the response either in the ScriptData or the Error object.
function ReturnOwnedCarsInScriptData(playerId) {
    Spark.setScriptData("playerCars", GetAllPlayerCars(playerId));
}

// Module: PlayerDataUtilities
// Puts a single player cars into the response in the ScriptData.
function ReturnOwnedCarInScriptData(playerId, carVariant, carVariantDiscriminator) {
    Spark.setScriptData("playerCar", GetPlayerCar(carVariant, carVariantDiscriminator, playerId));
}

// Module: PlayerDataUtilities
function FTUEFlags(playerId) {
    Spark.setScriptData("ftueFlags", GetPlayerFTUEFlags(playerId));
}

// Module: PlayerDataUtilities
function AddBankBoxKeysToResponse(playerId) {
    if (Spark.hasScriptErrors()) {
        Spark.setScriptError("bankBoxKeys", GetVersionedBankBoxKeys(playerId).GetData());
    }
    else {
        Spark.setScriptData("bankBoxKeys", GetVersionedBankBoxKeys(playerId).GetData());
    }
}

// Module: PlayerDataUtilities
function ProPacks(playerId) {
    Spark.setScriptData("proPacks", GetPlayerProPacks(playerId));
}

// Module: PlayerDataUtilities
function BlueprintPieces(playerId) {
    var versionedBlueprints = GetVersionedBlueprints(playerId);
    var blueprintData = versionedBlueprints.GetData();

    for (var i = 0; i < blueprintData.length; i++) {
	    // Link in the car inventory entry
	    blueprintData[i].CarVariant.ModelData = GetCarInventoryEntry(blueprintData[i].CarVariant.CarVariantID, playerId).ModelData;
    }

    Spark.setScriptData("blueprints", blueprintData);
}

// Module: PlayerDataUtilities
function FreeBets(playerId) {
    Spark.setScriptData("freeBets", GetVersionedFreeBets(playerId).GetData());
}

// Module: PlayerDataUtilities
function SetSessionStateInResponse(playerId){
    Spark.setScriptData("sessionState", GetVersionedSessionState(playerId).GetData());
}

// Module: PlayerDataUtilities
function SetEventGoalProgressDataInResponse(playerId) {
    Spark.setScriptData("eventGoalProgressData", GetVersionedPlayerEventGoalProgressData(playerId).GetData());
}

// Module: PlayerDataUtilities
function AddLadderProgressToScriptData(playerId){
    Spark.setScriptData("ladderProgressData", GetPlayerLadderProgressData(playerId));
}

// Module: PlayerDataUtilities
// Resets pretty much everything in the player's profile.
function NukePlayerProfile(playerId) {
    var player;

    if (playerId === null || playerId === undefined) {
        player = Spark.getPlayer();
        playerId = player.getPlayerId();
    }
    else {
        player = Spark.loadPlayer(playerId);
    }

    // Error if the player's still null!
    if (player === null || player === undefined) {
        Spark.getLog().error(FormatString("Can't nuke the profile of player \"{0}\": the ID is invalid or the player doesn't exist!", playerId));
        return;
    }

    // remove the player from all currently subscribed challenges
    var events = GetVersionedEvents2(playerId).GetData();

    for (var key in events) {
        var eventDatas = events[key];

        for (var i = 0; i < eventDatas.length; ++i) {
            var event = eventDatas[i];
            var challengeId = event.challengeId;
            if (challengeId === null || challengeId === undefined) {
                continue;
            }
            var challenge = Spark.getChallenge(challengeId);
            challenge.removePlayer(playerId);
        }
    }

    // Each level is a virtual good which the player gains but never uses.  We use up all
    // but one of them here to return to level 1.
    player.useVGood("Level", player.hasVGood("Level") - 1);

    SetPlayerLevelUpShown(playerId, 1);

    player.debit1(player.getBalance1());
    player.debit2(player.getBalance2());
    player.debit3(player.getBalance3());
    player.debit4(player.getBalance4());
    player.debit5(player.getBalance5());
    player.debit6(player.getBalance6());

    NukeProfileTablesEntries(playerId);

    // Remove cars from dealership
    Spark.runtimeCollection("PlayerDealership").remove({"_id":playerId});
}

function GetVersionedUnfilteredDisplayName(playerId) {
    var versionedData = MakeVersionedProfile(playerId, "unfilteredDisplayName", "");

    var needsToWrite = false;

    do {

        var data = versionedData.GetData();

        // upgrade to data type if necessary
        if ((typeof data) == "string") {
            var newData = {};
            newData.profanityCheckTime = 0;
            newData.unfilteredName = data;
            needsToWrite = true;
        }
        if (data === null || data === undefined) {
            data = {};
        }
        if (data.unfilteredName === undefined || data.unfilteredName === null) {
            var player = Spark.loadPlayer(playerId);
            if (player === undefined || player === null) {
                data.unfilteredName = "";
            } else {
                data.unfilteredName = player.getDisplayName();
            }
            needsToWrite = true;
        }
        if (data.profanityCheckTime === undefined || data.profanityCheckTime === null) {
            data.profanityCheckTime = 0;
            needsToWrite = true;
        }

        if (needsToWrite) {
            needsToWrite = !versionedData.SetData(data);
        }
    }
    while(needsToWrite);
    return versionedData;
}

function GetUnfilteredDisplayName() {
    var versionedUnfilteredName = GetVersionedUnfilteredDisplayName(Spark.player.playerId);

    var data = versionedUnfilteredName.GetData();

    return data.unfilteredName;
}

function GetUnfilteredDisplayNameTime() {
    var versionedUnfilteredName = GetVersionedUnfilteredDisplayName(Spark.player.playerId);

    var data = versionedUnfilteredName.GetData();

    return data.profanityCheckTime;
}

function SetUnfilteredDisplayName(name) {
    var versionedUnfilteredName = GetVersionedUnfilteredDisplayName(Spark.player.playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var data = versionedUnfilteredName.GetData();

        data.unfilteredName = name;
        data.profanityCheckTime = GetNow()
        successfullyWritten = versionedUnfilteredName.SetData(data);
    }
}

function ChangeDisplayName(name, playerId) {
    var censoredDisplayName = CensorDisplayName(name, playerId);
    var response = Spark.sendRequest({"@class": ".ChangeUserDetailsRequest",
                                "displayName": censoredDisplayName});

    SetUnfilteredDisplayName(name);
}


function CensorDisplayName(name, playerId) {

    var profanity = GetProfanityCollection(playerId);
    if (profanity === null || profanity === undefined) {
        Spark.getLog().debug("Could not find Profanity table");
        return name;
    }

    // TODO: Do it on the user's language
    var newName = ReplaceProfaneWordsForLanguage(name, profanity, "EN_US");

    return newName;
}

function ReplaceProfaneWordsForLanguage(name, profanity, language) {

    var language = profanity.findOne({"Language": language});
    if (language === null || language === undefined) {
        Spark.getLog().debug("Could not find " + language + " entry");
        return name;
    }

    var words = language.ProfaneWords;
    if (words === null || words === undefined) {
        Spark.getLog().debug("Could not find words");
        return name;
    }

    return ReplaceProfaneWords(name, words);
}

function ReplaceProfaneWords(name, words) {
    var lowerCase = name.toLowerCase();
    for (var i = 0; i < words.length; i++)
    {
        var word = words[i];
        var pos = 0;
        while (true) {
            var index = lowerCase.indexOf(word, pos);
            if (index == -1) {
                break;
            }
            pos = index + word.length;
            var newName = name.slice(0, index) + SwearSymbols(word) + name.slice(pos);
            name = newName;
        }
    }

    return name;
}

function SwearSymbols(original) {
    return "£%$&*@#?".substr(0, Math.min(original.length, 8));
}