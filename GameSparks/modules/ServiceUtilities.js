// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("PlayerDataUtilities");
requireOnce("CurrencyUtilities");
requireOnce("MathUtilities");
requireOnce("GeneralUtilities");
requireOnce("GameStatsUtilities");
requireOnce("TimeUtilities");
requireOnce("CollectionUtilities");

// Module: ServiceUtilities
function UpdateServicing(variantId, carId, playerId) {
    var carToService = GetPlayerCar(variantId, carId, playerId);
    if (carToService === null) {
        ErrorMessage(FormatString("Cannot get details of {0} {1} from player's private data", variantId, carId));
        return;
    }

    var completionTime = carToService.Timers.ServiceCompletionTime; // Seconds
    if (completionTime <= 0) {
        Spark.getLog().warn(FormatString("Game is trying to complete servicing when the car ({0}:{1}) is not being serviced",
            variantId,
            carId));
        return;
    }

    var now = Math.ceil(GetNow() / 1000); // Seconds, and don't quibble over < 1s

    if (now >= completionTime) {
        // Slow servicing is done, update car durability

        var carModelsCollection = GetCarModelsCollection(playerId);
        var model = carModelsCollection.findOne({"Model": carToService.Item.Model});

        var servicingSetupByClassCollection = GetServicingSetupByClassCollection(playerId);
        var carClass = model.ClientData.Class;
        var classCosts;
        // do we have a ProPack fitted?
        if (carToService.Status.CarUpgradeStatus.PackFitted > 0) {
            var classWithProPack = ClassWithProPackForCosts(carClass);
            classCosts = servicingSetupByClassCollection.findOne({"Class": classWithProPack});
        }
        else {
            classCosts = servicingSetupByClassCollection.findOne({"Class": carClass});
        }

        var servicingGlobalSetupCollection = GetServicingGlobalSetupCollection(playerId);
        var servicingGlobalCosts = servicingGlobalSetupCollection.findOne();

        if (ServiceCar(carToService, model, classCosts, servicingGlobalCosts)) {
            SetPlayerCar(variantId, carId, playerId, carToService);
        }
    }
    else {
        Spark.getLog().warn(FormatString("Game is trying to complete servicing for car ({0}:{1}) when it's too early. Complete at: {2}, now: {3}, remaining: {4}",
            variantId,
            carId,
            completionTime,
            now,
            completionTime - now));
    }
}

