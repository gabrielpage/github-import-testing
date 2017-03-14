// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("CurrencyUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("CarInventoryUtilities");
requireOnce("FreeBetUtilities");
requireOnce("XPUtilities");
requireOnce("TimeUtilities");
requireOnce("CollectionUtilities");

// Module: GachaPrizeUtilities.
// Opens a bank box of the specified type and deducts a key from the player.
// Returns the prize won, or null if the player had insufficient keys.
function OpenBankBox(player, type) {
    var playerId = player.getPlayerId();
    var canOpenBox = false;

    var versionedBankBoxKeys = GetVersionedBankBoxKeys(playerId);

    var successfullyWritten = false;
    while(!successfullyWritten) {
        var canOpenBox;
        var bankBoxKeys = versionedBankBoxKeys.GetData();

        // Check the box type is valid. We deduct the key at the end, after the prize is awarded successfully.
        switch (type)
        {
            case "Bronze":
                if (bankBoxKeys.bronze != null && bankBoxKeys.bronze > 0) {
                    canOpenBox = true;
                }
                else {
                    bankBoxKeys.bronze = 0;
                }
                break;
            case "Silver":
                if (bankBoxKeys.silver != null && bankBoxKeys.silver > 0) {
                    canOpenBox = true;
                }
                else {
                    bankBoxKeys.silver = 0;
                }
                break;
            case "Gold":
                if (bankBoxKeys.gold != null && bankBoxKeys.gold > 0) {
                    canOpenBox = true;
                }
                else {
                    bankBoxKeys.gold = 0;
                }
                break;
            default:
                ErrorMessage(FormatString("ARG; we can't open a Bank Box of type \"{0}\"!", type));
                return null;
        }

        successfullyWritten = versionedBankBoxKeys.SetData(bankBoxKeys);
    }

    // No key, no boxy!
    if (!canOpenBox)
        return null;

    // First, get the config of the box we're opening.
    var boxCollection = GetBankBoxPrizesCollection(playerId);
    var boxConfig = boxCollection.findOne({"BoxType": type});

    if (boxConfig == null) {
        ErrorMessage(FormatString("ARG; there's no configuration for the \"{0}\" Bank Box!", type));
        return null;
    }

    // The box is made up of "groups" and "prizes", each with a weight value. For each group, we need to
    // roll to pick a group or prize. We keep rolling and traversing through the groups until a prize is
    // picked.
    function RollForNextPrize(groups, prizes, playerId) {
        var totalTierWeight = 0;

        if (groups != null && groups.length > 0) {
            for (var i = 0; i < groups.length; i++) {
                totalTierWeight += groups[i].Weight;
            }
        }
        if (prizes != null && prizes.length > 0) {
            for (var i = 0; i < prizes.length; i++) {
                totalTierWeight += prizes[i].Weight;
            }
        }

        // Roll from 0-1 and multiply by our total weight.
        var roll = Math.random() * totalTierWeight;
        var currentWeight = totalTierWeight;

        // Now loop through the groups and prizes once again.
        if (groups != null && groups.length > 0) {
            for (var i = 0; i < groups.length; i++) {
                currentWeight -= groups[i].Weight;
                if (roll >= currentWeight) {
                    // We rolled a group. Repeat this method for the selected group.
                    return RollForNextPrize(groups[i].PrizeGroups, groups[i].PrizeGroupPrizeEntries, playerId);
                }
            }
        }
        if (prizes != null && prizes.length > 0) {
            for (var i = 0; i < prizes.length; i++) {
                currentWeight -= prizes[i].Weight;
                if (roll >= currentWeight) {
                    // We rolled a prize! Return it!
                    return prizes[i];
                }
            }
        }

        // We REALLY shouldn't get here...
        return null;
    }

    // Roll for our next prize!
    var selectedPrize = RollForNextPrize(boxConfig.PrizeGroups, null, playerId);

    if (selectedPrize == null) {
        ErrorMessage(FormatString("ARG; we got a null prize when rolling the \"{0}\" Bank Box!", type));
        return null;
    }

    // Now we have a prize, we should credit it and pick out the parameters we need to send to the client based on the prize type.
    var prize = {
        BoxType: type,
        PrizeType: selectedPrize.PrizeType,
        PrizeValue: "",
        PrizeValue2: "",
        PrizeValue3: "",
        PrizeExpiry: 0
    };

    switch (selectedPrize.PrizeType)
    {
        case "Cash":
            var cashPrize = 0;

            // Depending on the number of entries in the LeveledCashValues array, we might need to do more work.
            if (selectedPrize.LeveledCashValues == null || selectedPrize.LeveledCashValues.length == 0) {
                // Dafuq.
                ErrorMessage(FormatString("ARG; the selected prize's LeveledCashValues array was null or empty! (\"{0}\" Bank Box)", type));
                return null;
            }
            else if (selectedPrize.LeveledCashValues.length == 1) {
                // Thank God, just give them whatever's in index 0.
                cashPrize = selectedPrize.LeveledCashValues[0];
            }
            else {
                // Arrrgh. Now we need to award them whatever is in the index that matches the player level - 1.
                var playerLevel = GetXPInfo(player).Level;
                cashPrize = selectedPrize.LeveledCashValues[playerLevel - 1];
            }

            // Credit da moolah!
            if (!isNaN(cashPrize)) {
                Credit(cashPrize, false, player.getPlayerId());
                IncrementLifetimeWinnings(player.getPlayerId(), cashPrize);
                AddLifetimeWinningsToResponse(playerId);

                // Just need to set PrizeValue to the cash value awarded.
                prize.PrizeValue = cashPrize.toString();
            }
            break;
        case "Gold":
            var goldPrize = 0;

            // Depending on the number of entries in the LeveledGoldValues array, we might need to do more work.
            if (selectedPrize.LeveledGoldValues == null || selectedPrize.LeveledGoldValues.length == 0) {
                // Dafuq.
                ErrorMessage(FormatString("ARG; the selected prize's LeveledGoldValues array was null or empty! (\"{0}\" Bank Box)", type));
                return null;
            }
            else if (selectedPrize.LeveledGoldValues.length == 1) {
                // Thank God, just give them whatever's in index 0.
                goldPrize = selectedPrize.LeveledGoldValues[0];
            }
            else {
                // Arrrgh. Now we need to award them whatever is in the index that matches the player level - 1.
                var playerLevel = GetXPInfo(player).Level;
                goldPrize = selectedPrize.LeveledGoldValues[playerLevel - 1];
            }

            // Credit da gold!
            if (!isNaN(goldPrize)) {
                Credit(goldPrize, true, player.getPlayerId());

                // Just need to set PrizeValue to the gold value awarded.
                prize.PrizeValue = goldPrize.toString();
            }
            break;
        case "ProPack":
            // Roll a manufacturer.
            var carClass = selectedPrize.BlueprintOrProPackClass;
            var manufacturer;

            while (true) {
                manufacturer = RollManufacturer(carClass, playerId);

                // This really really shouldn't happen.
                if (manufacturer === null) {
                    Spark.getLog().error(FormatString("ARG: Couldn't roll a car manufacturer for a Class {0} Pro Pack, meaning there are no Class {0} cars in the Car Inventory?!", carClass));

                    // But if it does, we should drop down a class and try again.
                    if (carClass === "S") {
                        carClass = "A";
                    }
                    else if (carClass === "A") {
                        carClass = "B";
                    }
                    else if (carClass === "B") {
                        carClass = "C";
                    }
                    else {
                        // Okay, we're screwed. Bailing!
                        ErrorMessage(FormatString("ARG; couldn't roll a car manufacturer for a Class {0} Pro Pack and I am scared! (\"{0}\" Bank Box)", type));
                        return null;
                    }
                }
                else {
                    break;
                }
            }

            var versionedProPacks = GetVersionedPlayerProPacks(playerId);

            var successfullyWritten = false;
            while (!successfullyWritten) {
                var proPacksArray = versionedProPacks.GetData();

                var selectedProPackData;
                var selectedProPackDataIndex;

                // Get the manufacturer entry in the Pro Packs array.
                for (var i = 0; i < proPacksArray.length; i++) {
                    var entry = proPacksArray[i];
                    if (entry.Manufacturer === manufacturer) {
                        selectedProPackData = entry;
                        selectedProPackDataIndex = i;
                        break;
                    }
                }

                // Create the manufacturer entry if it's nonexistent.
                if (selectedProPackData == null) {
                    selectedProPackData = {"Manufacturer": manufacturer, "Classes": {"C": 0, "B": 0, "A": 0, "S": 0} };
                    selectedProPackDataIndex = proPacksArray.push(selectedProPackData) - 1;
                }

                // Credit the pro pack!
                switch (carClass) {
                    case "C":
                        selectedProPackData.Classes.C += selectedPrize.BlueprintOrProPackCount;
                        break;
                    case "B":
                        selectedProPackData.Classes.B += selectedPrize.BlueprintOrProPackCount;
                        break;
                    case "A":
                        selectedProPackData.Classes.A += selectedPrize.BlueprintOrProPackCount;
                        break;
                    case "S":
                        selectedProPackData.Classes.S += selectedPrize.BlueprintOrProPackCount;
                        break;
                }
                proPacksArray[selectedProPackDataIndex] = selectedProPackData;

                successfullyWritten = versionedProPacks.SetData(proPacksArray);
            }

            // We'll need to set PrizeValue to the class, PrizeValue2 to the manufacturer and PrizeValue3 to the
            // number of packs awarded.
            prize.PrizeValue = carClass;
            prize.PrizeValue2 = manufacturer;
            prize.PrizeValue3 = selectedPrize.BlueprintOrProPackCount.toString();
            break;
        // case "Car": // Can't win cars from the current Gacha design.
        //     // Credit the car to the profile.
        //     AddNewCarToInventory(selectedPrize.PrizeValue, player.getPlayerId(), 100);
        //     // For convenience, set PrizeValue2 to the full name of the car.
        //     var car = GetCarInventoryEntry(selectedPrize.PrizeValue);
        //     selectedPrize.PrizeValue2 = (car.Manufacturer + " " + car.LongName);
        //     break;
        case "BlueprintPiece":
            // We need to roll a random winnable variant of the given class, but Car class is no longer included
            // in docs in the CarInventory collection; it's stored per model. So now this gets complicated...
            // First, we need an array of winnable models. Take them from the Car Inventory.
            var winnableModels = GetCarInventoryCollection(playerId).aggregate({$match: {"CanBeEarnedViaBlueprint": true}}, {$group: {_id: null, "Models": {$addToSet: "$Model"}}})[0].Models; // I don't know why it's an array...

            // Next, we filter the CarModels collection by the winnable models array and the given class to get
            // an array of winnable models of that class.
            var filteredWinnableModels = GetCarModelsCollection(playerId).aggregate({$match: {"Model": {"$in": winnableModels}, "ClientData.Class": selectedPrize.BlueprintOrProPackClass}}, {$group: {_id: null, "Models": {$addToSet: "$Model"}}})[0].Models; // Again, mystery one-value array...

            // Now, by filtering the car inventory by the filtered winnable models array, we can get all winnable
            // variants of the given class.
            var winnableVariants = GetCarInventoryCollection(playerId).find({"Model": {"$in": filteredWinnableModels}, "CanBeEarnedViaBlueprint": true});

            // And now excuse me while I puke.

            // Error checkin'!
            if (winnableVariants == null) {
                ErrorMessage("ARG; got null when searching the CarInventory meta collection!");
                return;
            }
            if (winnableVariants.count() == 0) {
                ErrorMessage(FormatString("ARG; there are no winnable Class {0} Variants!", selectedPrize.BlueprintOrProPackClass));
                return;
            }

            // Now, pick one! Skip a random number of elements.
            var roll = Math.floor(Math.random() * winnableVariants.count());
            var selectedVariant = winnableVariants.skip(roll).next();

            // More error checkin'!
            if (selectedVariant === null) {
                ErrorMessage("ARG; the selected Variant was null!");
                return;
            }
            if (selectedVariant.BlueprintPiecesRequired <= 0) {
                ErrorMessage(FormatString("ARG; the Variant {0} requires an invalid number of Blueprint pieces to win it ({1})!",
                    selectedVariant.CarVariantID, selectedVariant.BlueprintPiecesRequired));
                return;
            }

            var versionedBlueprints = GetVersionedBlueprints(playerId);

            var carVariantToAward;
            var successfullyWritten = false;
            while (!successfullyWritten) {
                carVariantToAward = null;
                var blueprints = versionedBlueprints.GetData();

                // Check to see if the Variant is already in the blueprint list.
                var selectedBlueprintEntry = null;
                for (var i = 0; i < blueprints.length; i++) {
                    var currentBlueprint = blueprints[i];
                    if (currentBlueprint.CarVariant !== null) {
                        // If the Variant ID of the car matches the prize Variant ID, increment the piece count.
                        if (currentBlueprint.CarVariant.CarVariantID === selectedVariant.CarVariantID) {
                            currentBlueprint.Pieces += selectedPrize.BlueprintOrProPackCount;
                            selectedBlueprintEntry = currentBlueprint;
                            break;
                        }
                    }
                }

                // If it isn't in the blueprint list, add a new entry for this Variant.
                if (selectedBlueprintEntry == null) {
                    selectedBlueprintEntry = {
                        "CarVariant": selectedVariant,
                        "Pieces": selectedPrize.BlueprintOrProPackCount,
                        "PiecesRequired": selectedVariant.BlueprintPiecesRequired,
                        "TimesWon": 0 };
                    blueprints.push(selectedBlueprintEntry);
                }

                // Fucking NaNs
                if (isNaN(selectedBlueprintEntry.TimesWon))
                    selectedBlueprintEntry.TimesWon = 0;

                var wonCarThisPrize = false;
                // Check if earning this piece completes the blueprint.
                if (selectedBlueprintEntry.Pieces >= selectedBlueprintEntry.PiecesRequired) {
                    // Spark.getLog().debug(FormatString("{0} finished a Blueprint for a {1} {2}!", player.getDisplayName(),
                    //     blueprintEntry.CarVariant.Manufacturer, blueprintEntry.CarVariant.LongName));

                    // Reset the blueprint piece count.
                    selectedBlueprintEntry.Pieces -= selectedBlueprintEntry.PiecesRequired;
                    selectedBlueprintEntry.TimesWon++;

                    carVariantToAward = selectedBlueprintEntry.CarVariant.CarVariantID;
                    wonCarThisPrize = true;
                }

                // We'll need to set PrizeValue to the variant ID, PrizeValue2 to the manufacturer, PrizeValue3 to
                // the car name, PrizeValue4 to the variant name and PrizeValue5 to the number of pieces awarded.
                // As the model name and manufacturer isn't stored in the CarInventory anymore, we need to get that
                // from the CarModels collection.
                var carModelData = GetCarModelsCollection(playerId).findOne({"Model": selectedVariant.Model});

                prize.PrizeValue = selectedVariant.CarVariantID;
                prize.PrizeValue2 = carModelData.ClientData.ManufacturerName;
                prize.PrizeValue3 = carModelData.ClientData.LongName;
                prize.PrizeValue4 = selectedVariant.VariantName;
                prize.PrizeValue5 = selectedPrize.BlueprintOrProPackCount.toString();
                prize.PrizeValue6 = wonCarThisPrize;

                successfullyWritten = versionedBlueprints.SetData(blueprints);
            }

            if (carVariantToAward !== null && carVariantToAward !== undefined) {
                // Credit the car to the profile.
                var carAwarded = AddNewCarToInventory(carVariantToAward, playerId, 100, true);
                if (carAwarded === null || carAwarded === undefined) {
                    Spark.getLog().error(FormatString("ARGH! Player {0} won the final blueprint piece for their {1}, but I failed to add the car to their inventory!", playerId, carVariantToAward));
                }
            }
            break;
        // case "GarageSlot": // Can't win garage slots from the current Gacha design.
        //     AdjustPlayerCarSlots(player.getPlayerId(), 1);
        //     break;
        // case "FreeBet": // Can't win free bets from the current Gacha design.
        //     var betAmount = parseInt(selectedPrize.PrizeValue);
        //     var quantity = parseInt(selectedPrize.PrizeValue2);
        //     var expiryInMs = selectedPrize.PrizeExpiry * 60000;
        //     var expiryTimestamp = GetNow() + expiryInMs;

        //     AddFreeBet(player.getPlayerId(), betAmount, quantity, expiryTimestamp);
        //     break;
    }

    // Spark.getLog().debug(FormatString("Player {0} won {1} ({2}) from the {3} Bank Box! (Value2: {4}, Value3: {5})",
    //     player.getDisplayName(), prize.PrizeValue, prize.PrizeType, type, prize.PrizeValue2, prize.PrizeValue3));

    // Now we can safely take the key.
    GiveBankBoxKeys(player, type, -1);
    return prize;
}

