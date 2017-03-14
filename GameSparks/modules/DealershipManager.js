requireOnce("CarInventoryUtilities");
requireOnce("DealershipUtilities");
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("TimeUtilities");
requireOnce("CollectionUtilities");
requireOnce("VersionedDocumentUtilities2");
/**
 * A class for managing the slots in a player's dealership
 * @constructor
 * @param {DealershipSlotProbabilityManager} slotProbabilityManager The manager object that loads and checks the probability of generating
 * different expiry times and times to refresh
 * @param {DealershipPlayerLevelProbabilityManager} playerLevelProbabilityManager The manager object that loads and checks the probability of seeing
 * different variants at different player levels
 * @param {SparkMongoCollectionReadOnly} carInventoryCollection An object for interacting with a MongoDB collection containing scheduled matches.
 * This should implement the same API as collections returned by the node-mongodb-native project (https://github.com/mongodb/node-mongodb-native)
 * @param {HutchGSMongoCollectionWrapper} playerDealershipCollection An object for interacting with a MongoDB collection containing scheduled matches.
 * This should implement the same API as collections returned by the node-mongodb-native project (https://github.com/mongodb/node-mongodb-native)
 * @param {function():string} rarityGeneratorFn A function which when called, will generate a random rarity
 */
DealershipManager = function (
    slotProbabilityManager,
    playerLevelProbabilityManager,
    carInventoryCollection,
    carModelsGSCollection,
    dealershipCalendarGSCollection,
    playerDealershipCollection,
    rarityGeneratorFn) {

    //**************** Private properties ****************//

    var that = this;

    //**************** Public functions ****************//

    /**
     * Clears a player's dealership. This is expected to be used as a debug option
     * @param {string} playerId The unique identifier of the player
     */
    this.clearDealership = function(playerId) {
        playerDealershipCollection.remove({ "_id" : playerId });
    };

    /**
     * Callback invoked when the manager generated a new player dealership for a player going
     * through the First Time User Experience flow
     * @callback DealershipManager~onFTUEGenerated
     * @param {object[]} slots The slots generated in the new dealership
     */

    /**
     * Generates a new PlayerDealership record for a new player going through the
     * First Time User Experience flow
     * @param {string} playerId The unique identifier of the player
     * @param {onFTUEGenerated} callback The callback invoked after the dealership has been generated
     */
    this.generateFTUE = function (playerId, callback) {
        this.clearDealership(playerId);

        var numSlots = GetNumDealershipFTUESlots();

        var slots = [];

        /**
         * Callback invoked when all the starter variant slots have been generated
         * @param {object[]} newSlotResults The array of new slots written to the database
         */
        var starterVariantsCallback = function (newSlotResults) {
            callback(newSlotResults);
        };

        generateNewStarterSlots(numSlots, starterVariantsCallback);
    };

    /**
     * Callback invoked when the manager has loaded a specific car in the player's dealership
     * @callback DealershipManager~onCarLoaded
     * @param {object} car The car in the player's dealership
     */

    /**
     * Gets a car in a specific slot index currently in the player's dealership
     * @param {string} playerId The unique identifier of the player
     * @param {number} slotIndex The slot index to get the car from
     * @param {onCarLoaded} callback The callback invoked when the cars have been loaded
     */
     this.getCarForPlayer = function(playerId, slotIndex, callback) {

        this.getSlotForPlayer(playerId, slotIndex, function(slots) {
            if (slots === null) {
                callback(null);
            }
            else {
        	    var car = that.getCarFromSlot(slots.Slots[0]);
                callback(car);
            }
        });
    };

    /**
     * Gets an object mapping to the client's CarInventoryItem class from a slot
     * @param {object} slot The slot in the dealership
     * @return {object} An object mapping to the client's CarInventoryItem class
     */
    this.prepareCarSlot = function(slot) {
        if (slot.Car.DealerSettings === undefined) {
            slot.Car.DealerSettings = {}
        }
        slot.Car.DealerSettings.CarDealerExpiryTime = slot.ExpiryDateTime;
        slot.Car.DealerSettings.DealerTimeToRefresh = slot.TimeToRefresh;
        slot.Car.DealerSettings.DealerPurchaseTime = slot.PurchasedDateTime;
        slot.Car.DealerSettings.HasDealerExpiryTime = slot.HasDealerExpiryTime === undefined ? true : slot.HasDealerExpiryTime;
        slot.Car.ServerSlotIndex = slot.SlotIndex;

        if (((slot.Car.ModelData == null) || (slot.Car.ModelData == undefined))
            || ((slot.Car.ModelData.ManufacturerName == null) || (slot.Car.ModelData.ManufacturerName == undefined))
            || ((slot.Car.ModelData.Class == null) || (slot.Car.ModelData.Class == undefined))) {
            slot.Car.ModelData = carModelsGSCollection.findOne({"Model":{"$eq":slot.Car.Model}}).ClientData;
        }

        return slot;
    };

    this.getCarFromSlot = function(slot) {
        that.prepareCarSlot(slot);
        return slot.Car;
    }

    /**
     * Callback invoked when the manager has loaded the cars currently in the player's dealership
     * @callback DealershipManager~onCarsLoaded
     * @param {object[]} cars The cars in the player's dealership
     * @param {number} numNewCars The number of new cars just put into the dealership
     */

    /**
     * Gets the cars currently in the player's dealership
     * Dynamically resizes the dealership if the global number of slots has changed
     * @param {string} playerId The unique identifier of the player
     * @param {number} playerLevel The player's XPLevel
     * @param {onCarsLoaded} callback The callback invoked when the cars have been loaded
     */
    this.getCarsForPlayer = function(playerId, playerLevel, callback) {
        var numSlots = GetNumDealershipSlots();

        if (!GetPlayerFTUEFlag("ChosenCar", playerId)) {
            numSlots = GetNumDealershipFTUESlots();
        }

        // get the per-class must haves list
        var versionedProfile = MakeVersionedProfileDocument(playerId);
        var versionedMaxOwnedCarClass = GetVersionedMaxOwnedCarClassFromProfile(versionedProfile);
        var playerBestCarClass = versionedMaxOwnedCarClass.GetData();
        var mustHaves = that.perClassMustHaves[playerBestCarClass];

        var numNewCars = 0;

        getSlotsForPlayer(playerId, function(slots) {
            var cars = [];
            if (slots === null) {
                // LogMessage("Code path 1");

                var forcedCalendarModels = getForcedCalendarModelsForPlayer(playerId);

                // always allow the must haves space, truncate the calendar if required
                var maxCalendarEntries = Math.min(forcedCalendarModels.length, numSlots - mustHaves.length);

                for (var i = 0; i < numSlots; ++i) {
                    var onGenerateNewSlot = function(newSlotResult, slotIndex) {
                        if (newSlotResult === null) {
                            throw new Error("Failed to generate slot " + slotIndex.toString() + " for playerId " + playerId);
                        }
                        else {
                            numNewCars++;
                            cars.push(that.prepareCarSlot(newSlotResult));
                        }
                    }

                    // put the calendar entries in first
                    if (i < maxCalendarEntries) {
                        var forcedModel = forcedCalendarModels[i];
                        generateNewSlot(playerId, cars, i + 1, playerLevel, 0, onGenerateNewSlot, null, null, forcedModel);
                    }
                    else if (i < maxCalendarEntries + mustHaves.length) {
                        var mustHave = mustHaves[i - maxCalendarEntries];
                        generateNewSlot(playerId, cars, i + 1, playerLevel, 0, onGenerateNewSlot, "Class" + mustHave.Class, mustHave.Rarity);
                    }
                    else {
                        generateNewSlot(playerId, cars, i + 1, playerLevel, 0, onGenerateNewSlot);
                    }
                }
            }
            else {
                // Fill up slots at the end. This should only happen if the number of slots in the dealer is increased.
                if (slots.Slots.length < numSlots) {
                    Warn("Having to increase slots from {0} to {1}. Only ok if the number of slots has increased",
                        slots.Slots.length, numSlots);

                    for (var i = slots.Slots.length; i < numSlots; i++) {
                        //Log("Generating new slot for: {0}", i + 1);
                        generateNewSlot(playerId, cars, i + 1, playerLevel, 0, function(newSlotResult, slotIndex) {
                            if (newSlotResult === null) {
                                throw new Error("Failed to generate slot " + i.toString() + " for playerId " + playerId);
                            }
                            else {
                                //Log("Created new car with slotIndex: {0}", slotIndex);
                                numNewCars++;
                                cars.push(that.prepareCarSlot(newSlotResult));
                            }
                        });
                    }
                }

                var carsToRefreshSlotIndexes = [];
                var now = Math.floor(GetNow() / 1000);
                for (var i = 0; i < slots.Slots.length; i++) {
                    var slot = slots.Slots[i];
                    var car = that.getCarFromSlot(slot);
                    if (i < numSlots) {
                        if (car.DealerSettings !== null && car.DealerSettings !== undefined) {
                            if ((car.DealerSettings.HasDealerExpiryTime && now < car.DealerSettings.CarDealerExpiryTime) ||
                                !car.DealerSettings.HasDealerExpiryTime) {
                                //Log("Keeping car: {0}:{1} has: {2}, exp: {3}, now: {4}", slot.SlotIndex, car.CarVariantID, car.DealerSettings.HasDealerExpiryTime, car.DealerSettings.CarDealerExpiryTime, now);
                                cars.push(that.prepareCarSlot(slots.Slots[i]));
                            }
                            else {
                                carsToRefreshSlotIndexes.push(slot.SlotIndex);
                                //Log("Ditching car: {0}:{1} has: {2}, exp: {3}, now: {4}", slot.SlotIndex, car.CarVariantID, car.DealerSettings.HasDealerExpiryTime, car.DealerSettings.CarDealerExpiryTime, now);
                            }
                        }
                        else {
                            Spark.getLog().error(FormatString(
                                "Slot in dealer: {0}, car: {1} does not have DealerSettings",
                                slot.SlotIndex, car.CarVariantID));
                        }
                    }
                }

                // Refresh the slots we need to refresh
                for (var i = 0; i < carsToRefreshSlotIndexes.length; i++) {
                    var slotIndex = carsToRefreshSlotIndexes[i];

                    var numAttemptsAllowed = 3;
                    that.refreshSlotInternal(playerId, slotIndex, playerLevel, mustHaves, numAttemptsAllowed, cars, function(slotRefreshResult) {
                        if (slotRefreshResult !== null) {

                            var slot = that.prepareCarSlot(slotRefreshResult);
                            var car = that.getCarFromSlot(slot);

                            //Log("Refreshed car: {0}:{1} has: {2}, exp: {3}, now: {4}", slot.SlotIndex, car.CarVariantID, car.DealerSettings.HasDealerExpiryTime, car.DealerSettings.CarDealerExpiryTime, now);

                            numNewCars++;
                            cars.push(slot);
                        }
                        else {
                            Warn("Could not refresh car: {0}, now: {1}", slotIndex, now);
                        }
                    });
                }
            }

            callback(cars, numNewCars);
        });
    };

    /**
     * Callback invoked when the manager has loaded a slot in the player's dealership
     * @callback DealershipManager~onSlotLoaded
     * @param {object} slot The slot from the player's dealership
     */

    /**
     * Gets a slot in the player's dealership
     * @param {string} playerId The unique identifier of the player
     * @param {number} slotIndex The index of the slot to get
     * @param {onSlotLoaded} callback The callback invoked when the slot is loaded
     */
    this.getSlotForPlayer = function(playerId, slotIndex, callback) {
        playerDealershipCollection.findOne(
            {
                "_id" : playerId,
                "Slots.SlotIndex" : slotIndex
            },
            {
                "fields" :
                {
                    "Slots.$" : 1
                }
            },
            function (error, result) {
                if (error !== null) {
                    callback(null);
                }

                callback(result);
            });
    };

    /**
     * Callback invoked when the manager has marked a slot as purchased
     * @callback DealershipManager~onSlotMarkedPurchased
     * @param {bool} result True if the slot was successfully marked as purchased, false if the slot cannot be purchased
     */

    /**
     * Marks a slot as purchased. The slot will still not be refreshed until a further amount of time has expired
     * (the TimeToRefresh setting), but the client can show the slot as finished.
     * @param {string} playerId The unqiue identifier of the player purchasing the car in the slot
     * @param {number} slotIndex The index of the slot containing the car being purchased
     * @param {onSlotMarkedPurchased} callback The callback invoked when the slot has been marked as purchased
     */
    this.markSlotAsPurchased = function(playerId, slotIndex, callback) {
        var now = Math.floor(GetNow() / 1000);
        playerDealershipCollection.updateOne(
            {
                "_id" : playerId,
                "Slots.SlotIndex" : slotIndex,
                "Slots.PurchasedDateTime" : 0
            },
            {
                "$set" :
                {
                    "Slots.$.PurchasedDateTime" : now
                }
            },
            {
                "upsert" : true
            },
            function (error, result) {
                if (error !== null) {
                    callback(false);
                }

                if (result.result.ok === 1) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            });
    };

    this.perClassMustHaves = {
        "C" : [
            {
                "Class" : "B",
                "Rarity" : "Common",
            },
            {
                "Class" : "B",
                "Rarity" : "Uncommon",
            },
            {
                "Class" : "B",
                "Rarity" : "Rare",
            },
            {
                "Class" : "C",
                "Rarity" : "Common",
            },
            {
                "Class" : "A",
                "Rarity" : "Common",
            },
            {
                "Class" : "S",
                "Rarity" : "Common",
            },
            {
                "Class" : "A",
                "Rarity" : "Rare",
            },
            {
                "Class" : "S",
                "Rarity" : "Rare",
            }
        ],
        "B" : [
            {
                "Class" : "A",
                "Rarity" : "Common"
            },
            {
                "Class" : "A",
                "Rarity" : "Uncommon"
            },
            {
                "Class" : "A",
                "Rarity" : "Rare"
            },
            {
                "Class" : "C",
                "Rarity" : "Common"
            },
            {
                "Class" : "B",
                "Rarity" : "Common"
            },
            {
                "Class" : "A",
                "Rarity" : "Common"
            },
            {
                "Class" : "S",
                "Rarity" : "Common"
            },
            {
                "Class" : "S",
                "Rarity" : "Rare"
            }
        ],
        "A" : [
            {
                "Class" : "S",
                "Rarity" : "Common"
            },
            {
                "Class" : "S",
                "Rarity" : "Uncommon"
            },
            {
                "Class" : "S",
                "Rarity" : "Rare"
            },
            {
                "Class" : "C",
                "Rarity" : "Common"
            },
            {
                "Class" : "B",
                "Rarity" : "Common"
            },
            {
                "Class" : "A",
                "Rarity" : "Common"
            },
            {
                "Class" : "S",
                "Rarity" : "Common"
            },
            {
                "Class" : "A",
                "Rarity" : "Rare"
            }
        ],
        "S" : [
            {
                "Class" : "C",
                "Rarity" : "Rare"
            },
            {
                "Class" : "B",
                "Rarity" : "Rare"
            },
            {
                "Class" : "A",
                "Rarity" : "Rare"
            },
            {
                "Class" : "S",
                "Rarity" : "Rare"
            },
            {
                "Class" : "C",
                "Rarity" : "Common",
            },
            {
                "Class" : "B",
                "Rarity" : "Common"
            },
            {
                "Class" : "A",
                "Rarity" : "Common"
            },
            {
                "Class" : "S",
                "Rarity" : "Common"
            }
        ]
    }

    /**
     * Should we override a car slot because of the 'must have' list?
     * @param {object[]} slots The current slot contents
     * @param {number} slotIndexToIgnore Ignore the contents of this slot when deciding to override
     * @param {object[]} mustHaves The list of cars we will be forcing (elsewhere)
     */
    this.shouldOverrideCar = function(slots, slotIndexToIgnore, mustHaves) {
        if (slots.length === null || slots.length === undefined) {
            ErrorMessage(FormatString("slots has no length?! eh!?"));
            return null;
        }

        for (var i = 0; i < mustHaves.length; ++i) {
            var mustHave = mustHaves[i];
            if (!doSlotsContainClassRarity(slots, slotIndexToIgnore, mustHave.Class, mustHave.Rarity)) {
                return mustHave;
            }
        }

        return null;
    }

    /**
     * Callback invoked when the manager has refreshed a slot in the player's dealership
     * @callback DealershipManager~onSlotRefreshed
     * @param {object} slot The newly refreshed slot
     */

    /**
     * Refreshes a slot in a player's dealership
     * @param {string} playerId The unique identifier of the player to generate the slot for
     * @param {number} slotIndex The index of the slot to generate in the player's dealership
     * @param {number} playerLevel The player's level
     * @param {onSlotRefreshed} callback The callback invoked when the slot has been refreshed
     */
    this.refreshSlot = function (playerId, slotIndex, playerLevel, callback) {

        // get the per-class must haves list
        var versionedProfile = MakeVersionedProfileDocument(playerId);
        var versionedMaxOwnedCarClass = GetVersionedMaxOwnedCarClassFromProfile(versionedProfile);
        var playerBestCarClass = versionedMaxOwnedCarClass.GetData();
        var mustHaves = that.perClassMustHaves[playerBestCarClass];

        var slots = null;

        getSlotsForPlayer(playerId, function(slots_) { slots = slots_; });

        if (slots !== null && slots !== undefined) {
            slots = slots.Slots;
        }

        var numAttemptsAllowed = 5;

        that.refreshSlotInternal(playerId, slotIndex, playerLevel, mustHaves, numAttemptsAllowed, slots, callback);
    }

    this.refreshSlotInternal = function (playerId, slotIndex, playerLevel, mustHaves, numAttemptsAllowed, slots, callback) {
        if (numAttemptsAllowed <= 0) {
            // oh dear, we have failed
            callback(null);
        }

        var numSlots = GetNumDealershipSlots();

        if (slotIndex > numSlots) {
            deleteSlot(playerId, slotIndex, function(success) {
                if (success) {
                    callback(null);
                }
                else {
                    throw new Error("Failed to delete extra slot at index " + slotIndex.toString());
                }
            });
        }
        else {
            // Gets a random slot probabilty record - this will be used to determine the expiry time and time to refresh for the slot
            slotProbabilityManager.getTimes(function (slotRecord) {

                // Get the row in the probability table that corresponds to the player's level.
                // This dictates how likely they are to see each class of variant
                playerLevelProbabilityManager.getLevel(playerLevel, function(result) {
                    var variantClass = result.getRandomClass();
                    var dealershipCache = GetDealershipCacheCollection(playerId);

                    // Lookup the Class.RarityRange key to see how many of each type of rarity we have in each class
                    var rarity = rarityGeneratorFn();

                    var forcedModel = shouldForceCalendarModel(playerId, slots, slotIndex, mustHaves);

                    var carRes = null;

                    if (forcedModel !== null && forcedModel !== undefined) {
                        carRes = getRandomCommonModelVariant(forcedModel);
                    }

                    if (carRes === null || carRes === undefined) {
                        var forcedSetup = that.shouldOverrideCar(slots, slotIndex, mustHaves);

                        if (forcedSetup !== null && forcedSetup !== undefined) {
                            variantClass = "Class" + forcedSetup.Class;
                            rarity = forcedSetup.Rarity;
                            // Log("Forcing replace override to: {0}:{1}", variantClass, rarity);
                        }

                        var variantRange = variantClass + "." + rarity + "Range";
                        var entry = dealershipCache.findOne({"Key":variantRange});
                        if (entry === null || entry === undefined ||
                            entry.Value === null || entry.Value === undefined) {
                            // We don't have a range of valid cars for the chosen Class & Rarity combination
                            // Retry so we hopefully generate a valid combination
                            that.refreshSlotInternal(playerId, slotIndex, playerLevel, mustHaves, numAttemptsAllowed - 1, slots, callback);
                            return;
                        }
                        else {
                            var variantRangeRes = entry.Value;
                            // Lookup a random variant in this range to get the ObjectId to lookup in the CarInventory meta collection
                            var variantIndex = variantClass + "." + rarity + "." + Math.floor((Math.random() * variantRangeRes) + 1);
                            entry = dealershipCache.findOne({"Key":variantIndex});
                            if (entry === null || entry === undefined ||
                                entry.Value === null || entry.Value === undefined) {
                                // Retry
                                that.refreshSlotInternal(playerId, slotIndex, playerLevel, mustHaves, numAttemptsAllowed - 1, slots, callback);
                                return;
                            }
                            else {
                                var variantIndexRes = entry.Value;
                                var carRes = carInventoryCollection.findOne({
                                    "_id" : { "$oid" : variantIndexRes }
                                });
                            }
                        }
                    }

                    // are we a duplicate, if so recurse ...
                    if (doSlotsContainVariant(slots, slotIndex, carRes.CarVariantID)) {
                        // Log("refreshSlotInternal() got a duplicate on numAttemptsAllowed: {0} of [{1}]",
                        //     numAttemptsAllowed, carRes.CarVariantID);
                        // Retry
                        that.refreshSlotInternal(playerId, slotIndex, playerLevel, mustHaves, numAttemptsAllowed - 1, slots, callback);
                        return;
                    }

                    var now = Math.floor(GetNow() / 1000);

                    carRes.ModelData = carModelsGSCollection.findOne({"Model":{"$eq":carRes.Model}}).ClientData;

                    var updatedSlot = {
                        "SlotIndex" : slotIndex,
                        "Car" : carRes,
                        "ExpiryDateTime" : now + slotRecord.getRandomExpiry(),
                        "PurchasedDateTime" : 0,
                        "TimeToRefresh" : slotRecord.getRandomTimeToRefresh()
                    };

                    if (!carRes.InCarPool) {
                        // Yikes this car isn't available, how could we be returning it?!
                        Spark.getLog().error(FormatString(
                            "#2 Dealership is trying to return a car [{0}] which isn't enabled!",
                            carRes.CarVariantID));

                        callback(null);
                        return;
                    }

                    playerDealershipCollection.updateOne({
                        "_id" : playerId,
                        "Slots.SlotIndex" : slotIndex
                    },
                    {
                        "$set" :
                        {
                            "Slots.$" : updatedSlot
                        }
                    },
                    {
                        "upsert" : true
                    },
                    function (dsUpdateErr, dsUpdateRes) {
                        if (dsUpdateErr !== null) {
                            callback(null);
                        }

                        if (dsUpdateRes.result.ok === 1) {
                            callback(updatedSlot);
                        }
                        else {
                            callback(null);
                        }
                    });
                });
            });
        }
    };

    //**************** Private functions ****************//

    var deleteSlot = function(playerId, slotIndex, callback) {
        playerDealershipCollection.updateOne(
            {
                "_id" : playerId
            },
            {
                "$pull" :
                {
                    "Slots" :
                    {
                        "SlotIndex" : slotIndex
                    }
                }
            },
            {
                "upsert" : true
            },
            function (error, result) {
                if (error !== null || result === null) {
                    callback(false);
                }

                if (result.result.ok === 1) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            });
    };

    var getModelsInCarResults = function(inputCarResults) {
        var carsPerModel = {};
        var uniqueModels = [];
        for(var i = 0; i < inputCarResults.length; ++i) {
            var car = inputCarResults[i];
            var model = car.Model;
            if(!carsPerModel.hasOwnProperty(model)) {
                uniqueModels.push(model);
                carsPerModel[model] = [car];
            }
            else {
                carsPerModel[model].push(car);
            }
        }
        return { "uniqueModels" : uniqueModels, "carsPerModel" : carsPerModel };
    }

    var addCarToStarterSlotsAndUsedList = function (slots, usedVariantNames, car) {
        // slightly randomise the expiry time to get a random display order in the client
        // the numbers are massive so the starter cars never expire, well not while a living
        // person is watching :)
        var limitExpiryDateTime = 2147483647;
        var expiryDataTimeRange = 30;
        var minExpiryDataTime = limitExpiryDateTime - expiryDataTimeRange;

        var randomExpiryDateTime = Math.floor((Math.random() * expiryDataTimeRange)) + minExpiryDataTime;

        car.ModelData = carModelsGSCollection.findOne({"Model":{"$eq":car.Model}}).ClientData;
        var newSlot = {
            "SlotIndex" : slots.length + 1,
            "Car" : car,
            "ExpiryDateTime" : randomExpiryDateTime,
            "PurchasedDateTime" : 0,
            "TimeToRefresh" : 0,
            "HasDealerExpiryTime" : false
        };

        slots.push(newSlot);
        usedVariantNames[car.CarVariantID] = true;
    }

    var generateNewStarterSlots = function (numSlotsRequired, callback) {
        var carResultsCursor = carInventoryCollection.find({
            "IsAStarterCar": true,
            "InCarPool": true
        }).sort({ Model : 1 });

        var carResults = carResultsCursor.toArray();

        var modelInfo = getModelsInCarResults(carResults);

        // evenly distribute results between models
        var numResultsPerModel = Math.floor(numSlotsRequired / modelInfo.uniqueModels.length);

        // LogMessage(FormatString("numResultsPerModel: {0}, carResults.length: {1}, modelInfo.uniqueModels.length: {2}",
        //     numResultsPerModel, carResults.length, modelInfo.uniqueModels.length));

        var slots = [];
        var usedVariantNames = {};
        for (var i = 0; i < modelInfo.uniqueModels.length; ++i) {
            var uniqueModel = modelInfo.uniqueModels[i];
            var carsForModel = modelInfo.carsPerModel[uniqueModel];
            if (carsForModel.length <= numResultsPerModel) {
                // we don't have enough variants for this model - just take one of each
                for (var j = 0; j < carsForModel.length; ++j) {
                    var car = carsForModel[j];
                    // LogMessage("#1");
                    addCarToStarterSlotsAndUsedList(slots, usedVariantNames, car);
                }
            }
            else {
                // randomly take variants, until we have enough
                for (var j = 0; j < numResultsPerModel; ++j) {
                    var randomModelIndex = Math.floor((Math.random() * carsForModel.length));
                    var car = carsForModel[randomModelIndex];
                    // LogMessage("#2");
                    addCarToStarterSlotsAndUsedList(slots, usedVariantNames, car);

                    // to ensure unique variants remove the one we just used from the list
                    carsForModel.splice(randomModelIndex, 1);
                }
            }
        }

        // now we should have a mostly filled list of starter slots
        // it won't be full because either
        // 1) there weren't enough variants for some models
        // 2) the number of models didn't divide exactly into the number of slots
        // so randomly fill the rest!

        // we can only ensure uniqueness if there are enough bloody cars!
        var ensureUnique = numSlotsRequired <= carResults.length;

        while (slots.length < numSlotsRequired) {
            if (carResults.length <= 0) {
                // error, should not happen
                Spark.getLog().error(FormatString("Eek - we've run out of cars (variants) !?"));
                break;
            }

            var randomCarIndex = Math.floor((Math.random() * carResults.length));

            var car = carResults[randomCarIndex];

            if (ensureUnique) {
                if (usedVariantNames.hasOwnProperty(car.CarVariantID)) {
                    // oh, it's a duplicate, cut this out of the candidate list and go round again
                    carResults.splice(i, 1);
                }
                else {
                    // LogMessage("#3");

                    addCarToStarterSlotsAndUsedList(slots, usedVariantNames, car);
                }
            }
            else {
                // LogMessage("#4");

                addCarToStarterSlotsAndUsedList(slots, usedVariantNames, car);
            }
        }

        playerDealershipCollection.updateOne(
            {
                "_id" : playerId
            },
            {
                "$set" :
                {
                    "Slots" : slots
                }
            },
            {
                "upsert" : true
            },
            function (dsUpdateErr, dsUpdateRes) {
                if (dsUpdateRes.result.ok === 1) {
                    callback(slots);
                }
                else {
                    callback(null);
                }
            }
        );
    };

    // Careful! This function will push an entry into the database with slotIndex. If that index already exists it will
    // create a second entry with the same slotIndex. Which is bad.
    var generateNewSlot = function (playerId, slots, slotIndex, playerLevel, depth, callback, forcedClass, forcedRarity, forcedModel) {
        if (depth > 3) {
            throw new Error("Aborting slot generation - failed to generate valid slot in ten recursions!");
        }

        // LogMessage(FormatString("generateNewSlot({0}, {1}, {2}, {3}, {4}, {5})", slotIndex, playerLevel, depth, forcedClass, forcedRarity, forcedModel));

        // Gets a random slot probabilty record - this will be used to determine the expiry time and time to refresh for the slot
        slotProbabilityManager.getTimes(function (slotRecord) {

            // Get the row in the probability table that corresponds to the player's level.
            // This dictates how likely they are to see each class of variant
            playerLevelProbabilityManager.getLevel(playerLevel, function(result) {
                var variantClass = result.getRandomClass();
                var dealershipCache = GetDealershipCacheCollection(playerId);

                if (forcedClass !== null && forcedClass !== undefined) {
                    variantClass = forcedClass;
                }

                // Lookup the Class.RarityRange key to see how many of each type of rarity we have in each class
                var rarity = rarityGeneratorFn();

                if (forcedRarity !== null && forcedClass !== undefined) {
                    rarity = forcedRarity;
                }

                var variantRange = variantClass + "." + rarity + "Range";
                var entry = dealershipCache.findOne({"Key": variantRange});
                if (entry === null || entry === undefined ||
                    entry.Value === null || entry.Value === undefined) {
                    // We don't have a range of valid cars for the chosen Class & Rarity combination
                    // Retry so we hopefully generate a valid combination
                    Spark.getLog().error(FormatString("Can not find cars which are of class: [{0}] and rarity: [{1}]", variantClass, rarity));
                    depth++;
                    generateNewSlot(playerId, slots, slotIndex, playerLevel, depth, callback);
                    return;
                }
                else {
                    var variantRangeRes = entry.Value;
                    // Lookup a random variant in this range to get the ObjectId to lookup in the CarInventory meta collection
                    var variantIndex = variantClass + "." + rarity + "." + Math.floor((Math.random() * variantRangeRes) + 1);
                    entry = dealershipCache.findOne({"Key": variantIndex});
                    if (entry === null || entry === undefined ||
                        entry.Value === null || entry.Value === undefined) {
                        // Retry
                        Spark.getLog().error(FormatString("Can not find a car matching: [{0}]", variantIndex));
                        depth++;
                        generateNewSlot(playerId, slots, slotIndex, playerLevel, depth, callback);
                        return;
                    }
                    else {
                        var variantIndexRes = entry.Value;
                        var carRes = null;

                        if (forcedModel !== null && forcedModel !== undefined) {
                            carRes = getRandomCommonModelVariant(forcedModel);
                        }

                        if (carRes === null || carRes === undefined) {
                            carRes = carInventoryCollection.findOne(
                            {
                                "_id" : { "$oid" : variantIndexRes }
                            });
                        }

                        if (doSlotsContainVariant(slots, slotIndex, carRes.CarVariantID)) {
                            // Log("generateNewSlot() got a duplicate for slot: {0} of [{1}]",
                            //     slotIndex, carRes.CarVariantID);
                            depth++;
                            generateNewSlot(playerId, slots, slotIndex, playerLevel, depth, callback);
                            return;
                        }

                        // LogMessage(FormatString("For slot: {0} got model: {1}, variant: {2}", slotIndex, carRes.Model, carRes.CarVariantID));

                        var now = Math.floor(GetNow() / 1000);
                        carRes.ModelData = carModelsGSCollection.findOne({"Model":{"$eq":carRes.Model}}).ClientData;
                        var newSlot = {
                            "SlotIndex" : slotIndex,
                            "Car" : carRes,
                            "ExpiryDateTime" : now + slotRecord.getRandomExpiry(),
                            "PurchasedDateTime" : 0,
                            "TimeToRefresh" : slotRecord.getRandomTimeToRefresh()
                        };

                        if (!carRes.InCarPool) {
                            // Yikes this car isn't available, how could we be returning it?!
                            Spark.getLog().error(FormatString(
                                "Dealership is trying to return a car [{0}] which isn't enabled!",
                                carRes.CarVariantID));

                            callback(null, slotIndex);
                            return;
                        }

                        // this could create duplicate entries if you are not careful!
                        playerDealershipCollection.updateOne(
                            {
                                "_id" : playerId
                            },
                            {
                                "$push" :
                                {
                                    "Slots" : newSlot
                                }
                            },
                            {
                                "upsert" : true
                            },
                            function (dsUpdateErr, dsUpdateRes) {
                                if (dsUpdateRes.result.ok === 1) {
                                    callback(newSlot, slotIndex);
                                }
                                else {
                                    callback(null, slotIndex);
                                }
                            });
                    }
                }
            });
        });
    };

   var getRandomCommonModelVariant = function(model) {
    //    LogMessage(FormatString("getRandomCommonModelVariant({0})", model));

        var collection = Spark.metaCollection("CarInventory");
        if (collection === null || collection === undefined){
            Spark.getLog().error("'CarInventory' collection doesn't exist");
            return null;
        }

        // LogMessage(FormatString("#1"));

        var variantCursor = collection.find({"Model" : model, "Rarity" : "Common", "InCarPool" : true});
        //var variantCursor = collection.find({"Model" : model, "Rarity" : "Common"});
        if (variantCursor === null || variantCursor === undefined){
            Spark.getLog().error("Model with id " + model + " doesn't have any cars in the pool on the server.");
            return null;
        }

        // LogMessage(FormatString("#2"));

        var variants = variantCursor.toArray();

        if (variants === null || variants === undefined || variants.length <= 0) {
            Spark.getLog().error("Model with id " + model + " doesn't have any cars in the pool on the server #2.");
            return null;
        }

        // LogMessage(FormatString("#3: {0}, {1}, {2}", variant, index, variants.length));

        var index = Math.floor(Math.random() * variants.length);
        var variant = variants[index];

        // LogMessage(FormatString("#4: {0}, {1}, {2}", variant, index, variants.length));

        return variant;
    }

    var getSlotsForPlayer = function(playerId, callback) {
        playerDealershipCollection.findOne(
            { "_id" : playerId },
            {},
            function (error, result) {
                if (error !== null) {
                    callback(null);
                }

                callback(result);
            });
    };

    var getForcedCalendarModelsForPlayer = function(playerId) {
        var models = getCalendarEntriesForPlayer().map(function(calendarEntry) {
            return calendarEntry.Model;
        });

        var uniqueModels = GetUniqueValuesInArray(models);

        // for (var i = 0; i < uniqueModels.length; ++i) {
        //     LogMessage(FormatString("Unique Model: {0}", JSON.stringify(uniqueModels[i])));
        // }

        return uniqueModels;
    }

    var getCalendarEntriesForPlayer = function(playerId) {
        var nowMilliseconds = 1000 * Math.floor(GetNow() / 1000);

        // any slot refreshes within an hour of the start of the calendar entry get the slot forced
        var oneHourMilliseconds = 60 * 60 * 1000;

        var nowPlusOneHourMilliseconds = nowMilliseconds + oneHourMilliseconds;

        var numSlots = GetNumDealershipSlots();

        var calendarEntries = dealershipCalendarGSCollection.find({
            "StartDate": {
                $lt: new Date(nowPlusOneHourMilliseconds)
                // $lt: {
                //     $date: {
                //         $numberLong: "1480963765000"
                //     }
                // }
            },
            "EndDate": {
                $gt: new Date(nowMilliseconds)
                    // $date: {
                    //     $numberLong: "1480963765000"
                    // }
                }
            // use limit to stop memory overflows
            // can't do much if we have more forced entries than slots!
            }).limit(numSlots + 1).toArray();

        if (calendarEntries.length > numSlots) {
            Spark.getLog().error(FormatString("Too many calendar entries for dealership: {0} entries. {1} slots",
                calendarEntries.length, numSlots));
        }

        // if (calendarEntries.length === 0) {
        //     LogMessage("no calendar entries for now!!!");
        // }

        // for (var i = 0; i < calendarEntries.length; ++i) {
        //     LogMessage(FormatString("Calendar entry: {0}", JSON.stringify(calendarEntries[i])));
        // }

        return calendarEntries;
    }

   /**
     * Should we override a car slot because of the calendar?
     * @param {string} playerId The current players id
     * @param {object[]} slots The current slot contents
     * @param {number} slotIndexToIgnore Ignore the contents of this slot when deciding to override
     * @param {object[]} mustHaves The list of cars we will be forcing (elsewhere)
     */
    var shouldForceCalendarModel = function(playerId, slots, slotIndexToIgnore, mustHaves) {
        if (slots.length === null || slots.length === undefined) {
            ErrorMessage(FormatString("slots has no length?! eh!?"));
            return null;
        }

        var forcedCalendarModels = getForcedCalendarModelsForPlayer(playerId);

        var maxSlots = GetNumDealershipSlots();

        // always allow the must haves space, truncate the calendar if required
        forcedCalendarModels.length = Math.min(forcedCalendarModels.length, maxSlots - mustHaves.length);

        for (var i = 0; i < forcedCalendarModels.length; ++i) {
            var forcedModel = forcedCalendarModels[i];
            if (!doSlotsContainModel(slots, slotIndexToIgnore, forcedModel)) {
                return forcedModel;
            }
        }

        return null;
    }

    var doSlotsContainModel = function(slots, slotIndexToIgnore, model) {
        //Log("length: {0}, slotIndexToIgnore: {1}, {2}:{3}", slots.length, slotIndexToIgnore, carClass, rarity);
        for (var i = 0; i < slots.length; ++i) {
            var slot = slots[i];

            if (slot.SlotIndex === slotIndexToIgnore) {
                //Log("Skipping slot: {0}", slotIndexToIgnore);

                // skip this one (it's the one we're going to replace)
                continue;
            }

            if (slot.Car.Model === model) {
                //Log("Slot: {0} contains: {1}", i, model);
                return true;
            }
            else {
                //Log("Slot: {0} does NOT contain: {1} vs {2}", i, model, slot.Car.Model);
            }
        }
        return false;
    }

    var doSlotsContainClassRarity = function(slots, slotIndexToIgnore, carClass, rarity) {
        //Log("length: {0}, slotIndexToIgnore: {1}, {2}:{3}", slots.length, slotIndexToIgnore, carClass, rarity);
        for (var i = 0; i < slots.length; ++i) {
            var slot = slots[i];

            if (slot.SlotIndex === slotIndexToIgnore) {
                //Log("Skipping slot: {0}", slotIndexToIgnore);

                // skip this one (it's the one we're going to replace)
                continue;
            }

            if (slot.Car.Rarity === rarity &&
                slot.Car.ModelData.Class === carClass) {
                //Log("Slot: {0} contains: {1}:{2}", i, carClass, rarity);
                return true;
            }
            else {
                //Log("Slot: {0} does NOT contain: {1}:{2} vs {3}:{4}", i, carClass, rarity, slot.Car.ModelData.Class, slot.Car.Rarity);
            }
        }
        return false;
    }

    var doSlotsContainVariant = function(slots, slotIndexToIgnore, variantName) {
        if (variantName === null || variantName === undefined) {
            Spark.getLog().error(FormatString(
                "doSlotsContainVariant() passed null or undefined?!",
                numAttemptsAllowed, carRes.CarVariantID));
        }

        //Log("length: {0}, slotIndexToIgnore: {1}, {2}:{3}", slots.length, slotIndexToIgnore, carClass, rarity);
        for (var i = 0; i < slots.length; ++i) {
            var slot = slots[i];

            if (slot.SlotIndex === slotIndexToIgnore) {
                //Log("Skipping slot: {0}", slotIndexToIgnore);

                // skip this one (it's the one we're going to replace)
                continue;
            }

            if (slot.Car.CarVariantID === variantName) {
                //Log("Slot: {0} contains: {1}:{2}", i, carClass, rarity);
                return true;
            }
            else {
                //Log("Slot: {0} does NOT contain: {1}:{2} vs {3}:{4}", i, carClass, rarity, slot.Car.ModelData.Class, slot.Car.Rarity);
            }
        }
        return false;
    }
};