// Module: ServiceUtilities
function StartService(variantId, carId, expectedPrice, playerId) {
    var carToService = GetPlayerCar(variantId, carId, playerId);
    if (carToService === null) {
        ErrorMessage(FormatString("Cannot get details of {0} {1} from player's private data", variantId, carId));
        return;
    }
    // Get the necessary values
    var completionTime = carToService.Timers.ServiceCompletionTime;
    if (completionTime !== undefined && completionTime !== null && completionTime !== 0){
        ErrorMessage("Completion time is already set for this car, so we can't slow service");
        return;
    }

    var carTemplate = carToService.Item;

    if (carTemplate === null){
        ErrorMessage(FormatString("wtf? no inventory entry for {0}"));
        return;
    }

    if (carToService.Status.NumServicesDone === undefined) {
        // cars did not used to have this
        carToService.Status.NumServicesDone = 0;
    }

    var carModelsCollection = GetCarModelsCollection(playerId);
    var model = carModelsCollection.findOne({"Model": carToService.Item.Model});

    var carClass = model.ClientData.Class;

    if (carClass === null || carClass === undefined) {
        ErrorMessage(FormatString("unknown class: {0}", carClass));
        return;
    }
    // else {
    //     LogMessage(FormatString("unknown class: {0}", carClass));
    // }

    var servicingSetupByClassCollection = GetServicingSetupByClassCollection(playerId);

    // Spark.getLog().info(FormatString("model: {0}", JSON.stringify(carToService.Item.Model)));

    // Spark.getLog().info(FormatString("model data: {0}", JSON.stringify(model)));

    var classCosts;
    // do we have a ProPack fitted?
    if (carToService.Status.CarUpgradeStatus.PackFitted > 0) {
        var classWithProPack = ClassWithProPackForCosts(carClass);
        classCosts = servicingSetupByClassCollection.findOne({"Class": classWithProPack});
    }
    else {
        classCosts = servicingSetupByClassCollection.findOne({"Class": carClass});
    }

    var servicingDurationSeconds = GetCurrentServicingTimeSeconds(model, classCosts, carToService.Status.NumServicesDone);

    var servicingGlobalSetupCollection = GetServicingGlobalSetupCollection(playerId);
    var servicingGlobalCosts = servicingGlobalSetupCollection.findOne();

    var cost = GetCurrentServiceCashCost(carToService, model, classCosts, servicingGlobalCosts, carToService.Status.NumServicesDone);

    // Final check we should be doing the service. If the service will give us less laps than we currently have don't
    // do it. The game client should check this and stop us getting here
    var newNumLaps = GetLapsBeforeService(model, classCosts, servicingGlobalCosts, carToService.Status.NumServicesDone + 1);

    if (newNumLaps <= carToService.Status.Durability) {
        // XXX ALTERNATE STATUS
        // Should be prevented elsewhere, but here we've done a service which would award less laps than we
        // already have. We won't refund the money, but at least don't reduce the lap count, or increment the
        // service count
        var errorMessage = FormatString(
            "Attempting car service which would decrease the car lap count from: {0} to {1}. Don't let this happen.",
            carToService.Status.Durability,
            newNumLaps);
        Spark.getLog().error(errorMessage);
        return;
    }

    if (expectedPrice !== cost && expectedPrice !== -1) {
        Spark.getLog().warn(FormatString("Cost of service start on server is {0} but the client thinks its {1}",
            cost, expectedPrice));

        ReturnCorrectCostInScriptData(cost);
        return;
    }

    // At this point we have done all of our data lookup, which are the most likely bits of code to fail
    // so now actually debit the cost. N.B. the client should stop us getting here 99% of the time if
    // we don't have enough money anyway.
    var premium = false;
    if (Debit(cost, premium, playerId)) {
        IncrementLifetimeCashSpend(playerId, cost);
    }
    else {
        // XXX ALTERNATE STATUS
        var balance = GetBalance(premium, playerId);
        ErrorMessage("Not enough money to service (the cost is " + cost + " but we only have " + balance + ")");
        return;
    }

    carToService.Timers.ServiceCompletionTime = Math.ceil((GetNow() / 1000) + servicingDurationSeconds);

    if (isNaN(carToService.Timers.ServiceCompletionTime)) {
        Spark.getLog().error(FormatString("carToService.Timers.ServiceCompletionTime isNan(): {0} for {1}:{2}",
            carToService.Timers.ServiceCompletionTime,
            variantId,
            carId));

        carToService.Timers.ServiceCompletionTime = 0;
    }

    SetPlayerCar(variantId, carId, playerId, carToService);

    AddLifetimeSpendToResponse(playerId);
}

