// ====================================================================================================
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("CarInventoryUtilities");
requireOnce("CollectionUtilities");
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("RaceEventUtilities");
requireOnce("RaceTypeUtilities");
requireOnce("RaceUtilities");
requireOnce("SessionUtilities");
requireOnce("UpgradeUtilities");

Matchmake();

function Matchmake(){
    var laps = Spark.getData().laps;
    var perfectCurrentColdLapStr = Spark.getData().perfectCurrentColdLap;
    var perfectCurrentHotLapStr = Spark.getData().perfectCurrentHotLap;
    var perfectSessionColdLapStr = Spark.getData().perfectSessionColdLap;
    var perfectSessionHotLapStr = Spark.getData().perfectSessionHotLap;

    var perfectCurrentColdLap = parseFloat(perfectCurrentColdLapStr);
    var perfectCurrentHotLap = parseFloat(perfectCurrentHotLapStr);
    var perfectSessionColdLap = parseFloat(perfectSessionColdLapStr);
    var perfectSessionHotLap = parseFloat(perfectSessionHotLapStr);

    var debug = (Spark.getData().debug === "True");
    var event = Spark.getData().event;
    var track = Spark.getData().track;
    var carClass = Spark.getData().carClass;
    var betAmount = Spark.getData().betAmount;
    var doCancel = (Spark.getData().doCancel === "True");
    var wantAIEdgeProbability = (Spark.getData().wantAIEdgeProbability === "True");

    var raceType = Spark.getData().raceType;
    var variantID = Spark.getData().variantID;

    var player = Spark.getPlayer();
    var playerId = player.getPlayerId();

    if (raceType === Ladder) {
        //LogMessage(FormatString("Ladder race MatchmakeForGSRealtime_v002400!"));

        var ladderCarVariant = GetCarInventoryEntry(variantID, playerId);
        if (ladderCarVariant !== null && ladderCarVariant !== undefined) {
            Spark.setScriptData("AIvariantID", ladderCarVariant.CarVariantID);
            Spark.setScriptData("AIvariantName", ladderCarVariant.VariantName);
            Spark.setScriptData("AIlongName", ladderCarVariant.LongName);
            Spark.setScriptData("AIvariantRarity", ladderCarVariant.Rarity);

            if (ladderCarVariant.ModelData !== null && ladderCarVariant.ModelData !== undefined) {
                Spark.setScriptData("AIvariantClass", ladderCarVariant.ModelData.Class);
                Spark.setScriptData("AIvariantManufacturer", ladderCarVariant.ModelData.ManufacturerName);
            }
        }
        else {
            ErrorMessage(FormatString("Can not find variant: {0} for AI ladder race in car inventory",
                variantID));
        }


        // my work here is done ...
        // todo ... server stuff, one day, maybe
        return;
    }

    var fullVersion = player.getSegmentValue("VERSION");
    var version = VersionGetMajor(fullVersion) + VersionGetMinor(fullVersion);

    var sessionSkill = EnterSessionAndSetupResponse(playerId, event, carClass);

    if (sessionSkill <= 0) {
        return;
    }

    var perfectSessionTime = TotalTime(laps, perfectSessionColdLap, perfectSessionHotLap);

    if (perfectSessionTime <= 0) {
        Spark.getLog().error(FormatString("perfectSessionTime <= 0: {0}", perfectSessionTime));
    }

    var matchmakeValue = perfectSessionTime * sessionSkill;
    matchmakeValue = Math.max(matchmakeValue, 0);
    matchmakeValue = Math.floor(matchmakeValue * 1000);

    var hardCriteria = "criteria_" + event + "_" + track + "_" + betAmount + "_v" + version;
    hardCriteria = hardCriteria.split(" ").join("_");

    var infiniteMatchmake = false;
    var openMatchmake = false;
    var eventData = GetRaceEventDataFromMetaCollection(event, true, playerId);
    if (eventData !== null && eventData !== undefined){
        if (eventData.InfiniteMatchmake !== null && eventData.InfiniteMatchmake !== undefined){
            infiniteMatchmake = eventData.InfiniteMatchmake;
        }
        if (eventData.OpenMatchmake !== null && eventData.OpenMatchmake !== undefined) {
            openMatchmake = eventData.OpenMatchmake;
        }
    }

    var matchShortCode = "";
    if (infiniteMatchmake && openMatchmake) {
        matchShortCode = "Matchmaking_Open_Infinite";
    }
    else if (infiniteMatchmake) {
        matchShortCode = "Matchmaking_Infinite";
    }
    else if (openMatchmake) {
        matchShortCode = "Matchmaking_Open";
    }
    else {
        if (debug) {
            matchShortCode = "BasicMatching_v044";
        }
        else {
            matchShortCode = "BasicMatching_v0130";
        }
    }

    if (doCancel) {
        Cancel();
    }
    else {
        Join(playerId);
    }

    function Cancel(){
        if (raceType === PvP) {
            var response = Spark.sendRequestAs({"@class": ".MatchmakingRequest",
                                                "matchGroup": hardCriteria,
                                                "matchShortCode": matchShortCode,
                                                "skill": matchmakeValue,
                                                "action": "cancel"},
                                                playerId);
            if (response !== null){
                if (response.error !== undefined){
                    Spark.getLog().error(response.error);
                    ErrorMessage("Cancelling MatchmakingRequest failed: ", response.error);
                    return;
                }
            }
        }
        else {
            ErrorMessage("Attempting to cancel matchmaking for a non-PvP race makes no sense! Type: {0}", raceType);
        }
    }

    function Join(playerId) {
        var perfectCurrentTime = TotalTime(laps, perfectCurrentColdLap, perfectCurrentHotLap);

        if (perfectCurrentTime <= 0) {
            Spark.getLog().error(FormatString("perfectCurrentTime <= 0: {0}", perfectCurrentTime));
        }

        // var message = FormatString("#2 player sessionSkill {0} perfect session time {1} perfect current time {2} matchmake value {3} laps {4}",
        //     sessionSkill, perfectSessionTime, perfectCurrentTime, matchmakeValue, laps);

        // Spark.getLog().info(message);
        // LogMessage(message);

        // Spark.getLog().info("Hard criteria: " + hardCriteria);

        if (raceType === PvP) {
            var response = Spark.sendRequestAs({"@class": ".MatchmakingRequest",
                                                "matchGroup": hardCriteria,
                                                "matchShortCode": matchShortCode,
                                                "skill": matchmakeValue},
                                                playerId);
            if (response !== null){
                if (response.error !== undefined){
                    Spark.getLog().error(response.error);
                    ErrorMessage("MatchmakingRequest failed: ", response.error);
                    return;
                }
            }
        }
        else {
            //LogMessage(FormatString("Non PvP race join: {0}", raceType));
        }

        // NOTE: We're just gonnna' put the perfect race time in the player's private data for now
        // as a temporary solution

        // This is used to calculate the player skill at the end of the race.
        // We need the perfectSessionTime only for matchmaking, although we may one day need to store it too.
        var versionedRaceDetails = GetVersionedRaceDetails(playerId);

        var successfullyWritten = false;
        while (!successfullyWritten) {
            versionedRaceDetails.GetData();
            successfullyWritten = versionedRaceDetails.SetData({
                PerfectCurrentTime : perfectCurrentTime,
                Track : track,
                CarClass : carClass});
        }

        AddSkillStatsToResponse(playerId, track, carClass);

        if (wantAIEdgeProbability) {
            AddAIEdgeProbabilitiesToResponse();
        }

        AddAICarToResponse();
    }

    function AddAIEdgeProbabilitiesToResponse() {
        var edgeProbabilitiesCollection = GetEdgeAIUpgradeProbabilitiesCollection(playerId);

        var activeCarVariant = GetPlayerActiveCar(playerId);
        if (activeCarVariant === null || activeCarVariant === undefined) {
            ErrorMessage("Cannot get active car variant for player?!");
            return;
        }

        var activeCar = GetCarInventoryEntry(activeCarVariant.CarVariantID, playerId);

        if (activeCar === null || activeCar === undefined) {
            ErrorMessage("Cannot get active car for player?!");
            return;
        }

        // want this class:
        var currentCarBaseClass = activeCar.ModelData.Class;
        var carPips = GetNumUpgradePips(activeCarVariant.Status.CarUpgradeStatus);

        var probabilities = edgeProbabilitiesCollection.findOne({"Class": currentCarBaseClass, "Pips" : carPips});

        if (probabilities === null || probabilities === undefined) {
            Warn("Cannot find edge probabilities for class: {0} and pips: {1}. Using fallback of 'C'+0",
                currentCarBaseClass, carPips);

            // fallback query
            probabilities = edgeProbabilitiesCollection.findOne({"Class": "C", "Pips" : 0});

            // send it back as what we asked for ...
            probabilities.Class = currentCarBaseClass;
            probabilities.Pips = carPips;
        }

        delete probabilities._id;

        Spark.setScriptData("AIEdgeProbabilities", [probabilities]);
    }

    function AddAICarToResponse() {
        // LogMessage(FormatString("MatchmakeForGSRealtime_v0_11_0: perfectCurrentTime: [{0}], " +
        //     "perfectSessionTime: [{1}], event [{2}], betAmount [{3}], skill [{4}], races: [{5}], " +
        //     "averageBet: [{6}]",
        //     perfectCurrentTime,
        //     perfectSessionTime,
        //     event,
        //     betAmount));

        var forceRandomVariantOfOurModel = false;

        // Add a random variant to the list, in case we need to use AI.
        // 1) Do we need to force a model?
        if (eventData !== null && eventData !== undefined &&
            eventData.Restrictions !== null && eventData.Restrictions !== undefined) {
            for (var i = 0; i < eventData.Restrictions.length; ++i) {
                var restriction = eventData.Restrictions[i];

                if (restriction.Type === "CarModel") {
                    var forcedModel = restriction.Condition1;

                    if (forcedModel !== null && forcedModel !== undefined) {
                        //Log("#0: forcedModel: {0}", forcedModel);

                        var variants = GetModelVariants(forcedModel);
                        var variant = PickRandomVariant(variants);
                        AddDetailsToResponseForVariant(variant);
                    }

                    // if any of above fails silently we'll simply end up with the player car
                    return;
                }
                else if (restriction.Type === "Manufacturer") {
                    // simplest thing here is to keep doing what we used to do i.e.
                    // pick a variant of the players model
                    forceRandomVariantOfOurModel = true;
                }

                // better way, more code required...
                // else if (restriction.Type === "Manufacturer") {
                //     var forcedManufacturer = restriction.Condition1;

                //    if (forcedManufacturer !== null && forcedManufacturer !== undefined) {
                //         Log("#0: forcedManufacturer: {0}", forcedManufacturer);

                //         var variants = GetManufacturerVariants(forcedManufacturer);
                //         var variant = PickRandomVariant(variants);
                //         AddDetailsToResponseForVariant(variant);
                //     }

                //     // if any of above fails silently we'll simply end up with the player car
                //     return;
                // }
            }
        }

        // fall back to our old strategy of picking for cases we've not done something better
        if (forceRandomVariantOfOurModel) {
            //Log("#-1 forceRandomVariantOfOurModel");
            var activeCarVariant = GetPlayerActiveCar(playerId);
            if (activeCarVariant !== null && activeCarVariant !== undefined) {
                var activeCar = GetCarInventoryEntry(activeCarVariant.CarVariantID, playerId);

                if (activeCar !== null && activeCar !== undefined) {
                    var variants = GetModelVariants(activeCar.Model);
                    var variant = PickRandomVariant(variants);
                    AddDetailsToResponseForVariant(variant);
                }
            }
            return;
        }

        // 2) No forced model, so try to get a variant of the same class
        // This can fail as we might randomly pick a car which has no variants in the car pool,
        // in which case we fall back to a variant of the same model as the player
        var activeCarVariant = GetPlayerActiveCar(playerId);
        if (activeCarVariant !== null && activeCarVariant !== undefined) {
            var activeCar = GetCarInventoryEntry(activeCarVariant.CarVariantID, playerId);
            if (activeCar !== null && activeCar !== undefined) {
                // want this class:
                var currentCarClass = activeCar.ModelData.Class;

                //Log("#1: currentCarClass: {0}", currentCarClass);

                // TODO - only return models which have cars in the car pool
                var models = GetModelsOfClass(currentCarClass);

                var variants = null;
                if (models !== null && models !== undefined && models.length > 0) {
                    var model = models[Math.floor(Math.random() * models.length)];
                    //Log("#2: picked {0} from models: {1}", model.Model, JSON.stringify(models));
                    variants = GetModelVariants(model.Model);
                }

                if (variants === null || variants === undefined || variants.length === 0) {
                    // Might happen if a model exists, but doesn't have any cars in the car pool,
                    // or this one isn't in the car pool. Since we don't know if any of them are in
                    // the car pool fall straight back to the model we currently have
                    variants = GetModelVariants(activeCar.Model);

                    //Log("#5 fallback to player car from {0} to {1} variants: {2}", model.Model, activeCar.Model, variants);
                }
                else {
                    //Log("#4 got variants for model: {0}, variants: {1}", model.Model, JSON.stringify(variants));
                }

                var variant = PickRandomVariant(variants);

                AddDetailsToResponseForVariant(variant);
            }
        }
    }

    function PickRandomVariant(variants) {
        var variant = null;

        if (variants !== null && variants !== undefined && variants.length > 0) {
            var index = Math.floor(Math.random() * variants.length);
            variant = variants[index];
        }

        return variant;
    }

    function AddDetailsToResponseForVariant(variant) {
        if (variant !== null && variant !== undefined) {
            Spark.setScriptData("AIvariantID", variant.CarVariantID);
            Spark.setScriptData("AIvariantName", variant.VariantName);
            Spark.setScriptData("AIlongName", variant.LongName);
            Spark.setScriptData("AIvariantRarity", variant.Rarity);

            if (variant.Model !== null && variant.Model !== undefined) {
                var model = GetModelInventoryEntry(variant.Model);
                if (model !== null && model !== undefined) {
                    if (model.Class !== null && model.Class !== undefined) {
                        Spark.setScriptData("AIvariantClass", model.Class);
                    }
                    if (model.Class !== null && model.Class !== undefined) {
                        Spark.setScriptData("AIvariantManufacturer", model.ManufacturerName);
                    }
                }
                else {
                    //LogMessage(FormatString("variant.ModelData bad: {0}", JSON.stringify(model)));
                }
            }
        }
    }

	function TotalTime(numLaps, coldLap, hotLap) {
		var totalTime = 0;

        if (!isFinite(numLaps)) {
            Spark.getLog().error(FormatString("numLaps is not a number: {0}!", numLaps));
            return -1;
        }

        if (!isFinite(coldLap)) {
            Spark.getLog().error(FormatString("coldLap is not a number: {0}!", coldLap));
            return -1;
        }

        if (!isFinite(hotLap)) {
            Spark.getLog().error(FormatString("hotLap is not a number: {0}!", hotLap));
            return -1;
        }

		if (numLaps <= 0) {
            Spark.getLog().error(FormatString("numLaps is <= 0: {0}!", numLaps));
			return -1;
		}

		if (coldLap > 0) {
			totalTime += coldLap;
		}
		else {
			return -1;
		}

		if (numLaps === 1) {
			return totalTime;
		}

		if (hotLap > 0) {
			totalTime += (hotLap * (numLaps - 1));
		}
		else {
			return -1;
		}

		return totalTime;
	}

    function GetModelsOfClass(carClass) {
        var collection = Spark.metaCollection("CarModels");
        if (collection === null || collection === undefined){
            Spark.getLog().error("'CarModels' collection doesn't exist");
            return [];
        }

        var query = {
            "ClientData.Class" : carClass
        };

        var projection = {
            "Model": 1
        };

        var results = collection.find(query, projection);

        if (results === null || results === undefined){
            Spark.getLog().error("Model with class " + carClass + " doesn't exist.");
            return [];
        }

        return results.toArray();
    }

    // could force a class here
    // function GetManufacturerVariants(ManufacturerName) {
        // in models collection:

        // query = {ClientData.Manufacturer:"Ford", ClientData.Class:"C"}

        // projection = {Model : 1}

        // results like array of :
        //  {
        //  "_id": {
        //   "$oid": "56f2826eade40705e73fdebe"
        //  },
        //  "Model": "Ford_Mustang_Mach1_1971",
        // }

        // pick a model and call: GetModelVariants()

    //     return [];
    // }

    function GetModelVariants(modelId) {
        var collection = GetCarInventoryCollection(playerId);
        if (collection === null || collection === undefined){
            Spark.getLog().error("'CarInventory' collection doesn't exist");
            return [];
        }

        var query = collection.find({"Model":modelId, "InCarPool":true});
        if (query === null || query === undefined){
            Spark.getLog().error("Model with id " + modelId + " doesn't have any cars in the pool on the server.");
            return [];
        }

        return query.toArray();
    }
}
