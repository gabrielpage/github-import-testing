// ====================================================================================================
// This is a selection of "hacks" used by the client-side class "MongzsAwesomeServerHacks".
// ====================================================================================================
requireOnce("CarInventoryUtilities");
requireOnce("GatchaPrizeUtilities");
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("XPUtilities");
requireOnce("TimeUtilities");
requireOnce("CollectionUtilities");

MongzAwesomServerHacks();

function MongzAwesomServerHacks(){
    if (!CanAllowDebugEvents()) {
        return;
    }

    var Action = Spark.getData().action;
    var IntValue = Spark.getData().intValue;
    var StringValue = Spark.getData().stringValue;
    var JsonValue = Spark.getData().json;
    var Player = Spark.getPlayer();
    var playerId = Player.getPlayerId();

    switch(Action) {
        case "ResetHourlyBonus":
            ResetHourlyBonus();
            break;
        case "AlmostResetHourlyBonus":
            AlmostResetHourlyBonus();
            break;
        case "AdjustCarSlots":
            AdjustPlayerCarSlots(playerId, IntValue);
            break;
        case "SetCarDurability":
            SetPlayerCarDurability(playerId, StringValue, IntValue);
            break;
        case "SetCarTimer":
            SetPlayerCarTimer(playerId, JsonValue.VariantId, JsonValue.TimerName, JsonValue.Timestamp);
            break;
        case "SkipWaitTimers":
            SkipWaitTimers(IntValue);
            break;
        case "RemoveAllButFirstCar":
            RemoveAllButFirstCar();
            break;
        case "GetCar":
            var car = AddNewCarToInventory(StringValue, playerId, 100, /*prizeCar*/true);
            if (car === null) {
                throw new Error(FormatString("Failed to find car variant \"{0}\" - probably not enabled in the pool", StringValue));
            }
            break;
        case "UpgradeCar":
            UpgradeCar(JsonValue);
            ReturnOwnedCarsInScriptData(playerId);
            break;
        case "AddProPackTokens":
            AddProPacksTokens(JsonValue);
            ProPacks(playerId);
            break;
        case "AdjustLevel":
            AdjustLevel(IntValue);
            break;
        case "AdjustXP":
            AdjustXP(IntValue);
            break;
        case "ResetLadderProgress":
            ResetLadderProgress(StringValue);
            break;
        case "AdjustLadderProgress":
            AdjustLadderProgress(StringValue, IntValue);
            break;
        case "GetBlueprintCars":
            Spark.setScriptData("BlueprintCars", GetAllBlueprintCars(playerId));
            break;
        case "SetBlueprintPieces":
            SetBlueprintPieces(playerId, StringValue, IntValue);
            break;
        case "SetPlayerSkill":
            SetPlayerSkill(playerId, JsonValue);
            break;
        default:
            throw new Error(FormatString("User \"{0}\" sent an unrecognised M.A.S.H command: \"{1}\"", Player.getDisplayName(), Action));
    }

    function ResetHourlyBonus() {
        SetNewHourlyBonusTimestamp(playerId, 0);
        //Spark.getLog().debug(FormatString("User \"{0}\" used the ResetHourlyBonus M.A.S.H. command; their Hourly Bonus timestamp has been reset.", Player.getDisplayName()));
    }

    function AlmostResetHourlyBonus() {
        SetNewHourlyBonusTimestamp(playerId, GetNow() - ((60 * 60) - 30) * 1000);
        //Spark.getLog().debug(FormatString("User \"{0}\" used the AlmostResetHourlyBonus M.A.S.H. command; their Hourly Bonus timestamp has been set to 59m 30s in the past.", Player.getDisplayName()));
    }

    function SkipWaitTimers() {
        var activeCar = GetPlayersActiveCar();
        activeCar.Timers.ServiceCompletionTime = 0;
        //TODO: Skip delivery times when implemented!
        SetPlayersActiveCar(activeCar);
        //Spark.getLog().debug(FormatString("User \"{0}\" used the SkipWaitTimers M.A.S.H. function; all wait times have been skipped.", Player.getDisplayName()));
    }

    function GetPlayersActiveCar() {
        var cars = GetCars(playerId);

        if (cars === null || cars === undefined)
            return null;

        var slots = GetPlayerSlots(playerId);
        if (slots === null || slots === undefined)
            return null;

        var activeIndex = slots.activeIndex;
        if (activeIndex > cars.length - 1)
            return null;

        var activeCar = cars[activeIndex];
        if (activeCar === null || activeCar === undefined)
            return null;

        return activeCar;
    }

    function SetPlayersActiveCar(car) {
        var slots = GetPlayerSlots(playerId);

        var versionedCars = GetVersionedCars(playerId);

        var successfullyWritten = false;
        while (!successfullyWritten) {
            var cars = versionedCars.GetData();

            if (cars === null || cars === undefined)
                return;

            var activeIndex = slots.activeIndex;
            if (activeIndex > cars.length - 1)
                return;

            cars[activeIndex] = car;

            successfullyWritten = versionedCars.SetData(cars);
        }
    }

    function SetPlayerCarDurability(playerId, variantId, durability){
        var versionedCars = GetVersionedCars(playerId);

        var successfullyWritten = false;
        while (!successfullyWritten) {
            var cars = versionedCars.GetData();

            var found = false;
            for (var i = 0; i < cars.length; ++i) {
                var car = cars[i];
                if (car.CarVariantID == variantId) {
                    found = true;
                    car.Status.Durability = durability;
                    break;
                }
            }
            if (!found) {
                throw new Error(FormatString("Car \"{0}\" not found in profile", variantId));
            }

            successfullyWritten = versionedCars.SetData(cars);
        }
    }

    function SetPlayerCarTimer(playerId, variantId, timerName, timestamp) {
        var versionedCars = GetVersionedCars(playerId);

        var successfullyWritten = false;
        while (!successfullyWritten) {
            var cars = versionedCars.GetData();

            var found = false;
            for (var i = 0; i < cars.length; ++i) {
                var car = cars[i];
                if (car.CarVariantID == variantId) {
                    found = true;
                    if (car.Timers[timerName] === undefined) {
                        throw new Error(FormatString("Timer \"{0}\" for car \"{1}\" is undefined", timerName, variantId));
                    }
                    car.Timers[timerName] = timestamp;
                    break;
                }
            }
            if (!found) {
                throw new Error(FormatString("Car \"{0}\" not found in profile", variantId));
            }

            successfullyWritten = versionedCars.SetData(cars);
        }
    }

    function RemoveAllButFirstCar() {
        throw new Error("Not implemented!");
    }

    function UpgradeCar(json) {
        var brakes = json.brakes;
        var handling = json.handling;
        var weight = json.weight;
        var power = json.power;
        var pack = json.pack;
        var carVariant = json.carVariant;
        var carVariantDiscriminator = json.carVariantDiscriminator;

        var versionedCars = GetVersionedCars(playerId);

        var successfullyWritten = false;
        while (!successfullyWritten) {
            var allPlayerCars = versionedCars.GetData();

            if (allPlayerCars === null || allPlayerCars === undefined)
                return;

            for (var i = 0; i < allPlayerCars.length; ++i) {
                var car = allPlayerCars[i];
                if (car.CarVariantID === carVariant && car.CarID === carVariantDiscriminator) {
                    car.Status.CarUpgradeStatus.PackFitted = pack;
                    car.Status.CarUpgradeStatus.PowerStage = power.stage;
                    car.Status.CarUpgradeStatus.PowerLevel = power.level;
                    car.Status.CarUpgradeStatus.WeightStage = weight.stage;
                    car.Status.CarUpgradeStatus.WeightLevel = weight.level;
                    car.Status.CarUpgradeStatus.HandlingStage = handling.stage;
                    car.Status.CarUpgradeStatus.HandlingLevel = handling.level;
                    car.Status.CarUpgradeStatus.BrakingStage = brakes.stage;
                    car.Status.CarUpgradeStatus.BrakingLevel = brakes.level;
                    allPlayerCars[i] = car;
                    break;
                }
            }
            successfullyWritten = versionedCars.SetData(allPlayerCars);
        }
    }

    function AddProPacksTokens(json) {
        var proPacks = json.proPacks;

        var versionedProPacks = GetVersionedPlayerProPacks(playerId);

        var successfullyWritten = false;
        while (!successfullyWritten) {
            // must initially get the data, even to discard it ...
            versionedProPacks.GetData();

            successfullyWritten = versionedProPacks.SetData(proPacks);
        }
    }

    function AdjustLevel(level) {
        var player = Spark.getPlayer();
        var xpBalance = Spark.getPlayer().getBalance6();
        var xpForGivenLevel = GetTotalXPForLevel(level, player.getPlayerId());
        AddXPAmount(player, xpForGivenLevel - xpBalance);
        SetPlayerLevelUpShown(player.getPlayerId(), level - 1);
    }

    function AdjustXP(xp) {
        AddXPAmount(Spark.getPlayer(), xp);
    }

    function ResetLadderProgress(ladder) {
        var versionedLadderProgressData = GetVersionedPlayerLadderProgressData(playerId);

        var successfullyWritten = false;
        while (!successfullyWritten) {
            var ladderProgressData = versionedLadderProgressData.GetData();

            if (ladder === "") {
                ladderProgressData = {};
            }
            else {
                var ladderToReset = ladderProgressData[ladder];
                if (ladderToReset === 0) {
                    delete ladderProgressData[ladder];
                }
                else {
                    ladderProgressData[ladder] = 0;
                }
            }

            successfullyWritten = versionedLadderProgressData.SetData(ladderProgressData);
        }
    }

    function AdjustLadderProgress(ladder, adjustment) {
        if (ladder === null || ladder === undefined || adjustment === 0) {
            return;
        }

        var versionedLadderProgressData = GetVersionedPlayerLadderProgressData(playerId);

        var successfullyWritten = false;
        while (!successfullyWritten) {
            var ladderProgressData = versionedLadderProgressData.GetData();

            if (ladderProgressData[ladder] !== null && ladderProgressData[ladder] !== undefined) {
                ladderProgressData[ladder] = Math.max(0, ladderProgressData[ladder] + adjustment);
            }

            successfullyWritten = versionedLadderProgressData.SetData(ladderProgressData);
        }
    }

    function GetAllBlueprintCars(playerId) {
        var carInventory = GetCarInventoryCollection(playerId);
        var blueprintCars = carInventory.find({
            CanBeEarnedViaBlueprint: true
        },
        {
            CarVariantID: true,
            BlueprintPiecesRequired: true
        });
        if (blueprintCars === null || blueprintCars === undefined) {
            return [];
        }
        return blueprintCars.toArray();
    }

    function SetBlueprintPieces(playerId, carVariantID, pieces) {
        var versionedBlueprints = GetVersionedBlueprints(playerId);
        var carVariantToAward = null;
        var successfullyWritten = false;
        while (!successfullyWritten) {
            carVariantToAward = null;
            var blueprints = versionedBlueprints.GetData();

            // Check to see if the variant is already in the blueprint list.
            var selectedBlueprintEntry = null;
            for (var i = 0; i < blueprints.length; i++) {
                var currentBlueprint = blueprints[i];
                if (currentBlueprint.CarVariant !== null) {
                    // If the Variant ID of the car matches the prize Variant ID, increment the piece count.
                    if (currentBlueprint.CarVariant.CarVariantID === carVariantID) {
                        currentBlueprint.Pieces += pieces;
                        selectedBlueprintEntry = currentBlueprint;
                        break;
                    }
                }
            }

            var piecesRequired = 0;
            var carInventoryCollection = GetCarInventoryCollection(playerId);
            var car = carInventoryCollection.findOne({
                CarVariantID: carVariantID
            });

            // If it isn't in the blueprint list, add a new entry for this Variant.
            if (selectedBlueprintEntry === null || selectedBlueprintEntry === undefined) {
                selectedBlueprintEntry = {
                    "CarVariant": car,
                    "Pieces": pieces,
                    "PiecesRequired": car.BlueprintPiecesRequired,
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

            successfullyWritten = versionedBlueprints.SetData(blueprints);
        }

        if (carVariantToAward !== null && carVariantToAward !== undefined) {
            // Credit the car to the profile.
            AddNewCarToInventory(carVariantToAward, playerId, 100, true);
        }

        ReturnOwnedCarsInScriptData(playerId);
        BlueprintPieces(playerId);
    }

    function SetPlayerSkill(playerId, data) {
        var skill = Math.min(Math.max(data.skill, 1.0), GetWorstSkill());

        var versionedStats = GetVersionedPlayerStats(playerId);

        var successfullyWritten = false;
        while (!successfullyWritten) {
            var stats = versionedStats.GetData();

            if (data.track) {
                if (!stats.trackSkills) {
                    stats.trackSkills = {};
                }
                var trackSkill = stats.trackSkills[data.track];
                if (!trackSkill) {
                    trackSkill = {};
                    trackSkill.raceCount = 0;
                    stats.trackSkills[data.track] = trackSkill;
                }
                if (data.carClass) {
                    var carClasses = trackSkill.carClasses;
                    if (!carClasses) {
                        carClasses = {};
                        trackSkill.carClasses = carClasses;
                    }
                    var classSkill = carClasses[data.carClass];
                    if (!classSkill) {
                        classSkill = {};
                        carClasses[data.carClass] = classSkill;
                        classSkill.raceCount = 0;
                    }
                    classSkill.skill = skill;
                }
                else {
                    trackSkill.skill = skill;
                }
            }
            else {
                stats.skill = skill;
            }

            successfullyWritten = versionedStats.SetData(stats);
        }
    }

}