// Module: ServiceUtilities
function ExpediteService(variantId, carId, expectedPrice, playerId) {
    var carToService = GetPlayerCar(variantId, carId, playerId);
    if (carToService === null) {
        return;
    }

    var cost = 0;
    var completionTime = carToService.Timers.ServiceCompletionTime;
    if (completionTime === undefined || completionTime === null || completionTime === 0) {
        ErrorMessage("Can't expedite a car that is not being serviced");
        // car is not being serviced, no insta-service
        return;
    }

    var carModelsCollection = GetCarModelsCollection(playerId);
    var model = carModelsCollection.findOne({"Model": carToService.Item.Model});

    var servicingSetupByClassCollection = GetServicingSetupByClassCollection(playerId);
    var carClass = model.ClientData.Class;
    var classCosts;
    // do we have a ProPack fitted?
    if (carToService.Status.CarUpgradeStatus.PackFitted > 0) {
        var classWithProPack = ClassWithProPackForCosts(carClass);
        classCosts = servicingSetupByClassCollection.findOne({"Class": classWithProPack});
    }
    else {
        classCosts = servicingSetupByClassCollection.findOne({"Class": carClass});
    }

    var servicingGlobalSetupCollection = GetServicingGlobalSetupCollection(playerId);
    var servicingGlobalCosts = servicingGlobalSetupCollection.findOne();

    var now = GetNow() / 1000; // Seconds
    if (now >= completionTime) {
        // wtf we're done why are we expediting
        // zero cost anyway
        cost = 0;

        Spark.getLog().warn(FormatString(
            "For car: {0}:{1} we are expediting a completed service wtf?! (making it free)",
            variantId,
            carId));
    }
    else {
        // Skip service
        var timeRemainingSeconds = completionTime - now;

        cost = GetCurrentGoldServicingExpediteCost(model, classCosts, servicingGlobalCosts,
            carToService.Status.NumServicesDone, timeRemainingSeconds);
    }

    if (expectedPrice !== cost && expectedPrice !== -1) {
        Spark.getLog().warn(FormatString("Cost of service expedite on server is {0} but the client thinks its {1}",
            cost, expectedPrice));

        ReturnCorrectCostInScriptData(cost);
        return;
    }

    var premium = true;
    if (cost === 0 || Debit(cost, premium, playerId)) {
        // Update car details
        if (ServiceCar(carToService, model, classCosts, servicingGlobalCosts)) {
            SetPlayerCar(variantId, carId, playerId, carToService);
        }
    }
    AddLifetimeSpendToResponse(playerId);
}

// Module: ServiceUtilities
function ClassWithProPackForCosts(/*enum-string*/ carClass) {
    if (carClass === "C") {
        return "B";
    }
    if (carClass === "B") {
        return "A";
    }
    if (carClass === "A") {
        return "S";
    }

    return "SPP";
}

// Module: ServiceUtilities
function CalculateServicingCosts(/*array[int]*/ serviceCostMultipliers, /*int*/ modelServiceCostMultiplier, /*int*/ classServiceCost)
{
    if (modelServiceCostMultiplier === null || modelServiceCostMultiplier === undefined) {
        modelServiceCostMultiplier = 1;
    }
    if (classServiceCost === null || classServiceCost === undefined) {
        classServiceCost = 1;
    }

    return serviceCostMultipliers.map(function(multiplier) {
        return Math.round(multiplier * modelServiceCostMultiplier * classServiceCost);
    });
}

// Module: ServiceUtilities
function CalculateServicingTimes(/*object*/ model, /*object*/ classCosts) {
    if (model.ServiceTimeMultiplier === null || model.ServiceTimeMultiplier === undefined) {
        model.ServiceTimeMultiplier = 1;
    }

    return classCosts.ServiceTimeInMinutes.map(function(serviceTime) {
        return Math.round(serviceTime * model.ServiceTimeMultiplier);
    });
}