// Module: GachaPrizeUtilities.
// Gives the player a number of Bank Box keys of the specified type.
function GiveBankBoxKeys(player, type, qty){
    var playerId = player.getPlayerId();

    var versionedBankBoxKeys = GetVersionedBankBoxKeys(playerId);

    var successfullyWritten = false;
    while(!successfullyWritten) {
        var bankBoxKeys = versionedBankBoxKeys.GetData();

        switch (type)
        {
            case "Bronze":
                bankBoxKeys.bronze = Math.max(bankBoxKeys.bronze + qty, 0);
                // Spark.getLog().debug("Bronze: " + bankBoxKeys.bronze)
                break;
            case "Silver":
                bankBoxKeys.silver = Math.max(bankBoxKeys.silver + qty, 0);
                // Spark.getLog().debug("Silver: " + bankBoxKeys.silver)
                break;
            case "Gold":
                bankBoxKeys.gold = Math.max(bankBoxKeys.gold + qty, 0);
                // Spark.getLog().debug("Gold: " + bankBoxKeys.gold)
                break;
        }

        successfullyWritten = versionedBankBoxKeys.SetData(bankBoxKeys);
    }

    AddBankBoxKeysToResponse(playerId);
}

// Module: GachaPrizeUtilities
// Checks to see if the player is eligible for an Hourly Bonus. If they are,
// the appropriate number of keys are added to the player's profile and the
// Hourly Bonus timestamp is updated.
function CheckForHourlyBonus(player) {
    var playerId = player.getPlayerId();
    if (!GetPlayerFTUEFlag("EventFeedExplained_2", playerId)) {
        // PSIX-3581
        // Don't do hourly bonus checks until we've completed the FTUE
        return;
    }
    
    if (GetTimeUntilNextHourlyBonus(playerId) <= 0)
    {
        GiveBankBoxKeys(player, "Bronze", 1);
        SetNewHourlyBonusTimestamp(playerId, GetNow());
    }

    function GetLastHourlyBonusTimestamp(playerId) {
        var versionedProfile = GetVersionedLastHourlyBonusTimestamp(playerId);

        var data = versionedProfile.GetData();

        return data;
    }

    function GetTimeUntilNextHourlyBonus(playerId) {
        var ts = GetLastHourlyBonusTimestamp(playerId);

        var now = GetNow();
        var interval = 60 * 60 * 1000; // 1 hour in milliseconds
        var timeLeft = (interval - (now - ts));
        if (timeLeft < 0){
            timeLeft = 0;
        }
        return timeLeft;
    }
}