function RecalculateDealershipCachedValues(abTest, cohort){
    var carInventory = GetBranchedCollection("CarInventory", abTest, cohort);
    var carModels = GetBranchedCollection("CarModels", abTest, cohort);
    var dealershipCache = GetBranchedCollection("DealershipCache", abTest, cohort);
    dealershipCache.remove({});

    var cars = carInventory.find().toArray();
    var models = carModels.find().toArray();
    var modelToClass = {};
    for (var i = 0; i < models.length; i++) {
        modelToClass[models[i].Model] = models[i].ClientData.Class;
    }
    var classes = {};
    for (var i = 0; i < cars.length; i++) {
        if (cars[i].InCarPool) {
            var variantClass = modelToClass[cars[i].Model];
            var variantRarity = cars[i].Rarity;
            if (!classes.hasOwnProperty(variantClass)) {
                classes[variantClass] = {};
            }

            if (!classes[variantClass].hasOwnProperty(variantRarity)){
                classes[variantClass][variantRarity] = 1;
            }
            else {
                classes[variantClass][variantRarity]++;
            }

            var key = "Class" + variantClass + "." + variantRarity + "." + classes[variantClass][variantRarity].toString();
            var cacheEntry = {
                "Key": key,
                "Value": cars[i]._id.$oid
            };
            dealershipCache.insert(cacheEntry);
        }
    }

    for (variantClass in classes) {
        for(variantRarity in classes[variantClass]) {
            var key = "Class" + variantClass + "." + variantRarity + "Range";
            var cacheEntry = {
                "Key": key,
                "Value": classes[variantClass][variantRarity].toString()
            };
            dealershipCache.insert(cacheEntry);
        }
    }
}