// Module: ServiceUtilities
function CalculateLapsBeforeService(/*object*/ model, /*object*/ classBaseCosts, /*object*/ servicingGlobalCosts) {
    var lapsBeforeServices = [];

    if (model.InitialServiceIntervalMultiplier === null || model.InitialServiceIntervalMultiplier === undefined) {
        model.InitialServiceIntervalMultiplier = 1;
    }
    if (model.LapDeductionProportionMultiplier === null || model.LapDeductionProportionMultiplier === undefined) {
        model.LapDeductionProportionMultiplier = 1;
    }

    var initialLaps = (classBaseCosts.LapsBeforeServiceWhenNew * model.InitialServiceIntervalMultiplier);

    var numEntries = servicingGlobalCosts.ServerData.NumServicesWhichDeductInterval;

    for (var i = 0; i < numEntries; ++i) {
        var lapsBeforeService = initialLaps *
            (1 - (i * servicingGlobalCosts.ServerData.LapDeductionProportion * model.LapDeductionProportionMultiplier));

        lapsBeforeService = Math.round(lapsBeforeService);

        if (lapsBeforeService < 1) {
            Spark.getLog().error(FormatString(
                "Eh? lapsBeforeService drops below 1 (is:{0}) for service: {1} for model {2}. Setting to 1!",
                lapsBeforeService,
                i,
                carModel));

            break;
        }

        lapsBeforeServices.push(lapsBeforeService);
    }

    //Spark.getLog().info(FormatString("lapsBeforeServices: {0}", JSON.stringify(lapsBeforeServices)));

    return lapsBeforeServices;
}

// Module: ServiceUtilities
// Also called from CarInventoryUtilities.
// classCosts need to be pre-chosen to be either the base class costs or the pro-pack class costs.
function GetLapsBeforeService(/*object*/ model, /*object*/ classCosts, /*object*/ servicingGlobalCosts, /*int*/ numServicesDone) {
    var lapsBeforeService = CalculateLapsBeforeService(model, classCosts, servicingGlobalCosts);

    return GetServicingItem(lapsBeforeService, numServicesDone);
}

// Module: ServiceUtilities
// See GetCurrentServiceCashCost() in client code. classCosts need to be pre-chosen to be either the base class
// costs or the pro-pack class costs.
function GetCurrentServiceCashCost(/*object*/ car,  /*object*/ model, /*object*/ classCosts,
    /*object*/ servicingGlobalCosts, /*int*/ numServicesDone) {
    var upgradeStatus = car.Status.CarUpgradeStatus;

    const S1 = 1
    const S2 = S1 + 1;

	const proPack = 1;

    var servicingCosts;

    if (upgradeStatus.PowerStage > S1 ||
        upgradeStatus.WeightStage > S1 ||
        upgradeStatus.HandlingStage > S1 ||
        upgradeStatus.BrakingStage > S1) {
        if (upgradeStatus.PowerStage > S2 ||
            upgradeStatus.WeightStage > S2 ||
            upgradeStatus.HandlingStage > S2 ||
            upgradeStatus.BrakingStage > S2 ||
            upgradeStatus.PackFitted > proPack) {
            servicingCosts = CalculateServicingCosts(servicingGlobalCosts.ServerData.ServiceCostMultiplier,
                model.ServiceCostMultiplier,
                classCosts.ServiceCosts[2]);
        }
        else {
            servicingCosts = CalculateServicingCosts(servicingGlobalCosts.ServerData.ServiceCostMultiplier,
                model.ServiceCostMultiplier,
                classCosts.ServiceCosts[1]);
        }
    }
    else {
        servicingCosts = CalculateServicingCosts(servicingGlobalCosts.ServerData.ServiceCostMultiplier,
            model.ServiceCostMultiplier,
            classCosts.ServiceCosts[0]);
    }

    return GetServicingItem(servicingCosts, numServicesDone);
}

// Module: ServiceUtilities
// After we fit a ProPack we effectively give a free service, which doesn't increment the number of services done,
// or ever reduce the number of laps of the car durability.
function ServiceCarAfterProPackFit(/*object*/ car, /*object*/ model, playerId) {
    var servicingSetupByClassCollection = GetServicingSetupByClassCollection(playerId);
    var carClass = model.ClientData.Class;
    var classCosts;
    // do we have a ProPack fitted?
    if (car.Status.CarUpgradeStatus.PackFitted === 1) {
        var classWithProPack = ClassWithProPackForCosts(carClass);
        classCosts = servicingSetupByClassCollection.findOne({"Class": classWithProPack});
    }
    else {
        ErrorMessage(FormatString(
            "Trying to service a car [{0}:{1}] after ProPack fit, but there isn't a ProPack fitted! (Pack fitted: {2})",
            car.CarVariantID, car.CarID, car.Status.CarUpgradeStatus.PackFitted));
        return;
    }

    var servicingGlobalSetupCollection = GetServicingGlobalSetupCollection(playerId);
    var servicingGlobalCosts = servicingGlobalSetupCollection.findOne();

    ServiceCarAfterProPackFitWorker(car, model, classCosts, servicingGlobalCosts);
}