function GetVersionedLastHourlyBonusTimestamp(playerId) {
    return MakeVersionedProfile(playerId, "lastHourlyBonusTs", 0);
}

// Module: GachaPrizeUtilities
function SetNewHourlyBonusTimestamp(playerId, time) {
    var versionedProfile = GetVersionedLastHourlyBonusTimestamp(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        versionedProfile.GetData();
        successfullyWritten = versionedProfile.SetData(time);
    }
}

// Module: GachaPrizeUtilities
// Returns a random manufacturer that has cars of the specified class. Use this when
// a Pro Pack is rolled in the Gacha.
function RollManufacturer(carClass, playerId){
    // Grab all the manufacturers that make cars of this class. The aggregate function
    // returns an array.
    var aggregateQueryArray = GetCarModelsCollection(playerId).aggregate(
        { $match: { "ClientData.Class": carClass } },
        { $group: { _id: { "manufacturer" : "$ClientData.Manufacturer", "model" : "$Model" }}});

    // Now we need to check if any of the manufacturers have active cars in the Car Inventory
    for (var i = aggregateQueryArray.length - 1; i >= 0; --i) {
        var model = aggregateQueryArray[i]._id.model;
        var count = GetCarInventoryCollection(playerId).count({"Model": model, "InCarPool": true});
        if (count === 0) {
            aggregateQueryArray.splice(i, 1);
        }
    }

    if (aggregateQueryArray.length == 0)
    {
        // There aren't any cars of this class?!
        return null;
    }

    // Pick an element, any element!
    var roll = Math.floor(aggregateQueryArray.length * Math.random());
    return aggregateQueryArray[roll]._id.manufacturer; // The ID is the manufacturer. ;)
}