// Module: ServiceUtilities
// After we fit a ProPack we effectively give a free service, which doesn't increment the number of services done,
// or ever reduce the number of laps of the car durability.
function ServiceCarAfterProPackFitWorker(/*object*/ car, /*object*/ model, /*object*/ classCosts, /*object*/ servicingGlobalCosts) {
    var newNumLaps = GetLapsBeforeService(model, classCosts, servicingGlobalCosts, car.Status.NumServicesDone);

    if (newNumLaps > car.Status.Durability) {
        // Set values back in the car details
        car.Status.MaxDurability = newNumLaps;
        car.Status.Durability = newNumLaps;
    }
    else {
        // this can happen, legitimately, let it ...
    }
}

// Module: ServiceUtilities
function ServiceCar(/*object*/ car, /*object*/ model, /*object*/ classCosts, /*object*/ servicingGlobalCosts) {
    var newNumServicesDone = car.Status.NumServicesDone + 1

    var newNumLaps = GetLapsBeforeService(model, classCosts, servicingGlobalCosts, newNumServicesDone);

    if (newNumLaps > car.Status.Durability) {
        // Set values back in the car details
        car.Status.MaxDurability = newNumLaps;
        car.Status.Durability = newNumLaps;

        car.Status.NumServicesDone = newNumServicesDone;

        // turn upgrades back on
        car.Status.RacingWithWTELaps = false;
    }
    else {
        // Should be prevented elsewhere, but here we've done a service which would award less laps than we
        // already have. We won't refund the money, but at least don't reduce the lap count, or increment the
        // service count
        Spark.getLog().error(FormatString(
            "Completing car service which would decrease the car lap count from: {0} to {1}. Should never have let " +
            "this car be serviced. We won't count this service or decrease the lap count",
            car.Status.Durability,
            newNumLaps));
    }

    // done!
    car.Timers.ServiceCompletionTime = 0;

    return true;
}

// Module: ServiceUtilities
function GetCurrentGoldServicingExpediteCost(/*object*/ model, /*object*/ classCosts, /*object*/ servicingGlobalCosts,
    /*int*/ numServicesDone, /*number*/ timeRemainingSeconds) {
    var timeRemainingMinutes = Math.floor(timeRemainingSeconds / 60);

    if (timeRemainingMinutes < servicingGlobalCosts.ClientData.ExpediteFreeMinutesRemaining)
        return 0;

    var timeMinutes = GetCurrentServicingTimeMinutes(model, classCosts, numServicesDone);

    if (timeMinutes < 0)
        return timeMinutes;

    return Math.ceil(timeMinutes / servicingGlobalCosts.ClientData.ServiceTimeToExpediteCost);
}

// Module: ServiceUtilities
function GetCurrentServicingTimeMinutes(/*object*/ model, /*object*/ classCosts, /*int*/ numServicesDone) {
    var servicingTimes = CalculateServicingTimes(model, classCosts);

    return GetServicingItem(servicingTimes, numServicesDone);
}

// Module: ServiceUtilities
function GetCurrentServicingTimeSeconds(/*object*/ model, /*object*/ classCosts, /*int*/ numServicesDone) {
    var duration =  GetCurrentServicingTimeMinutes(model, classCosts, numServicesDone) * 60;

    // Spark.getLog().info(FormatString("Car with numServicesDone: {0} has duration of {1}s / {2}m",
    //     numServicesDone,
    //     duration,
    //     duration / 60));

    return duration;
}

// Module: ServiceUtilities
function GetServicingItem(/*array*/ collection, /*int*/ numServicesDone)
{
    if (numServicesDone < collection.length) {
        return collection[numServicesDone];
    }
    else {
        return collection[collection.length - 1];
    }
}

// Module: ServiceUtilities
function ServiceLapsWTE(variantId, carId, lapsToAdd, playerId) {
    var carToService = GetPlayerCar(variantId, carId, playerId);
    if (carToService === null) {
        return;
    }

    var maxCarLapsWhichPermitsWTE = 1;

    if (carToService.Status.Durability > maxCarLapsWhichPermitsWTE) {
        // XXX ALTERNATE STATUS
        // can only WTE laps when you really have nothing left
        var errorMessage = FormatString(
            "Can't WTE laps when car laps {0} are above {1}",
            carToService.Status.Durability,
            maxCarLapsWhichPermitsWTE);
        Spark.getLog().error(errorMessage);
        return;
    }

    if (carToService.Status.LastWTELapTime === null || carToService.Status.LastWTELapTime === undefined) {
        carToService.Status.LastWTELapTime = 0;
    }

    var carModelsCollection = GetCarModelsCollection(playerId);
    var model = carModelsCollection.findOne({"Model": carToService.Item.Model});

    var servicingSetupByClassCollection = GetServicingSetupByClassCollection(playerId);
    var carClass = model.ClientData.Class;
    var classCosts;
    // do we have a ProPack fitted?
    if (carToService.Status.CarUpgradeStatus.PackFitted > 0) {
        var classWithProPack = ClassWithProPackForCosts(carClass);
        classCosts = servicingSetupByClassCollection.findOne({"Class": classWithProPack});
    }
    else {
        classCosts = servicingSetupByClassCollection.findOne({"Class": carClass});
    }

    var durationSeconds = classCosts.MinutesBetweenVideoWatch * 60;

    var completionTimeSeconds = carToService.Status.LastWTELapTime + durationSeconds;

    var now = Math.ceil(GetNow() / 1000); // Seconds, and don't quibble over < 1s

    if (now < completionTimeSeconds) {
        Spark.getLog().warn(FormatString("Game is trying to award WTE laps for car ({0}:{1}) when it's too early. Complete at: {2}, now: {3}, remaining: {4}",
            variantId,
            carId,
            completionTimeSeconds,
            now,
            completionTimeSeconds - now));

        // XXX ALTERNATE STATUS
        return;
    }

    // deny upgrades until we next service
    carToService.Status.RacingWithWTELaps = true;

    // ok, do it!
    carToService.Status.Durability = carToService.Status.Durability + lapsToAdd;

    // although we are having to trust the client for the number of laps to add it should never go above the
    // current MaxDurability
    carToService.Status.Durability = Math.min(carToService.Status.Durability, carToService.Status.MaxDurability);

    var now = Math.floor(GetNow() / 1000); // Seconds
    carToService.Status.LastWTELapTime = now;

    SetPlayerCar(variantId, carId, playerId, carToService);
}

// Module: ServiceUtilities
function ServiceExpediteWTE(variantId, carId, timeMinutesToExpedite, playerId) {
    var carToService = GetPlayerCar(variantId, carId, playerId);
    if (carToService === null) {
        return;
    }

    var completionTime = carToService.Timers.ServiceCompletionTime;
    if (completionTime === undefined || completionTime === null || completionTime === 0) {
        ErrorMessage("Can't WTE expedite a car that is not being serviced");
        // car is not being serviced, no insta-service
        return;
    }

    completionTime = completionTime - (timeMinutesToExpedite * 60);

    carToService.Timers.ServiceCompletionTime = completionTime;

    SetPlayerCar(variantId, carId, playerId, carToService);
}